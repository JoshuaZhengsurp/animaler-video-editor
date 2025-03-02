import { create } from 'zustand';
import { ffmpegManager } from '@/utils/ffmpeg/manager';
import { formatDurationTime, parseVideoResolution } from '@/utils/common';

type PathType = string;
export interface VideoItem {
    id: string;
    name: string;
    path: string;
    data?: any;
    duration?: number;
    thumbnail?: string;
    suffix?: string;
    info: Record<string, any>;
    resolution: {
        width: number | string;
        height: number | string;
        ratio: number;
    };
    pFrameMap: Record<string | number, PathType>;
    // status: 'idle' | 'processing' | 'done' | 'error';
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
    addVideo: (videoInfo: VideoInfo) => Promise<void>;
    removeVideo: (id: string) => void;
    getVideoDuration: (id: string) => number | string;
    getVideoDurationWithVideoItem: (videoItem?: VideoItem) => number | string;
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

            console.log('origin', origin, fileName);

            /**
             * @todo 视频解码状态描述
             */
            // 初始化 FFmpeg（如果需要）
            if (!ffmpegManager.isLoading) {
                await ffmpegManager.init();
            }

            const res = await ffmpegManager.transcode({
                type,
                uri: data,
                fileName: fileName,
            });
            if (res) {
                const { data: transCodeResult, id, outputFile, info } = res;

                console.log(
                    'addVideo',
                    id,
                    outputFile,
                    parseVideoResolution(info?.input?.videoInfo?.[1]),
                );

                set((state) => ({
                    videos: [
                        {
                            id,
                            name: fileName,
                            data: transCodeResult,
                            path: origin,
                            suffix: fileSuffix,
                            info,
                            duration: formatDurationTime(info?.input?.Duration),
                            resolution: parseVideoResolution(info?.input?.videoInfo?.[1]),
                        },
                        ...state.videos,
                    ] as VideoItem[],
                }));
            }
            // 更新视频信息
            // set(state => ({
            //     videos: state.videos.map(video => {
            //         return video;
            //     })
            // }));
        } catch (error) {
            console.error('Failed to add video:', error);
        }
    },

    removeVideo: (id: string) => {
        set((state) => ({
            videos: state.videos.filter((video) => video.id !== id),
        }));
    },

    getVideoDurationWithVideoItem: (videoItem?: VideoItem) => {
        return videoItem?.info?.input?.Duration || '';
    },

    getVideoDuration: (id: string) => {
        const videoItem = get().videos.filter((viodeItem) => viodeItem.id === id)?.[0];
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

    // updateVideoStatus: (id: string, status: VideoItem['status'], error?: string) => {
    //     set(state => ({
    //         videos: state.videos.map(video => (video.id === id ? { ...video, status, error } : video)),
    //     }));
    // },
}));
