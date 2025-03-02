import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import {
    IS_SHOW_FFMPEG_LOG,
    IS_SHOW_TRANCODE_STATUS,
    PATH_CONFIG,
    START_FRAME_INDEX_KEY,
} from '../const';
import { getMetaDataWithTranMessage, TransLogProcessState } from '../common';
import { nanoid } from 'nanoid';
import { genPlayFrame, transcodeFromAvi2Mp4 } from './command';

/**
 * @description
 * 对ffmpeg.wasm封装
 */

class FFmpegManager {
    ffmpeg: FFmpeg;

    public isLoading: boolean = false;
    public isLogShow: boolean = false;
    public isTranCodeShow: boolean = false;
    //
    public metadata: Record<string, any> = {};
    public videoPFrameMap: Map<string, PFrameMap> = new Map(); // 映射播放帧

    private tranCoding = false;
    private currentTranVideoId: string = '';
    private curMetaData: Record<string, any> = {
        data: this.metadata,
        last: null,
    };
    private resourcePath = PATH_CONFIG;

    constructor() {
        this.ffmpeg = new FFmpeg();
    }

    /* 初始配置文件 */
    async init() {
        try {
            const baseURL = import.meta.env.VITE_APP_BASE_FFMPEG_URL;
            // const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';

            this.showLog();

            await this.ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            await this.mkdirList(this.resourcePath);
            this.isLoading = true;
        } catch (error) {
            console.error('Failed to init ffmpeg', error);
        }
    }

    /* 创建ffmepg资源目录 */
    async mkdirList(dirList: string[] | Record<string, string>) {
        let list = dirList as string[];
        if (!Array.isArray(dirList)) {
            list = [];
            for (const key in dirList) {
                list.push(dirList[key]);
            }
        }
        const promiseList = list.map((dir) => this.mkdir(dir));
        return Promise.all(promiseList);
    }

    async mkdir(dir: string) {
        return this.ffmpeg.createDir(dir);
    }

    async checkDirExist(path: string, targetDir: string) {
        const list = await this.ffmpeg.listDir(path);
        console.log('checkDirExist0', list);
        // debugger;
        if (list.length > 2) {
            const len = list.length;
            for (let i = 2; i < len; ++i) {
                if (list[i].name === targetDir && list[i].isDir) {
                    return true;
                }
            }
        }
        return false;
    }

    /* 读取媒体文件 */
    async readMediaFile(file: File) {
        const data = await file.arrayBuffer();
        const fileName = file.name;
        await this.ffmpeg.writeFile(fileName, new Uint8Array(data));
        return fileName;
    }

    /* 转码，例如mp4 */
    async transcode(options: Partial<TranCodeOptions>) {
        this.currentTranVideoId = nanoid(9);
        const { fileName, type: originType } = options;
        const ffmpeg = this.ffmpeg;

        const inputFile = `${this.currentTranVideoId}_${fileName || ''}_i.avi`;
        const outputFile = `${this.currentTranVideoId}_${fileName || ''}_o.mp4`;

        const { commands } = transcodeFromAvi2Mp4(inputFile, outputFile);

        // console.log('currentTranVideoId', this.currentTranVideoId, fileName);

        try {
            await ffmpeg.deleteFile(inputFile);
            await ffmpeg.deleteFile(outputFile);
        } catch {
            console.log('No files to delete');
        }

        try {
            if (originType === 'LOCAL') {
                await ffmpeg.writeFile(inputFile, options.uri as Uint8Array<ArrayBuffer>);
            } else {
                const videoURL = options.uri as string;
                const videoData = await fetchFile(videoURL);
                await ffmpeg.writeFile(inputFile, videoData);
            }
            console.log('[log]', '开始转码...');
            this.tranCoding = true;

            await ffmpeg.exec(commands, 1200000);

            const fileData = await ffmpeg.readFile(outputFile);
            const data = new Uint8Array(fileData as ArrayBuffer);
            console.log('result finally', this.metadata);
            return { data, id: this.currentTranVideoId, outputFile, info: this.metadata };
        } catch (error) {
            console.error('transcode failed', error);
        } finally {
            this.tranCoding = false;
            this.currentTranVideoId = '';
        }
    }

    async getFileBlob(fileName: string) {
        const data = await this.ffmpeg.readFile(fileName);
        return new Blob([data], { type: 'audio/mp3' });
    }

    async cleanup(fileNames: string[]) {
        for (const fileName of fileNames) {
            try {
                await this.ffmpeg.deleteFile(fileName);
            } catch (error) {
                console.warn(`Failed to delete file ${fileName}:`, error);
            }
        }
    }

    async exec(args: string[], timeout: number) {
        return timeout ? this.ffmpeg.exec(args, timeout) : this.ffmpeg.exec(args);
    }

