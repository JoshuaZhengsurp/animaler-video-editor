import React, { useEffect, useRef } from 'react';

import style from './index.module.scss';
import { mockAudioData } from './mock/data';
import { formatDurationTimeToString } from '@/utils/common';

export default function Drawer() {
    return (
        <div className={style['drawer']}>
            <div className={style['drawer-title']}>图片 </div>
            <div className={style['drawer-list']}>
                {mockAudioData.items.map((item) => (
                    <div className={style['drawer-item']} key={item.id}>
                        <img src={item.cover} alt='' />
                    </div>
                ))}
            </div>
        </div>
    );
}
