import React, { Fragment, useEffect, useRef, useState } from 'react';
// import useVideoTrackStore from '@/store/useVideoTrackStore';

interface IProps {
    videoData: Uint8Array;
    title?: string;
    duration: string | number;
    resourceId: string;
    handleAddVideoToTrack: (resourceId: string) => void;
}

/**
 * todo: 单击则把视频添加到音轨上，如果双击就播放/暂停该预览视频
 */
export default function MiniVideo(props: IProps) {
    const { videoData, title, duration, resourceId, handleAddVideoToTrack } = props;
    const [showControls, setShowControls] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleEnterVideo = () => {
        setShowControls(true);
    };

    const handleLeaveVideo = () => {
        setShowControls(false);
    };

    const handleVideoAddClick = (rId: string) => {
        if (rId) {
            handleAddVideoToTrack(rId);
        }
    };

    useEffect(() => {
        console.log('useEffect', props);
        if (videoRef.current && videoData) {
            videoRef.current.src = URL.createObjectURL(
                new Blob([videoData], { type: 'video/mp4' }),
            );
        }
    }, [videoData]);

    return (
        <Fragment>
            <div
                className='w-full h-full relative cursor-pointer'
                onMouseEnter={handleEnterVideo}
                onMouseLeave={handleLeaveVideo}
            >
                <video
                    ref={videoRef}
                    className='w-full h-full object-contain'
                    controls={showControls}
                />
            </div>
            <div className='w-full flex flex-row justify-between items-center'>
                {title && <div className='m-1 text-x'>{title}</div>}
                {duration && <div className='m-1 text-xs'>{duration}</div>}
                <div className='m-1 text-xs' onClick={() => handleVideoAddClick(resourceId)}>
                    添加
                </div>
            </div>
        </Fragment>
    );
}