    /**
     * @todo 对帧需要进行唯一标识
     */
    async extractFrame({ inputFile, time, w = 0, h = 0, fps, frameIndex }: ExtractFrameOptions) {
        try {
            console.log(time, fps);
            const isExistFrameDir = await this.checkDirExist(
                this.resourcePath.playFrame,
                `${time}`,
            );
            if (isExistFrameDir) {
                const frameBlob = await this.getPlayFrame({
                    inputFile,
                    time,
                    frameIndex: frameIndex ?? 1,
                });
                return {
                    firstFrame: frameBlob,
                };
            }
            await this.mkdir(`${this.resourcePath.playFrame}${time}/`);

            /**
             * @todo 关于#FRAME#，是否需要保留，需再考虑
             */
            if (!this.videoPFrameMap.has(inputFile)) {
                this.videoPFrameMap.set(inputFile, {
                    [START_FRAME_INDEX_KEY]: [],
                });
            }
            /**
             * 假设帧的解析是有序的
             */
            const map = this.videoPFrameMap.get(inputFile)!;
            map[time] = `${this.resourcePath.playFrame}${time}/`;
            map[START_FRAME_INDEX_KEY]?.push(time);

            const { commands, playFramePrefix } = genPlayFrame(
                inputFile,
                `${this.resourcePath.playFrame}${time}/`,
                { w, h },
                time,
                fps,
            );

            await this.ffmpeg.exec(commands);

            console.log(`${playFramePrefix}${frameIndex ?? 1}.jpg`);

            const firstFrameData = await this.ffmpeg.readFile(
                `${playFramePrefix}${frameIndex ?? 1}.jpg`,
            );
            return {
                playFramePrefix,
                firstFrame: new Blob([firstFrameData], { type: 'image/jpeg' }),
            };
        } catch (error) {
            console.error('Failed to extract frame:', error);
            throw error;
        }
    }

    /**
     * @todo 建立预缓存机制，有效利用内存空间的同时减缓缓冲时间
     */
    async getPlayFrame({ inputFile, time, frameIndex }: GetPlayFrameOptions) {
        /**
         * @todo 如果存在这个切片走缓存
         */
        const framePath = `${this.resourcePath.playFrame}${time}/pic-${time}-${frameIndex}.jpg`;
        console.log('getPlayFrame', framePath);
        return new Blob([await this.ffmpeg.readFile(framePath)], { type: 'image/jpeg' });
    }

    private showLog() {
        this.isLogShow = import.meta.env.VITE_APP_FFMPEG_LOG === 'true' && IS_SHOW_FFMPEG_LOG;
        this.isTranCodeShow = IS_SHOW_TRANCODE_STATUS;

        const getMetaDataWithLog = ({ message }: { message: string }) => {
            const { transLogProcessState, spaces, propName, newCurMetaData } =
                getMetaDataWithTranMessage(
                    message,
                    this.curMetaData,
                ) as MetaDataWithTranMessageType;
            if (
                (transLogProcessState === TransLogProcessState.LAST ||
                    transLogProcessState === TransLogProcessState.NO_CHANGE) &&
                newCurMetaData
            ) {
                this.curMetaData = newCurMetaData;
                if (propName) {
                    const tmp = {
                        data: this.curMetaData.data?.[propName],
                        last: this.curMetaData,
                        spaces: spaces,
                    };
                    this.curMetaData = tmp;
                }
            } else if (transLogProcessState === TransLogProcessState.NEXT && propName) {
                const tmp = {
                    data: this.curMetaData.data?.[propName],
                    last: this.curMetaData,
                    spaces: spaces,
                };
                this.curMetaData = tmp;
            } else if (
                transLogProcessState === TransLogProcessState.INIT &&
                this.curMetaData.data !== this.metadata
            ) {
                this.curMetaData = {
                    data: this.metadata,
                    last: null,
                };
            }
        };

        this.ffmpeg.on('log', getMetaDataWithLog);

        if (this.isLogShow) {
            this.ffmpeg.on('log', ({ message }) => {
                console.log('[log]', message);
            });
        }
        if (this.isTranCodeShow) {
            this.ffmpeg.on('progress', ({ progress, time }) => {
                console.log('[log] progress:', progress, '时间:', time);
            });
        }
    }

    /**
     * @deprecated 目前不采用这种方式
     */
    async convertToMp3(inputFileName: string, outputFileName: string) {
        try {
            await this.ffmpeg.exec([
                '-i',
                inputFileName,
                '-vn',
                '-acodec',
                'libmp3lame',
                '-q:a',
                '2',
                outputFileName,
            ]);
            return await this.ffmpeg.readFile(outputFileName);
        } catch (error) {
            console.error('Failed to convert to MP3:', error);
            throw error;
        }
    }

    /**
     * @deprecated 目前不采用这种方式获取视频信息
     */
    async getVideoDuration(path: string) {
        try {
            const res = await this.ffmpeg.exec(['-i', path, '-f', 'null', '-']);
            console.log('getVideoDuration', res);
            return this.metadata.duration;
        } catch (error) {
            console.error('Failed to get video duration:', error);
            throw error;
        }
    }
}

const ffmpegManager = new FFmpegManager();

export { ffmpegManager };
