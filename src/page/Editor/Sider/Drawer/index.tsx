import React, { useEffect, useRef } from 'react';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { getNanoid } from '@/utils/common';

import style from './index.module.scss';
import { mockImgData } from './mock/data';

export default function Drawer() {
    const addTrackItem = useVideoTrackStore((s) => s.addTrackItem);

    const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height,
                });
            };
            img.src = url;
        });
    };

    const handleImageClick = async (index: number) => {
        const imageItem = mockImgData.items[index];
        const dimensions = await getImageDimensions(imageItem.cover);

        const trackItem: ImageTrackItem = {
            id: getNanoid(9),
            type: 'image',
            duration: 3000, // 默认显示3秒
            startTime: 0,
            path: imageItem.cover,
            resourceId: String(imageItem.id),
            trackIndex: 0,
            startLeft: 0,
            opacity: 1,
            playerPosition: {
                x: 0,
                y: 0,
            },
            size: {
                width: dimensions.width,
                height: dimensions.height,
                realWidth: dimensions.width,
                realHeight: dimensions.height,
            },
        };
        addTrackItem(trackItem as any);
    };

    return (
        <div className={style['drawer']}>
            <div className={style['drawer-title']}>图片</div>
            <div className={style['drawer-list']}>
                {mockImgData.items.map((item, index) => (
                    <div
                        className={style['drawer-item']}
                        key={item.id}
                        onClick={() => handleImageClick(index)}
                    >
                        <img src={item.cover} alt='' />
                    </div>
                ))}
            </div>
        </div>
    );
}
