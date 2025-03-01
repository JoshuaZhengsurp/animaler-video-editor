import React from 'react';
import style from './index.module.scss';

interface VideoInfo {
    duration: number;
    width: number;
    height: number;
}

interface TrackItemProps {
    track: Track;
    videoInfo: VideoInfo;
    isSelected: boolean;
    scale?: number;
}

export default function VideoTrack({
    track,
    videoInfo,
    scale = 1,
    isSelected = false,
}: TrackItemProps) {
    const renderVideoTrack = () => {
        if (!track.frames) return null;

        return (
            <div className={style['frames-container']}>
                {/**
                 * @todo 使用canvas来实现音轨图的绘制
                 */}
                {track.frames.map((frame, index) => (
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

    return (
        <div
            className={style['track-item']}
            style={{
                left: `${(track.startTime / videoInfo.duration) * 100}%`,
                width: `${(track.duration / videoInfo.duration) * 100}%`,
            }}
        >
            {renderVideoTrack()}
            {isSelected && (
                <>
                    <div className={style['pre-block']} />
                    <div className={style['suf-block']} />
                    <div className={style['track-item-border']} />
                </>
            )}
            {/* {track.type === 'video' ? renderVideoTrack() : renderAudioTrack()} */}
        </div>
    );
}
