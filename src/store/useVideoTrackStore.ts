import { create } from 'zustand';
import { getNanoid } from '@/utils/common';

interface VideoTrackState {
    duration: number; // 视频总时长（秒）
    currentTime: number; // 当前播放时间（秒）
    trackWidth: number; // 轨道宽度（像素）
    timeLineCeilWidth: number; // 时间轴单位长度
    timeIntervalCeil: number;

    // 音轨数据
    selectedTrackId: string;
    tracks: TrackItem[];
    trackFrameMap: Record<string, VideoFrame[]>;

    // Actions
    setDuration: (duration: number) => void;
    setCurrentTime: (time: number) => void;
    setTrackWidth: (width: number) => void;
    setTimeLineCeilWidth: (ceil: number) => void;
    setTimeIntervalCeil: (t: number) => void;
    setSelectedTrackId: (trackId: string) => void;

    // getter
    getCurrentTime: () => number;
    getCurrentPositionByTime: (t: number) => number; // 计算当前时间对应的像素位置
    getCurrentTimeByPosition: (p: number) => number; // 计算当前像素对应的时间戳
    getTrackItem: (id: string) => TrackItem | null;

    addTrackItem: (trackItem: TrackItem, toTrackIndex?: number) => void;
    updateDuration: (tracks: TrackItem[]) => void;
    splitTrackItem: (selectedTrackId: string) => void;
}

const useVideoTrackStore = create<VideoTrackState>((set, get) => ({
    duration: 0, // 音轨编辑的总时长
    currentTime: 0,
    trackWidth: 0,
    timeLineCeilWidth: 0,
    timeIntervalCeil: 0,
    trackFrameMap: {},
    tracks: [],
    selectedTrackId: '',

    setDuration: (duration) => set({ duration }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setTrackWidth: (width) => set({ trackWidth: width }),
    setTimeLineCeilWidth: (ceil) => set({ timeLineCeilWidth: ceil }),
    setTimeIntervalCeil: (t) => set({ timeIntervalCeil: t }),
    setSelectedTrackId: (id) => set({ selectedTrackId: id }),

    getCurrentTime: () => {
        return get().currentTime;
    },
    getCurrentPositionByTime: (currentTime: number) => {
        const { timeIntervalCeil, timeLineCeilWidth } = get();
        if (currentTime === 0) {
            return 0;
        }
        return (currentTime / timeIntervalCeil) * timeLineCeilWidth;
    },
    getCurrentTimeByPosition: (position: number) => {
        const { timeIntervalCeil, timeLineCeilWidth, trackWidth } = get();
        // 对这段表示怀疑position > trackWidth
        if (position < 0 /* || position > trackWidth */) {
            return -1;
        }
        const currentTime = (position / timeLineCeilWidth) * timeIntervalCeil;
        return currentTime;
    },
    getTrackItem: (selectTrackId: string) => {
        return get().tracks.find((item) => item.id === selectTrackId) || null;
    },

    addTrackItem: (trackItem: TrackItem, toTrackIndex?: number) => {
        const { tracks, updateDuration, getCurrentPositionByTime } = get();
        const idx = tracks.findIndex((item) => {
            return item.id === trackItem.id;
        });
        const itemTrackIndex = toTrackIndex
            ? toTrackIndex
            : trackItem.trackIndex
              ? trackItem.trackIndex
              : tracks.length + 1;

        trackItem.trackIndex = itemTrackIndex;
        trackItem.trackWidth = getCurrentPositionByTime(trackItem.duration || 0);

        if (idx === -1) {
            set((s) => {
                console.log('set tracks', s.tracks, idx, trackItem);
                const newTracks = [...s.tracks, trackItem];
                updateDuration(newTracks);
                return { tracks: newTracks, selectedTrackId: trackItem.id };
            });
        } else {
            set((s) => {
                console.log('set tracks', s.tracks, idx, trackItem);
                s.tracks[idx] = trackItem;
                const newTracks = [...s.tracks];
                updateDuration(newTracks);
                return { tracks: newTracks, selectedTrackId: trackItem.id };
            });
        }
    },

    updateDuration: (tracks: TrackItem[]) => {
        let duration = 0;
        for (let i = 0; i < tracks.length; ++i) {
            duration = Math.max(duration, tracks[i].duration + tracks[i].startTime);
        }
        set({ duration });
    },

    splitTrackItem: (selectTrackId: string) => {
        const { getTrackItem, currentTime, getCurrentPositionByTime, addTrackItem } = get();
        const selectedTrackItem = getTrackItem(selectTrackId);
        if (
            selectedTrackItem &&
            selectedTrackItem.startTime < currentTime &&
            currentTime < selectedTrackItem.startTime + selectedTrackItem.duration
        ) {
            const trackIndex = selectedTrackItem.trackIndex;
            const leftTrackDuration = currentTime - selectedTrackItem.startTime;
            const rightTrackDuration =
                selectedTrackItem.startTime + selectedTrackItem.duration - currentTime;
            const leftTrackPlayEndTime = selectedTrackItem.playStartTime + leftTrackDuration; // 同时也是rightTrack play开始的时间戳
            const leftTrackItem: TrackItem = {
                ...selectedTrackItem,
                playEndTime: leftTrackPlayEndTime,
                duration: leftTrackDuration,
                trackWidth: getCurrentPositionByTime(leftTrackDuration),
            };
            const rightTrackItem: TrackItem = {
                ...selectedTrackItem,
                id: getNanoid(9),
                duration: rightTrackDuration,
                trackWidth: getCurrentPositionByTime(rightTrackDuration),
                startTime: currentTime,
                playStartTime: leftTrackPlayEndTime,
                playEndTime: selectedTrackItem.playEndTime,
                startLeft: leftTrackItem.startLeft + (leftTrackItem.trackWidth || 0),
            };

            // console.log('splitTrackItem', leftTrackItem, rightTrackItem);
            // debugger;
            addTrackItem(leftTrackItem, trackIndex);
            addTrackItem(rightTrackItem, trackIndex);
        }
    },
}));

export default useVideoTrackStore;
