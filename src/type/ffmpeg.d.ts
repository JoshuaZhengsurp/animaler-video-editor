/**
 * @description FFmpeg 转码配置项
 * @interface TranCodeOptions
 * @property {string} type - 转码类型
 * @property {string | Uint8Array<ArrayBufferLike>} uri - 文件URI
 * @property {string} inputFileName - 输入文件名
 * @property {Array<string> | string} execCmd - 执行命令
 * @property {string} outputFile - 输出文件名
 * @property {unknown} [propName: string] - 其他属性
 */
interface TranCodeOptions {
    type: string;
    uri: string | Uint8Array<ArrayBufferLike>;
    fileName: string;
    execCmd: Array<string> | string;
    outputFile: string;
    [propName: string]: unknown;
}

type MetaDataWithTranMessageType = {
    transLogProcessState: TransLogProcessState;
    spaces?: number;
    propName?: string;
    newCurMetaData?: Record<string, any>;
};

interface ExtractFrameOptions {
    inputFile: string;
    time: number;
    outputFile?: string;
    w: number;
    h: number;
}

interface VideoFrame {
    time: number;
    image: string;
}

interface AudioData {
    waveform: number[]; // 音频波形数据
    duration: number;
}
