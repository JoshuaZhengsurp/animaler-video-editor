import React from 'react';

import style from './index.module.scss';

interface Iprops {
    className: string;
}

export default function VideoTrackContent(props: Iprops) {
    const { className } = props;
    return <div className={`${className} ${style['video-track']}`}>VideoTrack</div>;
}
