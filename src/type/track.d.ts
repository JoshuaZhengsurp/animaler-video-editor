type TrackItemType = 'video' | 'audio';

interface TrackItem {
    id: string;
    type?: TrackItemType;
    path: string; // track资源路径
    resourceId: string; // track资源id
    duration: number;
    startTime: number;
    startLeft: number;
    trackIndex: number;
    trackWidth?: number;
    frames?: VideoFrame[];
}
