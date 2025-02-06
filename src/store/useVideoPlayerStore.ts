import { create } from 'zustand';

enum PlayState {
    NONE,
    PLAY,
    PAUSE,
    LOADING,
}

interface VideoPlayerStore {
    playState: PlayState;
    width: number | string;
    height: number | string;
    setPlayState: (state: PlayState) => void; // 添加 setPlayState
    setWidth: (width: number | string) => void;
    setHeight: (height: number | string) => void;
    setDimensions: (width: number | string, height: number | string) => void;
}

export const useVideoPlayerStore = create<VideoPlayerStore>((set) => ({
    playState: PlayState.NONE, // 添加初始状态
    width: '100%',
    height: '100%',
    setPlayState: (state: PlayState) => {
        set({ playState: state });
    },
    setWidth: (width: number | string) => {
        set({ width });
    },
    setHeight: (height: number | string) => {
        set({ height });
    },
    setDimensions: (width: number | string, height: number | string) => {
        set({ width, height });
    },
}));
