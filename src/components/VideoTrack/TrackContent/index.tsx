import React, { useMemo } from 'react';
import TrackItem from './components/VideoTrackItem';
import styles from './index.module.scss';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { VideoItem } from '@/store/useVideoDataStore';

interface VideoInfo {
    duration: number; // 视频总时长（秒）
    width: number; // 视频宽度
    height: number; // 视频高度
}

interface VideoTrackProps {
    videoList: VideoItem[];
    tracks: Track[];
    videoInfo: VideoInfo;
    scale?: number;
    className: string;
    onTrackChange?: (trackId: string, changes: Partial<Track>) => void;
}

export default function VideoTrack(props: VideoTrackProps) {
    const { scale = 1, className, videoList } = props;

    /**
     * @todo 暂时这么写
     */
    const duration = useVideoTrackStore((s) => s.duration);
    const getCurrentPositionByTime = useVideoTrackStore((s) => s.getCurrentPositionByTime);

    const trackListInfo = useMemo(() => {
        return videoList.map((item) => ({
            id: item.id,
            duration: item.duration || 0,
            resolution: item.resolution,
            path: item.path,
            startTime: 0,
            trackWidth: getCurrentPositionByTime(item.duration || 0),
        }));
    }, [videoList]);

    /**
     * @todo 通过视频信息和容器宽高以及帧率，得出需要绘制多少张帧图
     * @todo 使用ffmpeg将提取帧合并，并将合并的帧输出为base64 从而获取音轨图
     */

    return (
        <div className={`${styles['tracks-container']} ${className}`}>
            {trackListInfo?.map((track) => (
                <TrackItem track={track} scale={scale} isSelected={true} key={track.id} />
            ))}
        </div>
    );
}
