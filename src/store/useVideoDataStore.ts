import { create } from 'zustand';
import { ffmpegManager } from '@/utils/ffmpeg';

export interface VideoItem {
    id: string;
    name: string;
    path: string;
    duration?: number;
    thumbnail?: string;
    status: 'idle' | 'processing' | 'done' | 'error';
    error?: string;
}

interface VideoStore {
    videos: VideoItem[];
    currentVideoId: string | null;
    isProcessing: boolean;
    // 操作方法
    addVideo: (path: string) => Promise<void>;
    removeVideo: (id: string) => void;
    // setCurrentVideo: (id: string | null) => void;
    updateVideoStatus: (id: string, status: VideoItem['status'], error?: string) => void;
}

export const useVideoStore = create<VideoStore>(set => ({
    videos: [],
    currentVideoId: null,
    isProcessing: false,

    /**
     * @todo 完善这块逻辑
     */
    addVideo: async (path: string) => {
        try {
            const fileName = path.split(/[\\/]/).pop() || '';
            const id = crypto.randomUUID();

            // 先添加视频项到列表
            set(state => ({
                videos: [
                    ...state.videos,
                    {
                        id,
                        name: fileName,
                        path,
                        status: 'processing',
                    },
                ],
            }));

            // 初始化 FFmpeg（如果需要）
            if (!ffmpegManager.isLoading) {
                await ffmpegManager.init();
            }

            // 处理视频（获取时长、缩略图等）
            const duration = await ffmpegManager.getVideoDuration(path);

            // 更新视频信息
            // set(state => ({
            //     videos: state.videos.map(video => {
            //         return video;
            //     })
            // }));
        } catch (error) {
            console.error('Failed to add video:', error);
            set(state => ({
                videos: state.videos.map(video =>
                    video.path === path ? { ...video, status: 'error', error: error.message } : video,
                ),
            }));
        }
    },

    removeVideo: (id: string) => {
        set(state => ({
            videos: state.videos.filter(video => video.id !== id),
            currentVideoId: state.currentVideoId === id ? null : state.currentVideoId,
        }));
    },

    updateVideoStatus: (id: string, status: VideoItem['status'], error?: string) => {
        set(state => ({
            videos: state.videos.map(video => (video.id === id ? { ...video, status, error } : video)),
        }));
    },
}));
