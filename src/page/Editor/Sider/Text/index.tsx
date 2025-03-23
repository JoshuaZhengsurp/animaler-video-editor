import React, { useEffect, useRef } from 'react';

import style from './index.module.scss';
import { mockAudioData } from './mock/data';
import { formatDurationTimeToString } from '@/utils/common';

export default function Text() {
    return (
        <div className={style['text']}>
            <div className={style['text-title']}>文字</div>
            <div className={style['text-list']}>
                {mockAudioData.items.map((item) => (
                    <div className={style['text-item']} key={item.id}>
                        <img src={item.cover} alt='' />
                    </div>
                ))}
            </div>
        </div>
    );
}
