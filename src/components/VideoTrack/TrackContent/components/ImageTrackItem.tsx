import React, { useEffect, useRef, useState } from 'react';
import style from './index.module.scss';
import { useVideoStore } from '@/store/useVideoDataStore';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { useTrackDragger } from '@/hooks/useTrackDragger';

interface TrackItemProps {
    track: ImageTrackItem | TrackItem;
    scale?: number;

    handleDragStart: (clientX: number, track: TrackItem, trackItemRef?: HTMLElement | null) => void;
}

const ImageTrackFrames = (trackData: ImageTrackItem) => {
    if (!trackData) return null;

    return (
        <div className={style['frames-container']}>
            <div className={style['frame-item']}>
                <img src={trackData.path} alt='' className={style['frame-image']} />
            </div>
            <div className={style['frame-item']}>
                <img src={trackData.path} alt='' className={style['frame-image']} />
            </div>
        </div>
    );
};

const PureLoadingTrack = (width: number) => {
    return (
        <div
            className={style['track-item']}
            style={{
                width: `${width}px`,
            }}
        />
    );
};

export default function ImageTrackItem({ track, scale = 1, handleDragStart }: TrackItemProps) {
    const selectTrackId = useVideoTrackStore((s) => s.selectedTrackId);
    const setSelectedTrackId = useVideoTrackStore((s) => s.setSelectedTrackId);

    const trackItemRef = useRef<HTMLDivElement>(null);

    const isSelected = selectTrackId === track.id;

    const handleTrackClick = () => {
        if (!isSelected) {
            setSelectedTrackId(track.id);
        }
    };

    return (
        <div
            ref={trackItemRef}
            className={style['track-wrapper']}
            style={{
                width: track.trackWidth ? `${track.trackWidth}px` : 0,
                left: `${track.startLeft}px`,
                cursor: isSelected ? 'move' : 'default',
            }}
            onClick={handleTrackClick}
            onMouseDown={(e) => {
                isSelected &&
                    handleDragStart &&
                    handleDragStart(e.clientX, track as TrackItem, trackItemRef.current);
            }}
        >
            {track.duration ? (
                <div
                    className={style['track-item']}
                    style={{
                        width: `${track.trackWidth}px`,
                    }}
                >
                    {ImageTrackFrames(track as ImageTrackItem)}
                    {isSelected && (
                        <>
                            <div className={style['pre-block']} />
                            <div className={style['suf-block']} />
                            <div className={style['track-item-border']} />
                        </>
                    )}
                    {/* {track.type === 'video' ? renderVideoTrack() : renderAudioTrack()} */}
                </div>
            ) : (
                PureLoadingTrack(track.trackWidth || 0)
            )}
        </div>
    );
}
