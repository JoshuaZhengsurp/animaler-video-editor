import React, { useEffect, useRef, useState } from 'react';
import style from './index.module.scss';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { PureLoadingTrack } from './PureLoadingTrack';

interface TrackItemProps {
    track: TextTrackItem | TrackItem;
    scale?: number;

    handleDragStart: (clientX: number, track: TrackItem, trackItemRef?: HTMLElement | null) => void;
}

const TextTrackFrames = (trackData: TextTrackItem) => {
    if (!trackData) return null;

    return (
        <div className={style['frames-container']}>
            <div className={`${style['frame-item']} ${style['frame-item__text']}`}>
                <span>{trackData.content}</span>
            </div>
        </div>
    );
};

export default function TextTrackItem({ track, scale = 1, handleDragStart }: TrackItemProps) {
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
                    {TextTrackFrames(track as TextTrackItem)}
                    {isSelected && (
                        <>
                            <div className={style['pre-block']} />
                            <div className={style['suf-block']} />
                            <div className={style['track-item-border']} />
                        </>
                    )}
                </div>
            ) : (
                <PureLoadingTrack className={style['track-item']} width={track.trackWidth || 0} />
            )}
        </div>
    );
}
