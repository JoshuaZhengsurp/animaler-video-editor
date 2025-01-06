import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { IS_SHOW_FFMPEG_LOG } from './const';

/**
 * @description
 * 对ffmpeg封装
 */
class FFmpegManager {
    ffmpeg: FFmpeg;

    public isLoading: boolean = false;
    public isLogShow: boolean = false;

    constructor() {
        this.ffmpeg = new FFmpeg();
    }

    /* 初始配置文件 */
    async init() {
        this.isLogShow = import.meta.env.VITE_APP_FFMPEG_LOG === 'true' && IS_SHOW_FFMPEG_LOG;

        try {
            const baseURL = import.meta.env.VITE_APP_BASE_FFMPEG_URL;
            // const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';

            if (this.isLogShow) {
                this.showLog();
            }

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
    async transcode() {}

    async convertToMp3(inputFileName: string, outputFileName: string) {
        try {
            await this.ffmpeg.exec(['-i', inputFileName, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', outputFileName]);
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

    private showLog(config?: Record<string, any>) {
        this.ffmpeg.on('log', ({ message }) => {
            console.log('log', message);
        });
    }
}

const ffmpegManager = new FFmpegManager();

export { ffmpegManager };
