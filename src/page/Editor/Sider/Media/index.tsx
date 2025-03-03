import React, { useEffect, useRef } from 'react';

import style from './index.module.scss';
import { useStateStore } from '@/store/useStateStore';
import { useVideoStore } from '@/store/useVideoDataStore';
import { IS_SHOW_TRANCODE_STATUS } from '@/utils/const';
import MiniVideo from '@/components/VideoPlayer/MiniVideoPlayer';

export default function Media() {
    const messageRef = useRef<HTMLParagraphElement | null>(null);

    const { isLoading } = useStateStore();
    const { videos, addVideo } = useVideoStore();

    const fileInfoRef = useRef<Record<string, any> | null>(null);

    const importMediaFile = async () => {
        /**
         * 打开文件系统，
         * 1. 获取文件路径
         * 2. 将文件转blob二级制
         * 3. 将blob二级制传递给transcode函数
         */
        console.log('hell0');
        fileInfoRef.current = (await window.ipcRenderer.invoke('dialog:openFile')) as Record<
            string,
            any
        >;
        // console.log(fileInfoRef);
        if (fileInfoRef.current?.data) {
            await addVideo({
                data: fileInfoRef.current?.data,
                type: 'LOCAL',
                origin: fileInfoRef.current?.path,
            });
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
