import React, { useEffect, useRef } from 'react';

import style from './index.module.scss';
import { useStateStore } from '@/store/useStateStore';
import { useVideoStore } from '@/store/useVideoDataStore';
import { IS_SHOW_TRANCODE_STATUS } from '@/utils/const';
import MiniVideo from '@/components/VideoPlayer/MiniVideoPlayer';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { getNanoid } from '@/utils/common';

export default function Media() {
    const messageRef = useRef<HTMLParagraphElement | null>(null);

    const { isLoading } = useStateStore();
    const { videos, addVideo } = useVideoStore();
    const addTrackItem = useVideoTrackStore((s) => s.addTrackItem);

    const fileInfoRef = useRef<Record<string, any> | null>(null);

    const importMediaFile = async () => {
        /**
         * 打开文件系统，获取文件路径
         * 将文件转blob二级制，将blob二级制传递给transcode函数
         */
        fileInfoRef.current = (await window.ipcRenderer.invoke('dialog:openFile')) as Record<
            string,
            any
        >;
        if (fileInfoRef.current?.data) {
            const videoItem = await addVideo({
                data: fileInfoRef.current?.data,
                type: 'LOCAL',
                origin: fileInfoRef.current?.path,
            });
            if (videoItem) {
                const trackItem: TrackItem = {
                    id: getNanoid(9),
                    type: 'video',
                    duration: videoItem?.duration || 0,
                    startTime: 0,
                    path: videoItem.path,
                    resourceId: videoItem.id,
                    trackIndex: 0,
                    startLeft: 0,
                };
                addTrackItem(trackItem);
            }
        }
    };

    useEffect(() => {
        if (!isLoading) {
            // importMediaFile();
        }
    }, [isLoading]);

    return (
        <div className={style['media']}>
            <div className={style['media-import']} onClick={importMediaFile}>
                导入媒体
            </div>
            {IS_SHOW_TRANCODE_STATUS && <p ref={messageRef}></p>}
            <div className={style['media-list']}>
                {/* 播放时长&内容首帧&hover播放&画质压缩 */}
                {!isLoading &&
                    videos.map((video) => (
                        <MiniVideo
                            key={video.id}
                            videoData={video.data}
                            title={video.name}
                            duration={video.info?.input?.Duration || ''}
                        />
                    ))}
            </div>
        </div>
    );
}
