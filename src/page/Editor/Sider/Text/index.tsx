import React, { useEffect, useRef } from 'react';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { getNanoid } from '@/utils/common';

import style from './index.module.scss';
import { mockTextData } from './mock/data';

export default function Text() {
    const addTrackItem = useVideoTrackStore((s) => s.addTrackItem);

    const handleTextClick = async (index: number) => {
        const textItem = mockTextData.items[index];

        const trackItem: TextTrackItem = {
            id: getNanoid(9),
            type: 'text',
            duration: 3000, // 默认显示3秒
            startTime: 0,
            path: textItem.cover,
            resourceId: String(textItem.id),
            trackIndex: 0,
            startLeft: 0,
            content: textItem.content,
            playerPosition: {
                x: 0,
                y: 0,
            },
            style: {
                lineHeight: 1.2,
                fontSize: 16,
                color: '#ffffff',
                width: textItem.content.length * 16,
            },
        };
        addTrackItem(trackItem as any);
    };

    return (
        <div className={style['text']}>
            <div className={style['text-title']}>文字</div>
            <div className={style['text-list']}>
                {mockTextData.items.map((item, index) => (
                    <div
                        className={style['text-item']}
                        key={item.id}
                        onClick={() => handleTextClick(index)}
                    >
                        <img src={item.cover} alt='' />
                    </div>
                ))}
            </div>
        </div>
    );
}
