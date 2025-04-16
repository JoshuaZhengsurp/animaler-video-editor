type TrackItemType = 'video' | 'audio' | 'image' | 'text';

interface TrackItem {
    id: string;
    type: TrackItemType;
    path: string; // track资源路径
    resourceId: string; // track资源id
    duration: number; // 音轨占用时长
    startTime: number; // 音轨中播放的时间
    startLeft: number; // 音轨中左侧位置，用left定位
    playStartTime: number; // 对应资源开始播放时间
    playEndTime: number; // 对应资源结束播放时间
    trackIndex: number;
    trackWidth?: number;
}
interface BaseTrackItem {
    id: string;
    type?: TrackItemType;
    path: string; // track资源路径
    resourceId: string; // track资源id
    duration: number; // 音轨占用时长
    startTime: number; // 音轨中播放的时间
    startLeft: number; // 音轨中左侧位置，用left定位
    trackIndex: number;
    trackWidth?: number;
}

interface VideoTrackItem {
    id: string;
    type: 'video';
    path: string; // track资源路径
    resourceId: string; // track资源id
    duration: number; // 音轨占用时长
    startTime: number; // 音轨中播放的时间
    startLeft: number; // 音轨中左侧位置，用left定位
    playStartTime: number; // 对应资源开始播放时间
    playEndTime: number; // 对应资源结束播放时间
    trackIndex: number;
    trackWidth?: number;
}

interface TextTrackItem extends BaseTrackItem {
    type: 'text';
}

interface ImageTrackItem extends BaseTrackItem {
    type: 'image';
    playerPosition: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
        realWidth: number;
        realHeight: number;
    };
}

// export type TrackItem = VideoTrackItem | AudioTrackItem | ImageTrackItem | TextTrackItem;

// Type guards
// export function isVideoTrackItem(item: TrackItem): item is VideoTrackItem {
//     return item.type === 'video';
// }

// export function isAudioTrackItem(item: TrackItem): item is AudioTrackItem {
//     return item.type === 'audio';
// }

// export function isImageTrackItem(item: TrackItem): item is ImageTrackItem {
//     return item.type === 'image';
// }

// export function isTextTrackItem(item: TrackItem): item is TextTrackItem {
//     return item.type === 'text';
// }
