import React, { useEffect, useMemo, useRef, useState } from 'react';
import CanvasPlayer from '@/components/VideoPlayer';
import { useVideoStore, VideoLoadStatus } from '@/store/useVideoDataStore';
import { calculateFitDimensions } from '@/utils/common';
import { PlayState, useVideoPlayerStore } from '@/store/useVideoPlayerStore';

/**
 * @todo 通过canvas绘制播放视频
 */

interface IProps {
    playerWHRate: number[];
}

const PADDING_BUTTON_EXTRA = 20;

export default function VideoPlayer(props: IProps) {
    const { playerWHRate } = props;
    const [canvasPlayerWH, setCanvasPlayerWH] = useState<number[]>([]);
    const playerRef = useRef<HTMLDivElement>(null);

    const videoList = useVideoStore((s) => s.videos);
    const mainVideo = useMemo(() => videoList?.[0], [videoList]);

    /**
     * @todo 使用VideoPlayerStore，更新width height数据
     */

    const getCanvasPlayerWH = () => {
        const [width, height] = playerWHRate;
        const ratio = width / height;
        const playerWidth = playerRef.current?.clientWidth || 0;
        const playerHeight = (playerRef.current?.clientHeight || 0) - PADDING_BUTTON_EXTRA;
        if (playerWidth && playerHeight) {
            return calculateFitDimensions(
                [playerWidth, playerHeight],
                playerWidth / playerHeight,
                ratio,
            );
        }
        return [];
    };

    useEffect(() => {
        setCanvasPlayerWH(getCanvasPlayerWH() || []);
    }, [playerWHRate]);

    return (
        <div className='w-full h-full flex justify-center' ref={playerRef}>
            {canvasPlayerWH.length && (
                <CanvasPlayer
                    width={canvasPlayerWH[0]}
                    height={canvasPlayerWH[1]}
                    videoResolution={mainVideo?.resolution}
                    videoFile={mainVideo?.path || ''}
                />
            )}
        </div>
    );
}
