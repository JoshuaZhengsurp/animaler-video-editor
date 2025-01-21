import { create } from 'zustand';
import { ffmpegManager } from '@/utils/ffmpeg';

export interface VideoItem {
    id: string;
    name: string;
    path: string;
    data?: any;
    duration?: number;
    thumbnail?: string;
    suffix?: string;
    info: Record<string, any>;
    // status: 'idle' | 'processing' | 'done' | 'error';
    // error?: string;
}

interface VideoInfo {
    origin: string;
    type: string;
    data: Uint8Array<ArrayBuffer>;
}

interface VideoStore {
    videos: VideoItem[];
    // 操作方法
    addVideo: (videoInfo: VideoInfo) => Promise<void>;
    removeVideo: (id: string) => void;
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
            // const id = crypto.randomUUID();

            console.log('origin', origin, fileName);

            /**
             * @todo 视频解码状态描述
             */
            // 先添加视频项到列表
            // set(state => ({
            //     videos: [
            //         ...state.videos,
            //         {
            //             id,
            //             name: fileName,
            //             path: origin,
            //             status: 'processing',
            //         },
            //     ],
            // }));

            // 初始化 FFmpeg（如果需要）
            if (!ffmpegManager.isLoading) {
                await ffmpegManager.init();
            }

            const {
                data: transCodeResult,
                id,
                outputFile,
                info,
            } = await ffmpegManager.transcode({
                type,
                uri: data,
                inputFile: fileName,
            });

            console.log('addVideo', id, outputFile);

            set((state) => ({
                videos: [
                    {
                        id,
                        name: fileName,
                        data: transCodeResult,
                        path: origin,
                        suffix: fileSuffix,
                        info,
                    },
                    ...state.videos,
                ] as VideoItem[],
            }));
            // 更新视频信息
            // set(state => ({
            //     videos: state.videos.map(video => {
            //         return video;
            //     })
            // }));
        } catch (error) {
            console.error('Failed to add video:', error);
            // set(state => ({
            //     videos: state.videos.map(video =>
            //         video.path === path ? { ...video, status: 'error', error: error.message } : video,
            //     ),
            // }));
        }
    },

    removeVideo: (id: string) => {
        set((state) => ({
            videos: state.videos.filter((video) => video.id !== id),
        }));
    },

    getVideoDuration: (id: string) => {
        return (
            get().videos.filter((viodeItem) => viodeItem.id === id)?.[0].info?.input?.Duration || ''
        );
    },

    // updateVideoStatus: (id: string, status: VideoItem['status'], error?: string) => {
    //     set(state => ({
    //         videos: state.videos.map(video => (video.id === id ? { ...video, status, error } : video)),
    //     }));
    // },
}));
