import React, { useRef } from 'react';
import { fetchFile } from '@ffmpeg/util';

import style from './index.module.scss';
import { ffmpegManager } from '@/utils/ffmpeg';
import { useStateStore } from '@/store/useStateStore';
import { FFmpeg } from '@ffmpeg/ffmpeg';

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
            console.log('ffmpeg', ffmpegRef.current);
            const videoURL = 'https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi';
            const ffmpeg: FFmpeg = ffmpegRef.current;

            ffmpeg.on('progress', ({ progress, time }) => {
                console.log('转码进度:', progress, '时间:', time);
                if (messageRef.current) {
                    messageRef.current.textContent = `处理中: ${(progress * 100).toFixed(2)}%`;
                }
            });

            // 确保在写入新文件前清理旧文件
            try {
                await ffmpeg.deleteFile('input.avi');
                await ffmpeg.deleteFile('output.mp4');
            } catch (e) {
                console.log('No files to delete');
            }

            const videoData = await fetchFile(videoURL);
            await ffmpeg.writeFile('input.avi', videoData);

            // // 检查输入文件是否正确写入
            // const inputFiles = await ffmpeg?.listFiles();
            // console.log('输入文件列表:', inputFiles);

            if (messageRef.current) {
                messageRef.current.textContent = '开始转码...';
            }

            const res2 = await ffmpeg.exec(
                [
                    '-i',
                    'input.avi',
                    '-c:v',
                    'libx264',
                    '-preset',
                    'ultrafast',
                    '-pix_fmt',
                    'yuv420p', // 强制使用 yuv420p 像素格式
                    '-vf',
                    'format=yuv420p', // 添加视频过滤器确保正确的格式转换
                    '-threads',
                    '1', // 使用单线程处理
                    '-g',
                    '35', // GOP大小设置为帧率
                    '-movflags',
                    '+faststart',
                    '-y',
                    'output.mp4',
                ],
                1200000,
            );
            console.log('ffmpeg', res2);
            const fileData = await ffmpeg.readFile('output.mp4');
            console.log('ffmpeg', fileData);
            const data = new Uint8Array(fileData as ArrayBuffer);

            console.log('videoRef.current', videoRef.current);
            if (videoRef.current) {
                console.log('videoRef.current', videoRef.current);
                videoRef.current.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
            }
            // 清除进度消息
            if (messageRef.current) {
                messageRef.current.textContent = '转码完成！';
            }
        } catch (err) {
            console.log('err', err);
            if (messageRef.current) {
                messageRef.current.textContent = `错误: ${err.message}`;
            }
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
            <div className={style['media-list']}>
                {!isLoading ? (
                    <>
                        {/* 播放时长&内容首帧&hover播放&画质压缩 */}
                        <video ref={videoRef} controls />
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
