import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CanvasPlayer from '@/components/VideoPlayer';

/**
 * @todo 通过canvas绘制播放视频
 */

interface Iprops {
    playerWHRate: number[];
}

const PADDING_BUTTOM_EXTRA = 20;

export default function VideoPlayer(props: Iprops) {
    const { playerWHRate } = props;
    const [canvasPlayerWH, setCanvasPlayerWH] = useState<number[]>([]);
    const playerRef = useRef<HTMLDivElement>(null);

    const getCanvasPlayerWH = () => {
        const [width, height] = playerWHRate;
        const rate = width / height;
        const playerWidth = playerRef.current?.clientWidth || 0;
        const playerHeight = (playerRef.current?.clientHeight || 0) - PADDING_BUTTOM_EXTRA;
        console.log(
            'getCanvasPlayerWH',
            rate,
            playerWidth / playerHeight,
            playerRef.current?.clientHeight,
            playerHeight,
            playerWidth,
        );
        if (playerWidth && playerHeight) {
            if (rate >= playerWidth / playerHeight) {
                return [playerWidth, playerHeight / rate];
            } else {
                return [playerHeight * rate, playerHeight];
            }
        }
        return [];
    };

    useEffect(() => {
        setCanvasPlayerWH(getCanvasPlayerWH() || []);
    }, [playerWHRate]);

    return (
        <div className='w-full h-full flex justify-center' ref={playerRef}>
            {canvasPlayerWH.length && (
                <CanvasPlayer width={canvasPlayerWH[0]} height={canvasPlayerWH[1]} />
            )}
        </div>
    );
}
