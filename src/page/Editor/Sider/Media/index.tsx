import React, { useRef } from 'react';
import { fetchFile } from '@ffmpeg/util';

import style from './index.module.scss';
import { ffmpegManager } from '@/utils/ffmpeg';
import { useStateStore } from '@/store/useStateStore';

// const { dialog } = require('electron');

// import { dialog } from 'electron';

export default function Media() {
    const ffmpegRef = useRef(ffmpegManager.ffmpeg);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const messageRef = useRef<HTMLParagraphElement | null>(null);

    const { isLoading } = useStateStore();

    const filePathRef = useRef<string>('');

    const transcode = async () => {
        try {
            const videoURL = 'https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi';
            const ffmpeg = ffmpegRef.current;
            await ffmpeg.writeFile('input.avi', await fetchFile(videoURL));
            await ffmpeg.exec(['-i', 'input.avi', 'output.mp4']);
            const fileData = await ffmpeg.readFile('output.mp4');
            const data = new Uint8Array(fileData as ArrayBuffer);
            if (videoRef.current) {
                videoRef.current.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
            }
        } catch (err) {
            console.log('err', err);
        }
    };

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
        transcode();
        // dialog.showOpenDialog({ properties: ['openFile'] });
    };

    return (
        <div className={style['media']}>
            <div className={style['media-import']} onClick={importMediaFile}>
                导入媒体
            </div>
            <div>
                {!isLoading ? (
                    <>
                        <video ref={videoRef} controls></video>
                        <br />
                        <button onClick={transcode}>Transcode avi to mp4</button>
                        <p ref={messageRef}></p>
                    </>
                ) : (
                    <div>loading...</div>
                )}
            </div>
        </div>
    );
}
