import React, { useEffect, useRef } from 'react';

import style from './index.module.scss';
import { mockAudioData } from './mock/data';
import { formatDurationTimeToString } from '@/utils/common';

export default function Audio() {
    return (
        <div className={style['audio']}>
            <div className={style['audio-title']}>音频库</div>
            <div className={style['audio-list']}>
                {mockAudioData.items.map((item) => (
                    <div className={style['audio-item']} key={item.id}>
                        <img src={item.cover} alt='' />
                        <div className={style['audio-item-desc']}>
                            <div>{item.name}</div>
                            <div>{formatDurationTimeToString(item.time)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
