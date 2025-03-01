import { create } from 'zustand';

interface VideoTrackState {
    // 视频总时长（秒）
    duration: number;
    // 当前播放时间（秒）
    currentTime: number;
    // 轨道宽度（像素）
    trackWidth: number;
    // 时间轴单位长度
    timeLineCeilWidth: number;
    timeIntervalCeil: number;

    // Actions
    setDuration: (duration: number) => void;
    setCurrentTime: (time: number) => void;
    setTrackWidth: (width: number) => void;
    setTimeLineCeilWidth: (ceil: number) => void;
    setTimeIntervalCeil: (t: number) => void;

    // 计算当前时间对应的像素位置
    getCurrentPosition: (t: number) => number;
    // 计算当前像素对应的时间戳
    getCurrentTimestamp: (p: number) => number;
}

const useVideoTrackStore = create<VideoTrackState>((set, get) => ({
    duration: 0,
    currentTime: 0,
    trackWidth: 0,
    timeLineCeilWidth: 0,
    timeIntervalCeil: 0,

    setDuration: (duration) => set({ duration }),
    setCurrentTime: (time) => set({ currentTime: time }),
    setTrackWidth: (width) => set({ trackWidth: width }),
    setTimeLineCeilWidth: (ceil) => set({ timeLineCeilWidth: ceil }),
    setTimeIntervalCeil: (t) => set({ timeIntervalCeil: t }),

    getCurrentPosition: (currentTime: number) => {
        const { timeIntervalCeil, timeLineCeilWidth } = get();
        if (currentTime === 0) {
            return 0;
        }
        return (currentTime / timeIntervalCeil) * timeLineCeilWidth;
    },

    getCurrentTimestamp: (position: number) => {
        const { timeIntervalCeil, timeLineCeilWidth, trackWidth } = get();
        if (position < 0 || position > trackWidth) {
            return -1;
        }
        const currentTime = (position / timeLineCeilWidth) * timeIntervalCeil;
        return currentTime;
    },
}));

export default useVideoTrackStore;
