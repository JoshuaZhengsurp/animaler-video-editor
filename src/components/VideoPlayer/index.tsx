import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ffmpegManager } from '../../utils/ffmpeg/manager';
import {
    calculateCenterPosition,
    calculateFitDimensions,
    cmpFloat,
    fixFloat,
} from '@/utils/common';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { getVideoFrameIndexByTimestamp } from '@/utils/ffmpeg/utils';

interface IProps {
    width: number;
    height: number;
    videoFile?: string;
    fps?: number;
    videoResolution?: Record<string, any>;
}

export default function CanvasPlayer(props: IProps) {
    const { width, height, videoFile, fps = 30, videoResolution } = props;
    const setCurrentTime = useVideoTrackStore((s) => s.setCurrentTime);
    const duration = useVideoTrackStore((s) => s.duration); // 单位是ms，需要转换为s
    const curPlayTime = useRef(0); // 当前播放的时间节点
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const frameIndex = useRef(0);
    const frameTimer = useRef<NodeJS.Timeout>();
    const frameInterval = useMemo(() => 1000 / fps, [fps]);
    const [frameWidth, frameHeight, centerX, centerY] = useMemo(() => {
        if (width && height && videoResolution?.ratio) {
            try {
                const frameDimensions = calculateFitDimensions(
                    [width, height],
                    width / height,
                    videoResolution.ratio,
                );
                if (frameDimensions) {
                    const [centerX, centerY] = calculateCenterPosition(
                        [width, height],
                        frameDimensions,
                    );
                    return [...frameDimensions, centerX, centerY];
                }
            } catch (e) {
                console.error(e);
            }
        }
        return [width, height, 0, 0];
    }, [width, height, videoResolution]);

    const renderFrame = async (playFrame: Blob) => {
        const img = new Image();
        img.src = URL.createObjectURL(playFrame);

        img.onload = () => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                // 清除上一帧
                ctx.clearRect(centerX, centerY, frameWidth, frameHeight);
                ctx.drawImage(img, centerX, centerY, frameWidth, frameHeight);
            }
            URL.revokeObjectURL(img.src);
        };
    };

    const clearTimer = () => {
        frameIndex.current = 1;
        clearInterval(frameTimer.current);
        frameTimer.current = undefined;
    };

    /**
     * @todo 可能出现定时器违背clear的情况
     */
    const genPlayFrame = async (time: number) => {
        if (!canvasRef.current || !videoFile) return;

        console.log('genPlayFrame', time);
        const { startPFrameTimestamp, frameIndex: FixedFrameIndex } = getVideoFrameIndexByTimestamp(
            time,
            fps,
        );
        frameIndex.current = FixedFrameIndex;

        const { firstFrame } = await ffmpegManager.extractFrame({
            inputFile: videoFile,
            time: startPFrameTimestamp,
            w: videoResolution?.width,
            h: videoResolution?.height,
            fps,
            frameIndex: frameIndex.current,
        });

        curPlayTime.current += frameInterval;
        renderFrame(firstFrame);

        frameTimer.current = setInterval(async () => {
            try {
                const frameBlob = await ffmpegManager.getPlayFrame({
                    inputFile: videoFile,
                    time: startPFrameTimestamp,
                    frameIndex: ++frameIndex.current,
                });
                setCurrentTime(curPlayTime.current);
                curPlayTime.current += frameInterval;
                renderFrame(frameBlob);
                // console.log(duration, curPlayTime.current);
                if (
                    !isPlaying ||
                    cmpFloat(duration, curPlayTime.current) ||
                    frameIndex.current >= fps
                ) {
                    clearTimer();
                    if (!cmpFloat(duration, curPlayTime.current)) {
                        genPlayFrame(fixFloat(curPlayTime.current / 1000, 3));
                    } else {
                        curPlayTime.current = 0;
                    }
                }
            } catch (error) {
                console.log('error', error);
                curPlayTime.current = 0;
                stop();
            }
        }, frameInterval);
    };

    const play = () => {
        if (!videoFile || isPlaying) return;
        setIsPlaying(true);
    };

    const stop = () => {
        setIsPlaying(false);
    };

    useEffect(() => {
        if (!isPlaying) {
            clearTimer();
        } else {
            genPlayFrame(fixFloat(curPlayTime.current / 1000, 3));
        }
    }, [isPlaying]);

    return (
        <div
            className='relative bg-stone-950'
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className='absolute top-0 left-0'
            />
            <div className='absolute bottom-4 left-4 right-4 flex gap-2'>
                <button onClick={isPlaying ? stop : play} className='px-4 py-2 bg-white/10 rounded'>
                    {isPlaying ? 'Stop' : 'Play'}
                </button>
                <div className='text-white'>
                    {Math.floor(curPlayTime.current / 1000)}s / {Math.floor(duration / 1000)}s
                </div>
            </div>
        </div>
    );
}
