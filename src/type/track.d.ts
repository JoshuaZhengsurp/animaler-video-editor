type TrackItemType = 'video' | 'audio';

interface Track {
    id: string;
    type?: TrackItemType;
    duration: number;
    startTime: number;
    resolution: {
        width: number | string;
        height: number | string;
        ratio: number;
    };
    path: string;
    trackWidth: number;
    // frames?: VideoFrame[];
    // audioData?: AudioData;
}
