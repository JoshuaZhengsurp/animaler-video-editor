import React, { useRef } from 'react';

import style from './index.module.scss';
import { useStateStore } from '@/store/useStateStore';
import { useVideoStore } from '@/store/useVideoDataStore';
import { IS_SHOW_TRANCODE_STATUS } from '@/utils/const';
import MiniVideo from '@/components/VideoPlayer/MiniVideoPlayer';

// const { dialog } = require('electron');

// import { dialog } from 'electron';

export default function Media() {
    const messageRef = useRef<HTMLParagraphElement | null>(null);

    const { isLoading } = useStateStore();
    const { videos, addVideo } = useVideoStore();

    const filePathRef = useRef<string>('');

    /**
     * @todo ffmpeg 解码 输出
     * @todo videoStore 修改数据状态
     */
    // const transcode = async () => {
    //     try {
    //         console.log('ffmpeg', ffmpegRef.current);
    //         const videoURL = 'https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi';
    //         const ffmpeg = ffmpegRef.current;

    //         const { data: transResult } = await ffmpeg.transcode({
    //             type: 'URL',
    //             uri: videoURL,
    //         });

    //         console.log('videoRef.current', videoRef.current);
    //         if (videoRef.current) {
    //             console.log('videoRef.current', videoRef.current);
    //             videoRef.current.src = URL.createObjectURL(new Blob([transResult.buffer], { type: 'video/mp4' }));
    //         }
    //     } catch (err) {
    //         console.log('err', err);
    //     }
    // };

    const importMediaFile = async () => {
        /**
         * 打开文件系统，
         * 1. 获取文件路径
         * 2. 将文件转blob二级制
         * 3. 将blob二级制传递给transcode函数
         */
        console.log('hell0');
        filePathRef.current = (await window.ipcRenderer.invoke('dialog:openFile')) as string;
        // console.log(filepath);

        addVideo('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi');

        // transcode();
        // dialog.showOpenDialog({ properties: ['openFile'] });
    };

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
                        <MiniVideo key={video.id} videoData={video.data} title={video.name} />
                    ))}
            </div>
        </div>
    );
}
