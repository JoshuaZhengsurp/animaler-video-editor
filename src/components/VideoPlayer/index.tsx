import React from 'react';
import MiniVideo from './MiniVideoPlayer';
import { useVideoStore } from '@/store/useVideoDataStore';

interface Iprops {
    width: number;
    height: number;
}

export default function CanvasPlayer(props: Iprops) {
    const { width, height } = props;

    const videos = useVideoStore((s) => s.videos);

    console.log(width, height, videos.length);
    return (
        <div className={'bg-stone-950'} style={{ width: `${width}px`, height: `${height}px` }}>
            {videos?.length && <MiniVideo videoData={videos[0].data} />}
        </div>
    );
}
