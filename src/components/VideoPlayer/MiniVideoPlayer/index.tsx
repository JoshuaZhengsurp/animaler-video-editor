import React, { Fragment, useEffect, useRef, useState } from 'react';

interface IProps {
    videoData: Uint8Array;
    title: string;
}

export default function MiniVideo(props: IProps) {
    const { videoData, title } = props;

    const [showControls, setShowControls] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);

    const handleEnterVideo = () => {
        setShowControls(true);
    };

    const handleLeaveVideo = () => {
        setShowControls(false);
    };

    useEffect(() => {
        console.log('useEffect', props);
        if (videoRef.current && videoData) {
            videoRef.current.src = URL.createObjectURL(
                new Blob([videoData.buffer], { type: 'video/mp4' }),
            );
        }
    }, [videoData]);

    return (
        <Fragment>
            <div
                className='w-full h-full relative'
                onMouseEnter={() => handleEnterVideo()}
                onMouseLeave={() => handleLeaveVideo()}
            >
                <video
                    ref={videoRef}
                    className='w-full h-full object-contain'
                    controls={showControls}
                />
                {/* <div>
                    component
                </div> */}
            </div>
            <div className='w-full m-1 text-xs'>{title}</div>
        </Fragment>
    );
}
