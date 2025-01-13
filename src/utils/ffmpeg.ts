import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { IS_SHOW_FFMPEG_LOG, IS_SHOW_TRANCODE_STATUS } from './const';
import { getMetaDataWithTranMessage } from './common';
import { nanoid } from 'nanoid';

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

    private tranCoding = false;
    private currentTranVideoId: string = '';

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
            this.isLoading = true;
        } catch (error) {
            console.error('Failed to init ffmpeg', error);
        }
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
        const {
            inputFile = `${this.currentTranVideoId}_input.avi`,
            outputFile = `${this.currentTranVideoId}_output.mp4`,
        } = options;
        const ffmpeg = this.ffmpeg;

        // console.log('currentTranVideoId', this.currentTranVideoId);

        try {
            await ffmpeg.deleteFile('input.avi');
            await ffmpeg.deleteFile('output.mp4');
        } catch {
            console.log('No files to delete');
        }

        try {
            if (options.type === 'LOCAL') {
                await ffmpeg.writeFile(inputFile, options.uri as Uint8Array<ArrayBuffer>);
            } else {
                const videoURL = options.uri as string;
                const videoData = await fetchFile(videoURL);
                await ffmpeg.writeFile(inputFile, videoData);
            }
            console.log('[log]', '开始转码...');
            this.tranCoding = true;

            await ffmpeg.exec(
                [
                    '-i',
                    inputFile,
                    '-c:v',
                    'libx264',
                    '-preset',
                    'ultrafast',
                    '-pix_fmt',
                    'yuv420p', // 强制使用 yuv420p 像素格式
                    '-vf',
                    'format=yuv420p', // 添加视频过滤器确保正确的格式转换
                    '-threads',
                    '1', // 使用单线程处理
                    '-g',
                    '35', // GOP大小设置为帧率
                    '-movflags',
                    '+faststart',
                    '-y',
                    outputFile,
                ],
                1200000,
            );

            const fileData = await ffmpeg.readFile(outputFile);
            const data = new Uint8Array(fileData as ArrayBuffer);
            return { data, id: this.currentTranVideoId, outputFile };
        } finally {
            this.tranCoding = false;
            this.currentTranVideoId = '';
        }
    }

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

    async getVideoDuration(path: string) {}

    private showLog() {
        this.isLogShow = import.meta.env.VITE_APP_FFMPEG_LOG === 'true' && IS_SHOW_FFMPEG_LOG;
        this.isTranCodeShow = IS_SHOW_TRANCODE_STATUS;

        const getMetaDataWithLog = ({ message }: { message: string }) => {
            getMetaDataWithTranMessage(message, this.metadata);
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
}

const ffmpegManager = new FFmpegManager();

export { ffmpegManager };
