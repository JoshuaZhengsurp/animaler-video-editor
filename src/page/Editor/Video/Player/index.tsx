import React, { useCallback, useEffect, useRef } from 'react';

/**
 * @todo 通过canvas绘制播放视频
 */

interface Iprops {
    playerWHRate: number[];
}

export default function VideoPlayer(props: Iprops) {
    const { playerWHRate } = props;
    const playerRef = useRef<HTMLDivElement>(null);

    const getCanvasPlayerWH = useCallback(() => {
        const [width, height] = playerWHRate;
        const rate = width / height;
        const playerWidth = playerRef.current?.clientWidth;
        const playerHeight = playerRef.current?.clientHeight;
        if (playerWidth && playerHeight) {
            if (rate >= playerWidth / playerHeight) {
            }
        }
        return null;
    }, [playerWHRate, playerRef]);

    useEffect(() => {
        console.log(playerRef.current?.clientHeight, playerRef.current?.clientWidth);
    }, []);

    return (
        <div className='w-full h-full' ref={playerRef}>
            player
        </div>
    );
}
