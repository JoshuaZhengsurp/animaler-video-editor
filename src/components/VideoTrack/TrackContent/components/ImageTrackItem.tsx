import React, { useEffect, useMemo, useRef, useState } from 'react';
import style from './index.module.scss';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { PureLoadingTrack } from './PureLoadingTrack';
import { TRACK_ITEM_HEIGHT } from '@/utils/const';

interface TrackItemProps {
    track: ImageTrackItem | TrackItem;
    scale?: number;

    handleDragStart: (clientX: number, track: TrackItem, trackItemRef?: HTMLElement | null) => void;
    handleDoudleClick: (type: TrackItemType) => void;
}

// 考虑使用canvas来绘制，减低渲染压力
const ImageTrackFrames = ({ trackData }: { trackData: ImageTrackItem }) => {
    if (!trackData) return <></>;

    const Frames = useMemo(() => {
        const { size, trackWidth } = trackData;
        if (trackWidth) {
            const frameNum = Math.ceil(
                trackWidth / ((TRACK_ITEM_HEIGHT / size.realHeight) * size.realWidth),
            );
            return Array.from({ length: frameNum }, (_, index) => {
                const frameWidth =
                    (TRACK_ITEM_HEIGHT / trackData.size.realHeight) * trackData.size.realWidth;
                const frameStyle = {
                    width: `${frameWidth}px`,
                    height: `${TRACK_ITEM_HEIGHT}px`,
                    backgroundImage: `url(${trackData.path})`,
                    backgroundSize: `${frameWidth}px ${TRACK_ITEM_HEIGHT}px`,
                    backgroundPosition: `${-index * frameWidth}px 0`,
                };
                return <div key={index} className={style['frame-item']} style={frameStyle} />;
            });
        }
        return <></>;
    }, [trackData]);

    return <div className={style['frames-container']}>{Frames}</div>;
};

export default function ImageTrackItem({
    track,
    scale = 1,
    handleDragStart,
    handleDoudleClick,
}: TrackItemProps) {
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
            onDoubleClick={() => handleDoudleClick(track.type)}
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
                    <ImageTrackFrames trackData={track as ImageTrackItem} />
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
                <PureLoadingTrack className={style['track-item']} width={track.trackWidth || 0} />
            )}
        </div>
    );
}
