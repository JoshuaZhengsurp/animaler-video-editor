import React, { useMemo } from 'react';
import TrackItem from './components/VideoTrackItem';
import styles from './index.module.scss';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { VideoItem } from '@/store/useVideoDataStore';

// interface VideoInfo {
//     duration: number; // 视频总时长（秒）
//     width: number; // 视频宽度
//     height: number; // 视频高度
// }

interface VideoTrackProps {
    tracks: TrackItem[];
    scale?: number;
    className: string;
}

export default function VideoTrack(props: VideoTrackProps) {
    const { scale = 1, className, tracks } = props;

    const trackContentMap = useMemo(() => {
        const listMap: Record<number | string, { trackList: TrackItem[]; width: number }> = {};
        tracks.forEach((trackItem) => {
            if (!listMap[trackItem.trackIndex]) {
                listMap[trackItem.trackIndex] = { trackList: [], width: 0 };
            }
            listMap[trackItem.trackIndex].trackList.push(trackItem);
            listMap[trackItem.trackIndex].width = Math.max(
                listMap[trackItem.trackIndex].width,
                trackItem.startLeft + (trackItem.trackWidth || 0),
            );
        });
        // console.log('trackContentMap', listMap);
        return listMap;
    }, [tracks]);

    return (
        <div className={`${styles['tracks-container']} ${className}`}>
            {Object.keys(trackContentMap).map((key) => {
                const trackItemList = trackContentMap[key];
                return (
                    <div
                        key={key}
                        className={styles['track-list']}
                        style={{ width: `${trackItemList.width}px` }}
                    >
                        {trackItemList.trackList.map((track) => (
                            <TrackItem track={track} scale={scale} key={track.id} />
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
