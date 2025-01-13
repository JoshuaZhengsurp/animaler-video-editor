import React from 'react';

/**
 * @todo 通过canvas绘制播放视频
 */

interface Iprops {
    playerWHRate: number[];
}

export default function VideoPlayer(props: Iprops) {
    console.log('playerWHRate', props.playerWHRate);
    return <div className='w-full h-full'>player</div>;
}
