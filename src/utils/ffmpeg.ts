import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

class FFmpegManager {
    ffmpeg: FFmpeg;

    constructor() {
        this.ffmpeg = new FFmpeg();
    }

    async init() {
        try {
            const baseURL = import.meta.env.VITE_APP_BASE_FFMPEG_URL;
            this.ffmpeg.on('log', ({ message }) => {
                console.log('log', message);
            });
            await this.ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
        } catch (error) {
            console.error('Failed to init ffmpeg', error);
        }
    }
}

const ffmpegManager = new FFmpegManager();

export { ffmpegManager };

const FFmpegInstance = new FFmpeg();

export { FFmpegInstance };
