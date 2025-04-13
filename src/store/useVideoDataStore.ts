import { create } from 'zustand';
import { ffmpegManager } from '@/utils/ffmpeg/manager';
import { blobToBase64, formatDurationTime, parseVideoResolution } from '@/utils/common';
import { getVideoFrameIndexByTimestamp, getVideoStreamInfo } from '@/utils/ffmpeg/utils';
import { TRACK_ITEM_HEIGHT } from '@/utils/const';

type PathType = string;

export enum VideoLoadStatus {
    IDLE = 'idle',
    LOADING = 'loading',
    DONE = 'done',
    ERROR = 'error',
}

export interface VideoItem {
    id: string;
    name: string;
    path: string;
    data?: any;
    duration?: number;
    thumbnail?: string;
    suffix?: string;
    info: Record<string, any>;
    origin: string;
    resolution: {
        width: number;
        height: number;
        ratio: number;
    } | null;
    pFrameMap?: Record<string | number, PathType>;
    status: VideoLoadStatus;
    // error?: string;
}

interface VideoInfo {
    origin: string;
    type: string;
    data: Uint8Array<ArrayBuffer> | string;
}

interface VideoStore {
    videos: VideoItem[];
    // 操作方法
    addVideo: (videoInfo: VideoInfo) => Promise<VideoItem | null>;
    removeVideo: (id: string) => void;
    splitVideo: (splitTimestamp: number, selectedVideoId: string) => void;

    getVideoDuration: (id: string) => number | string;
    getVideoDurationWithVideoItem: (videoItem?: VideoItem) => number | string;
    getVideoTrackFrame: (id: string, trackWidth: number, startTime: number) => any;
    // setCurrentVideo: (id: string | null) => void;
    // updateVideoStatus: (id: string, status: VideoItem['status'], error?: string) => void;
}

export const useVideoStore = create<VideoStore>((set, get) => ({
    videos: [],

    /**
     * @todo 完善这块逻辑
     */
    addVideo: async ({ origin, type, data }: VideoInfo) => {
        try {
            const fileName = origin.split(/[\\/]/).pop() || '';
            const fileSuffix = fileName.split('.').pop() || '';

            // console.log('origin', origin, fileName, fileSuffix);

            /**
             * @todo 视频解码状态描述
             */
            if (!ffmpegManager.isLoading) {
                await ffmpegManager.init();
            }

            const res = await ffmpegManager.transcode({
                type,
                uri: data,
                fileName: fileName,
                fileSuffix,
            });
            if (res) {
                const { data: transCodeResult, id, outputFile, info, inputFile } = res;

                console.log(
                    'addVideo',
                    id,
                    outputFile,
                    parseVideoResolution(getVideoStreamInfo(info, 'Video')?.[1]),
                );

                const videoItem: VideoItem = {
                    id,
                    name: fileName,
                    data: transCodeResult,
                    origin,
                    path: inputFile,
                    suffix: fileSuffix,
                    info,
                    duration: formatDurationTime(info?.input?.Duration),
                    resolution: parseVideoResolution(getVideoStreamInfo(info, 'Video')?.[1]),
                    status: VideoLoadStatus.DONE,
                };
                const videos = [videoItem, ...get().videos] as VideoItem[];

                set(() => ({ videos }));

                return videoItem;
            }
            return null;
        } catch (error) {
            console.error('Failed to add video:', error);
            return null;
        }
    },

    removeVideo: (id: string) => {
        set((state) => ({
            videos: state.videos.filter((video) => video.id !== id),
        }));
    },

    splitVideo: async (splitTimestamp: number, selectedVideoId: string) => {
        const selectedVideo = get().videos.find((video) => video.id === selectedVideoId);
        const startTime = 0; // 需要完善
        const duration = selectedVideo?.duration || 0;
        if (selectedVideo && startTime < splitTimestamp && splitTimestamp < startTime + duration) {
            await ffmpegManager.splitVideo({
                fileName: selectedVideo.name,
                inputFile: selectedVideo?.path || '',
                start: startTime,
                end: splitTimestamp,
            });
        }
    },

    getVideoDurationWithVideoItem: (videoItem?: VideoItem) => {
        return videoItem?.info?.input?.Duration || '';
    },

    getVideoDuration: (id: string) => {
        const videoItem = get().videos.filter((videoItem) => videoItem.id === id)?.[0];
        return get().getVideoDurationWithVideoItem(videoItem);
    },

    updatePFrameMap: (id: string, frameMap: Record<string | number, PathType>) => {
        set((state) => ({
            videos: state.videos.map((video) =>
                video.id === id ? { ...video, pFrameMap: frameMap } : video,
            ),
        }));
    },

    getPFrameMap: (id: string) => {
        const video = get().videos.find((video) => video.id === id);
        return video?.pFrameMap;
    },

    // 这个函数是否放在这里需要商榷；
    getVideoTrackFrame: async (id: string, trackWidth: number, startTime: number) => {
        const video = get().videos.find((video) => video.id === id);
        const { width = 0, height = 0 } = video?.resolution!;
        if (video && width && height) {
            const frameNum = Math.ceil(trackWidth / ((TRACK_ITEM_HEIGHT / height) * width));
            const fps = 30; // @todo
            const framesList: any[] = [];
            /**
             * 最大时间间隔，1s
             */
            let curFrameTimestamp = startTime / 1000;
            const frameInterval = Math.min(1, (video?.duration || 0) / (frameNum + 1) / 1000);
            for (let i = 0; i < frameNum; ++i) {
                const { startPFrameTimestamp, frameIndex } = getVideoFrameIndexByTimestamp(
                    curFrameTimestamp,
                    fps,
                );
                const frame = await ffmpegManager
                    .extractFrame({
                        inputFile: video.path,
                        time: startPFrameTimestamp,
                        w: width,
                        h: height,
                        fps,
                        frameIndex,
                    })
                    .then(async (res) => {
                        return await blobToBase64(res.firstFrame);
                    });
                framesList.push({ image: frame, time: curFrameTimestamp });
                curFrameTimestamp += frameInterval;
            }
            // console.log('framesList', framesList);
            return framesList;
        }
        return [];
    },

    // updateVideoStatus: (id: string, status: VideoItem['status'], error?: string) => {
    //     set(state => ({
    //         videos: state.videos.map(video => (video.id === id ? { ...video, status, error } : video)),
    //     }));
    // },
}));
