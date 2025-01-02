import React, { useState } from 'react';
import style from './index.module.scss';

import VideoPlayer from './Player';

export default function VideoEditor() {
    const [videoHeight] = useState(50);
    return (
        <div className={style['video-cut-content']}>
            <div className={style['video-curvas-content']} style={{ height: `${videoHeight}%` }}>
                <VideoPlayer />
            </div>
            <div className={style['cut-content']} style={{ height: `${100 - videoHeight}%` }}>
                Cut
            </div>
        </div>
    );
}
