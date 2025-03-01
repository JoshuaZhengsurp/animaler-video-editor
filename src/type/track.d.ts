type TrackItemType = 'video' | 'audio';

interface Track {
    id: string;
    type: TrackItemType;
    frames?: VideoFrame[];
    audioData?: AudioData;
    startTime: number;
    duration: number;
}
