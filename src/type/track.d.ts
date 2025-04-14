type TrackItemType = 'video' | 'audio';

interface TrackItem {
    id: string;
    type?: TrackItemType;
    path: string; // track资源路径
    resourceId: string; // track资源id
    duration: number; // 音轨占用时长
    startTime: number; // 音轨中播放的时间
    startLeft: number; // 音轨中左侧位置，用left定位
    playStartTime: number; // 对应资源开始播放时间
    playEndTime: number; // 对应资源结束播放时间
    trackIndex: number;
    trackWidth?: number;
    frames?: VideoFrame[];
}
