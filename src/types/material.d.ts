// 素材类型枚举
enum MaterialType {
    VIDEO = 'video', // 视频
    AUDIO = 'audio', // 音频
    TEXT = 'text', // 文字
    IMAGE = 'image', // 图片
    RECORDING = 'recording', // 录播
}

// 基础变换接口
interface Transform {
    x: number; // X轴位置
    y: number; // Y轴位置
    width: number; // 宽度
    height: number; // 高度
    rotation: number; // 旋转角度
    scale: {
        // 缩放
        x: number;
        y: number;
    };
    opacity: number; // 透明度 (0-1)
    zIndex: number; // 层级
}

// 时间轴相关属性
interface Timeline {
    startTime: number; // 在时间轴上的开始时间（毫秒）
    endTime: number; // 在时间轴上的结束时间（毫秒）
    speed: number; // 播放速度倍率
    loop?: boolean; // 是否循环播放
    trimStart?: number; // 素材裁剪起始点
    trimEnd?: number; // 素材裁剪结束点
}

// 效果接口
interface Effect {
    id: string;
    type: string;
    params: Record<string, any>;
    startTime: number;
    endTime: number;
}

// 滤镜接口
interface Filter {
    id: string;
    type: string;
    params: Record<string, any>;
}

// 素材基础接口
interface BaseMaterial {
    id: string;
    name: string;
    type: MaterialType;
    createTime: number;
    duration?: number; // 素材原始持续时长（毫秒）
    path: string; // 素材路径
    transform: Transform; // 变换属性
    timeline: Timeline; // 时间轴属性
    effects?: Effect[]; // 效果列表
    filters?: Filter[]; // 滤镜列表
}

// 文字素材
interface TextMaterial extends BaseMaterial {
    type: MaterialType.TEXT;
    content: string; // 文字内容
    fontSize: number; // 字体大小
    fontFamily: string; // 字体
    color: string; // 颜色
    alignment: 'left' | 'center' | 'right'; // 对齐方式
    bold: boolean; // 是否加粗
    italic: boolean; // 是否斜体
    letterSpacing?: number; // 字间距
    lineHeight?: number; // 行高
    backgroundColor?: string; // 背景色
    padding?: number; // 内边距
}

// 视频素材
interface VideoMaterial extends BaseMaterial {
    type: MaterialType.VIDEO;
    width: number; // 原始视频宽度
    height: number; // 原始视频高度
    fps: number; // 帧率
    bitrate?: number; // 比特率
    codec?: string; // 编码格式
    volume: number; // 音量 (0-1)
    muted: boolean; // 是否静音
    playbackRate: number; // 播放速率
}

// 音频素材
interface AudioMaterial extends BaseMaterial {
    type: MaterialType.AUDIO;
    sampleRate?: number; // 采样率
    channels?: number; // 声道数
    bitrate?: number; // 比特率
    volume: number; // 音量 (0-1)
    fadeIn?: number; // 淡入时长（毫秒）
    fadeOut?: number; // 淡出时长（毫秒）
}

// 图片素材
interface ImageMaterial extends BaseMaterial {
    type: MaterialType.IMAGE;
    width: number; // 原始图片宽度
    height: number; // 原始图片高度
    format?: string; // 图片格式
    resolution?: {
        // 分辨率
        x: number;
        y: number;
    };
    aspectRatio?: number; // 宽高比
}

// 录播素材
interface RecordingMaterial extends BaseMaterial {
    type: MaterialType.RECORDING;
    width: number; // 录制视频宽度
    height: number; // 录制视频高度
    fps: number; // 帧率
    startTime: number; // 录制开始时间
    endTime: number; // 录制结束时间
    segments?: string[]; // 录播片段列表
    volume: number; // 音量 (0-1)
    muted: boolean; // 是否静音
    quality: string; // 录制质量
    sourceInfo?: {
        // 录制源信息
        platform: string; // 平台
        roomId: string; // 房间ID
        userId: string; // 用户ID
    };
}

// 导出类型
export type Material =
    | VideoMaterial
    | AudioMaterial
    | TextMaterial
    | ImageMaterial
    | RecordingMaterial;

// 导出枚举和接口
export {
    MaterialType,
    Transform,
    Timeline,
    Effect,
    Filter,
    BaseMaterial,
    VideoMaterial,
    AudioMaterial,
    TextMaterial,
    ImageMaterial,
    RecordingMaterial,
};
