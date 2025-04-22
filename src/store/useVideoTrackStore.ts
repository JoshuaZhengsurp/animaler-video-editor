import { create } from 'zustand';
import { getNanoid } from '@/utils/common';
import { eventbus } from '@/utils/pubsub';
import { TRACK_UPDATE_EVENT } from '@/utils/const';

const playingTrackListWeakset = new Set<TrackItem>();

const checkTrackItemInWeakset = (trackList: TrackItem[]) => {
    for (let i = 0; i < trackList.length; ++i) {
        if (!playingTrackListWeakset.has(trackList[i])) {
            return false;
        }
    }
    return true;
};

// todo 还需要描述元素间的层级关系
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
    playingTrackList: TrackItem[]; // 正在播放的track

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
    updatePlayingTrackList: (time: number) => void;
    deleteTrackItem: (selectTrackId: string) => void;
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
    playingTrackList: [],

    setDuration: (duration) => set({ duration }),
    setTrackWidth: (width) => set({ trackWidth: width }),
    setTimeLineCeilWidth: (ceil) => set({ timeLineCeilWidth: ceil }),
    setTimeIntervalCeil: (t) => set({ timeIntervalCeil: t }),
    setSelectedTrackId: (id) => set({ selectedTrackId: id }),
    setCurrentTime: (time) => {
        set({ currentTime: time });
        get().updatePlayingTrackList(time);
    },

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
        const {
            tracks,
            currentTime,
            updateDuration,
            updatePlayingTrackList,
            getCurrentPositionByTime,
        } = get();
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
                setTimeout(() => eventbus.emit(TRACK_UPDATE_EVENT, trackItem.id));
                return { tracks: newTracks, selectedTrackId: trackItem.id };
            });
            // Then update playingTrackList after tracks are updated
            set(() => {
                updatePlayingTrackList(currentTime);
                return {};
            });
        } else {
            set((s) => {
                console.log('set tracks', s.tracks, idx, trackItem);
                s.tracks[idx] = trackItem;
                const newTracks = [...s.tracks];
                updateDuration(newTracks);
                setTimeout(() => eventbus.emit(TRACK_UPDATE_EVENT, trackItem.id));
                return { tracks: newTracks, selectedTrackId: trackItem.id };
            });
            // Then update playingTrackList after tracks are updated
            set(() => {
                updatePlayingTrackList(currentTime);
                return {};
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

    updatePlayingTrackList: (time: number) => {
        // console.log('setCurrentTime time', time);
        const { tracks, playingTrackList } = get();
        const newPlayingTrackList = tracks.filter((item) => {
            return item.startTime <= time && time < item.startTime + item.duration;
        });
        // console.log('setCurrentTime before', newPlayingTrackList, playingTrackList, tracks);
        if (
            playingTrackList.length !== newPlayingTrackList.length ||
            !checkTrackItemInWeakset(newPlayingTrackList)
        ) {
            set({ playingTrackList: newPlayingTrackList });
            playingTrackListWeakset.clear();
            newPlayingTrackList.forEach((item) => {
                playingTrackListWeakset.add(item);
            });
            // console.log('setCurrentTime after', newPlayingTrackList);
        }
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

    deleteTrackItem: (selectTrackId: string) => {
        const { tracks, currentTime, updateDuration, updatePlayingTrackList } = get();
        const newTracks = tracks.filter((item) => item.id !== selectTrackId);

        set((s) => {
            return {
                tracks: newTracks,
                selectedTrackId: '',
            };
        });

        // 更新正在播放的轨道列表，对新tracks有依赖
        set((s) => {
            updatePlayingTrackList(currentTime);
            return {};
        });
        // 更新总时长
        updateDuration(newTracks);
    },
}));

export default useVideoTrackStore;
