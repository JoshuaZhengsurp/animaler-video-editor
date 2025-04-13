import React, { useEffect, useState } from 'react';
import style from './index.module.scss';
import { useVideoStore } from '@/store/useVideoDataStore';
import useVideoTrackStore from '@/store/useVideoTrackStore';

interface VideoInfo {
    duration: number;
    width: number;
    height: number;
}

interface TrackItemProps {
    track: TrackItem;
    scale?: number;
}

const renderVideoTrack = (frames: VideoFrame[]) => {
    if (!frames) return null;
    return (
        <div className={style['frames-container']}>
            {/* @todo 使用canvas来实现音轨图的绘制 */}
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

export default function VideoTrack({ track, scale = 1 }: TrackItemProps) {
    const [trackFrames, setTrackFrames] = useState<VideoFrame[]>([]);
    const getVideoTrackFrame = useVideoStore((s) => s.getVideoTrackFrame);

    const selectTrackId = useVideoTrackStore((s) => s.selectedTrackId);
    const setSelectedTrackId = useVideoTrackStore((s) => s.setSelectedTrackId);

    const isSelected = selectTrackId === track.id;

    // 通过视频信息和容器宽高以及帧率，得出需要绘制多少张帧图
    // 使用ffmpeg将提取帧合并，并将合并的帧输出为base64 从而获取音轨图
    const getTrackFrame = async () => {
        const ret = await getVideoTrackFrame(track.resourceId, track.trackWidth || 0);
        setTrackFrames(ret);
    };

    const handleTrackClick = () => {
        if (!isSelected) {
            setSelectedTrackId(track.id);
        }
    };

    useEffect(() => {
        console.log(track);
        setTimeout(() => getTrackFrame(), 100);
    }, [track]);

    return (
        <div
            className={style['track-wrapper']}
            style={{
                width: track.trackWidth ? `${track.trackWidth}px` : 0,
                left: `${track.startLeft}px`,
            }}
            onClick={handleTrackClick}
        >
            {track.duration && trackFrames.length && (
                <div
                    className={style['track-item']}
                    style={{
                        width: `${track.trackWidth}px`,
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
