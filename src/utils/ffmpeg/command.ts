// import type { TrackItem, VideoTractItem, AudioTractItem } from '@/stores/trackState';

/**
 * 根据视频名称生成 AAC 音频文件路径
 * @param path - 目录路径
 * @param videoName - 视频文件名（不含扩展名）
 * @returns AAC 音频文件的完整路径
 */
export function genVideoAAC(path: string, videoName: string) {
    return `${path}${videoName}_A.aac`;
}

/**
 * 将视频文件中的音频分离出来
 * @param path - 目录路径
 * @param videoName - 视频文件名（不含扩展名）
 * @param format - 视频文件格式/扩展名
 * @returns 包含 FFmpeg 命令和文件路径的对象
 */
export function splitAudio(path: string, videoName: string, format: string) {
    const audioPath = genVideoAAC(path, videoName);
    const videoPath = `${path}${videoName}.${format}`;
    return {
        commands: ['-v', 'quiet', '-i', videoPath, '-acodec', 'copy', '-vn', audioPath],
        videoPath,
        audioPath,
        audioName: genVideoAAC('', videoName),
    };
}

/**
 * 从视频文件中提取帧
 * @param filePath - 输入视频文件路径
 * @param framePath - 帧输出目录
 * @param size - 包含帧宽度和高度的对象
 * @param format - 输出格式（'video' 或 'gif'）
 * @param fps - 提取的帧率（默认：30）
 * @returns 包含 FFmpeg 命令的对象
 */
export function genFrame(
    filePath: string,
    framePath: string,
    size: { w: number; h: number },
    format = 'video',
    fps = 30,
) {
    if (format === 'gif') {
        const fileName = '/gif-%d.png';
        return {
            commands: [
                '-i',
                filePath,
                '-s',
                `${size.w}x${size.h}`,
                '-vf',
                'colorkey=white:0.01:0.0',
                `${framePath}${fileName}`,
            ],
        };
    } else {
        const fileName = '/pic-%d.jpg';
        return {
            commands: [
                '-i',
                filePath,
                '-vf',
                `fps=${fps}`,
                '-s',
                `${size.w}x${size.h}`,
                `${framePath}${fileName}`,
            ],
        };
    }
}

/**
 * 从视频的指定时间段提取帧
 * @param videoPath - 输入视频文件路径
 * @param framePath - 帧输出目录
 * @param size - 包含帧宽度和高度的对象
 * @param time - 开始时间（秒）
 * @param fps - 提取的帧率（默认：30）
 * @returns 包含 FFmpeg 命令的对象
 */
export function genPlayFrame(
    videoPath: string,
    framePath: string,
    size: { w: number; h: number },
    time: number,
    fps = 30,
) {
    const fileName = `pic-${time}-%d.jpg`;
    return {
        commands: [
            '-ss',
            `${time}`,
            '-i',
            videoPath,
            '-ss',
            `0`,
            '-t',
            `${1}`,
            '-vf',
            `fps=${fps}`,
            '-s',
            `${size.w}x${size.h}`,
            `${framePath}${fileName}`,
        ],
        playFramePrefix: `${framePath}pic-${time}-`,
    };
}

/**
 * 从视频中提取指定位置的单帧
 * @param videoPath - 输入视频文件路径
 * @param framePath - 帧输出目录
 * @param size - 包含帧宽度和高度的对象
 * @param start - 要提取的帧号
 * @returns 包含 FFmpeg 命令的对象
 */
export function genPlayIFrame(
    videoPath: string,
    framePath: string,
    size: { w: number; h: number },
    start: number,
) {
    const fileName = `/pic.jpg`;
    return {
        commands: [
            '-i',
            videoPath,
            '-vf',
            `select=eq(n\\,${start})`,
            '-s',
            `${size.w}x${size.h}`,
            '-vframes',
            `1`,
            `${framePath}${fileName}`,
        ],
    };
}

/**
 * 从音频文件生成波形可视化图像
 * @param audioPath - 输入音频文件路径
 * @param videoName - 视频文件名（用于输出文件命名）
 * @param wavePath - 波形图像输出目录
 * @param frameCount - 要分析的帧数
 * @returns 包含 FFmpeg 命令和输出文件名的对象
 */
export function genWave(
    audioPath: string,
    videoName: string,
    wavePath: string,
    frameCount: number,
) {
    const fileName = `${videoName}.png`;
    return {
        commands: [
            '-i',
            audioPath,
            '-filter_complex',
            `aformat=channel_layouts=mono,compand,showwavespic=s=${frameCount * 5}x32:colors=yellow`,
            '-frames:v',
            '1',
            `${wavePath}${fileName}`,
        ],
        fileName,
    };
}

export function transcodeFromAvi2Mp4(inputPath: string, outputPath: string) {
    return {
        commands: [
            '-i',
            inputPath,
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
            '-frag_duration',
            '1000',
            '-y',
            outputPath,
        ],
    };
}
