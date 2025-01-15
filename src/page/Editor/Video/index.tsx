import React, { useState } from 'react';
import style from './index.module.scss';

import VideoPlayer from './Player';
import PlayerControl from './Control';
import Track from './Track';

export default function VideoEditor() {
    const [videoPlayerHeight] = useState(60);
    const [playerWHRate] = useState([16, 9]);
    return (
        <div className={style['video-editor-content']}>
            <div
                className={style['video-player-content']}
                style={{ height: `${videoPlayerHeight}%` }}
            >
                <VideoPlayer playerWHRate={playerWHRate} />
                <div className={style['video-player-control']}>
                    <PlayerControl />
                </div>
            </div>
            <div className={style['cut-content']} style={{ height: `${100 - videoPlayerHeight}%` }}>
                <Track />
            </div>
        </div>
    );
}
