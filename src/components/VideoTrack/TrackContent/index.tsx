import React, { Fragment, useMemo, useRef } from 'react';
import TrackItem from './components/VideoTrackItem';
import styles from './index.module.scss';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { VideoItem } from '@/store/useVideoDataStore';
import { useTrackDragger } from '@/hooks/useTrackDragger';

interface VideoTrackProps {
    tracks: TrackItem[];
    scale?: number;
    className: string;
}

interface TrackListProps {
    width: number;
    trackList: TrackItem[];
    scale: number;
}

/**
 * @todo 视频编辑器的一条音轨中，支持音轨内的拖拽移动
 */
const TrackList = ({ width, trackList, scale }: TrackListProps) => {
    const trackListRef = useRef<HTMLDivElement>(null);
    const { handleDragStart } = useTrackDragger(trackList, trackListRef);

    return (
        <div
            ref={trackListRef}
            className={styles['track-list']}
            style={{ minWidth: '100%', width: `${width}px` }}
        >
            {trackList.map((track) => (
                <TrackItem
                    track={track}
                    scale={scale}
                    key={track.id}
                    handleDragStart={handleDragStart}
                />
            ))}
        </div>
    );
};

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
                    <TrackList
                        key={key}
                        width={trackItemList.width}
                        trackList={trackItemList.trackList}
                        scale={scale}
                    />
                );
            })}
        </div>
    );
}
