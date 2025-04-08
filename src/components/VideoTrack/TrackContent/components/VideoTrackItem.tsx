import React, { useEffect, useState } from 'react';
import style from './index.module.scss';
import { useVideoStore } from '@/store/useVideoDataStore';

interface VideoInfo {
    duration: number;
    width: number;
    height: number;
}

interface TrackItemProps {
    track: Track;
    isSelected: boolean;
    scale?: number;
}

const renderVideoTrack = (frames: VideoFrame[]) => {
    if (!frames) return null;
    return (
        <div className={style['frames-container']}>
            {/**
             * @todo 使用canvas来实现音轨图的绘制
             */}
            {frames.map((frame, index) => (
                <div key={`${frame.time}-${index}`} className={style['frame-item']}>
                    <img
                        src={frame.image}
                        alt={`Frame at ${frame.time}s`}
                        className={style['frame-image']}
                    />
                </div>
            ))}
        </div>
    );
};

export default function VideoTrack({ track, scale = 1, isSelected = false }: TrackItemProps) {
    const [trackFrames, setTrackFrames] = useState<VideoFrame[]>([]);
    const getVideoTrackFrame = useVideoStore((s) => s.getVideoTrackFrame);

    const getTrackFrame = async () => {
        const ret = await getVideoTrackFrame(track.id, track.trackWidth);
        setTrackFrames(ret);
    };

    useEffect(() => {
        console.log(track);
        setTimeout(() => getTrackFrame(), 100);
    }, [track]);

    return (
        <div
            key={track.id}
            className={style['track-wrapper']}
            style={{ width: track.trackWidth ? `${track.trackWidth}px` : 0 }}
        >
            {track.duration && trackFrames.length && (
                <div
                    className={style['track-item']}
                    style={{
                        left: `${(track.startTime / track.duration) * 100}%`,
                        width: `${(track.duration / track.duration) * 100}%`,
                    }}
                >
                    {renderVideoTrack(trackFrames)}
                    {isSelected && (
                        <>
                            <div className={style['pre-block']} />
                            <div className={style['suf-block']} />
                            <div className={style['track-item-border']} />
                        </>
                    )}
                    {/* {track.type === 'video' ? renderVideoTrack() : renderAudioTrack()} */}
                </div>
            )}
        </div>
    );
}

// const renderAudioTrack = () => {
//     if (!track.audioData) return null;
//     return (
//         <div className={style['audio-container']}>
//             {/* 这里渲染音频波形 */}
//             <div className={style['waveform']}>
//                 {track.audioData.waveform.map((amplitude, index) => (
//                     <div
//                         key={index}
//                         className={style['waveform-bar']}
//                         style={{
//                             height: `${amplitude * 100}%`
//                         }}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// };
