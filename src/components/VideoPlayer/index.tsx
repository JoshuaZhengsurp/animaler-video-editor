import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ffmpegManager } from '../../utils/ffmpeg/manager';
import {
    calculateCenterPosition,
    calculateFitDimensions,
    cmpFloat,
    fixFloat,
    fixPlayerFrameTime,
} from '@/utils/common';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { getVideoFrameIndexByTimestamp } from '@/utils/ffmpeg/utils';
import { PlayState, useVideoPlayerStore } from '@/store/useVideoPlayerStore';

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
    const getCurrentTime = useVideoTrackStore((s) => s.getCurrentTime);
    const duration = useVideoTrackStore((s) => s.duration); // 单位是ms，需要转换为s
    const playerState = useVideoPlayerStore((s) => s.playState);
    const setPlayState = useVideoPlayerStore((s) => s.setPlayState);
    const curPlayTime = useRef(0); // 当前播放的时间节点
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const clearTimer = () => {
        frameIndex.current = 1;
        frameTimer.current && clearInterval(frameTimer.current);
        frameTimer.current = undefined;
    };

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

    const renderDefaultFrame = async () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.clearRect(centerX, centerY, frameWidth, frameHeight);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);
        }
    };

    const genFirstPlayFrame = async (time: number) => {
        // console.log('genFirstPlayFrame', videoFile, canvasRef.current, time, duration);
        if (!canvasRef.current || !videoFile) return null;
        if (time * 1000 > duration) {
            renderDefaultFrame();
            return null;
        }
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
        renderFrame(firstFrame);
        return {
            startPFrameTimestamp,
        };
    };

    /**
     * @todo 可能出现定时器未被clear的情况
     */
    const genPlayFrame = async (time: number) => {
        const ret = await genFirstPlayFrame(time);
        if (!ret) return;

        curPlayTime.current += frameInterval;

        frameTimer.current = setInterval(async () => {
            try {
                const frameBlob = await ffmpegManager.getPlayFrame({
                    inputFile: videoFile!,
                    time: ret.startPFrameTimestamp,
                    frameIndex: ++frameIndex.current,
                });
                setCurrentTime(curPlayTime.current);
                curPlayTime.current += frameInterval;
                renderFrame(frameBlob);
                // console.log(
                //     playerState,
                //     curPlayTime.current,
                //     frameIndex.current,
                //     frameTimer.current,
                // );
                if (
                    playerState !== PlayState.PLAY ||
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
                clearTimer();
            }
        }, frameInterval);
    };

    const play = () => {
        if (!videoFile || playerState === PlayState.PLAY) return;
        setPlayState(PlayState.PLAY);
    };

    const stop = () => {
        setPlayState(PlayState.PAUSE);
    };

    useEffect(() => {
        if (playerState === PlayState.PLAY) {
            const { fixedTimestamp, hasFix } = fixPlayerFrameTime(getCurrentTime(), frameInterval);
            curPlayTime.current = fixedTimestamp;
            if (hasFix) {
                setCurrentTime(fixedTimestamp);
            }
            genPlayFrame(fixFloat(curPlayTime.current / 1000, 3));
        } else {
            curPlayTime.current && clearTimer();
            if (playerState === PlayState.READY) {
                const { fixedTimestamp, hasFix } = fixPlayerFrameTime(
                    getCurrentTime(),
                    frameInterval,
                );
                curPlayTime.current = fixedTimestamp;
                if (hasFix) {
                    setCurrentTime(fixedTimestamp);
                }
                genFirstPlayFrame(fixFloat(curPlayTime.current / 1000, 3));
            }
        }
    }, [playerState]);

    useEffect(() => {}, []);

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
                <button
                    onClick={playerState === PlayState.PLAY ? stop : play}
                    className='px-4 py-2 bg-white/10 rounded'
                >
                    {playerState === PlayState.PLAY ? 'Stop' : 'Play'}
                </button>
                <div className='text-white'>
                    {Math.floor(curPlayTime.current / 1000)}s / {Math.floor(duration / 1000)}s
                </div>
            </div>
        </div>
    );
}
