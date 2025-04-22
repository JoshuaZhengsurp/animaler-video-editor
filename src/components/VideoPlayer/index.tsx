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
import useFrameRender, {
    genImageFrameRenderTask,
    genTextFrameRenderTask,
} from '@/hooks/useFrameRender';

interface PlayFrameOption {
    type: TrackItemType;
    frame: string | Blob;
    ret?: any;
    extra?: any;
}

interface IProps {
    width: number;
    height: number;
    videoFile?: string;
    fps?: number;
    videoResolution?: Record<string, any>;
}

/**
 * todo: 渲染逻辑需要优化，抽离成hook
 */
export default function CanvasPlayer(props: IProps) {
    const { width, height, videoFile, fps = 30, videoResolution } = props;
    const setCurrentTime = useVideoTrackStore((s) => s.setCurrentTime);
    const getCurrentTime = useVideoTrackStore((s) => s.getCurrentTime);
    const duration = useVideoTrackStore((s) => s.duration); // 单位是ms，ffmpeg命令执行单位为s，需要转换
    const playingTrackList = useVideoTrackStore((s) => s.playingTrackList);
    const tracks = useVideoTrackStore((s) => s.tracks);
    const playerState = useVideoPlayerStore((s) => s.playState);
    const setPlayState = useVideoPlayerStore((s) => s.setPlayState);
    const curPlayTime = useRef(0); // 当前播放的时间节点, ms
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

    const frameIndex = useRef(0);
    const frameTimer = useRef<NodeJS.Timeout>();
    const frameInterval = useMemo(() => 1000 / fps, [fps]);

    const nearestTrackTimestamp = useMemo(() => {
        let nearestTrackTimestamp = Infinity;
        if (!playingTrackList.length) {
            const currentTime = getCurrentTime();
            for (const item of tracks) {
                if (item.startTime >= currentTime) {
                    nearestTrackTimestamp = Math.min(item.startTime, nearestTrackTimestamp);
                }
            }
        }
        // console.log('nearestTrackTimestamp', nearestTrackTimestamp, tracks, getCurrentTime());
        return nearestTrackTimestamp === Infinity ? -1 : nearestTrackTimestamp;
    }, [tracks, playingTrackList]);

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

    const { renderDefaultFrame, renderFrame } = useFrameRender({
        canvasRef,
        offscreenCanvasRef,
        offscreenCtxRef,
        width,
        height,
        frameWidth,
        frameHeight,
        centerX,
        centerY,
    });

    const clearTimer = () => {
        frameIndex.current = 1;
        frameTimer.current && clearInterval(frameTimer.current);
        frameTimer.current = undefined;
    };

    // startPFrameTimestamp 导轨切片实际
    const genFirstPlayFrame = async (time: number) => {
        // console.log('genFirstPlayFrame', videoFile, canvasRef.current, time, duration);
        if (!canvasRef.current || !videoFile) return null;
        if (time * 1000 > duration) {
            renderDefaultFrame();
            return null;
        }

        if (!playingTrackList.length) {
            const { startPFrameTimestamp } = getVideoFrameIndexByTimestamp(time, fps);
            renderDefaultFrame();
            return {
                startPFrameTimestamp,
            };
        }

        const firstFramePromise = playingTrackList.map(
            (playingTrackItem: TrackItem | ImageTrackItem | TextTrackItem) => {
                if (playingTrackItem.type === 'image') {
                    return genImageFrameRenderTask(playingTrackItem as ImageTrackItem);
                } else if (playingTrackItem.type === 'text') {
                    return genTextFrameRenderTask(playingTrackItem as TextTrackItem);
                } else {
                    return new Promise<PlayFrameOption>(async (resolve) => {
                        const playTimestamp =
                            fixFloat(playingTrackItem.playStartTime / 1000, 3) +
                            (time - fixFloat(playingTrackItem.startTime / 1000, 3)); // 单位为s

                        // 需要对curPlayTime时间进行细微修正（-1/fps~1/fps），切换音轨切片时会有误差，导致获取切片时有问题
                        const { fixedTimestamp } = fixPlayerFrameTime(
                            playTimestamp * 1000,
                            frameInterval,
                        );
                        curPlayTime.current += fixedTimestamp - playTimestamp * 1000;
                        const { startPFrameTimestamp, frameIndex: FixedFrameIndex } =
                            getVideoFrameIndexByTimestamp(fixedTimestamp / 1000, fps);
                        frameIndex.current = FixedFrameIndex;
                        // console.log(
                        //     'genFirstPlayFrame FixedFrameIndex',
                        //     FixedFrameIndex,
                        //     time,
                        //     playTimestamp,
                        // );
                        const { firstFrame } = await ffmpegManager.extractFrame({
                            inputFile: playingTrackItem.path,
                            time: startPFrameTimestamp,
                            w: videoResolution?.width,
                            h: videoResolution?.height,
                            fps,
                            frameIndex: frameIndex.current,
                        });
                        resolve({
                            type: playingTrackItem.type,
                            frame: firstFrame,
                            ret: startPFrameTimestamp,
                        });
                    });
                }
            },
        );

        const result = await Promise.all(firstFramePromise);
        renderFrame(result);

        return result.map((item) => item?.ret);
    };

    const checkCurrentTime = (trackList: TrackItem[], time: number) => {
        for (let i = 0; i < trackList.length; ++i) {
            if (
                trackList[i].startTime > time ||
                time >= trackList[i].startTime + trackList[i].duration
            ) {
                return true;
            }
        }
        return false;
    };

    const genPlayFrame = async (time: number) => {
        const ret = await genFirstPlayFrame(time);
        if (!ret) return;

        curPlayTime.current += frameInterval;
        // console.log('genPlayFrame', time, playingTrackList);

        // 确保旧的定时器被清理了（！！！非常重要）
        frameTimer.current && clearInterval(frameTimer.current);
        frameTimer.current = setInterval(async () => {
            try {
                if (playingTrackList.length) {
                    // 渲染track
                    const framePromise = playingTrackList.map(
                        (playingTrackItem: TrackItem | ImageTrackItem | TextTrackItem, index) => {
                            if (playingTrackItem.type === 'image') {
                                return genImageFrameRenderTask(playingTrackItem as ImageTrackItem);
                            } else if (playingTrackItem.type === 'text') {
                                return genTextFrameRenderTask(playingTrackItem as TextTrackItem);
                            } else {
                                const frameTime = Array.isArray(ret)
                                    ? ret[index]
                                    : (ret as { startPFrameTimestamp: number })
                                          .startPFrameTimestamp;
                                // console.log(
                                //     'genFirstPlayFrame genPlayFrame',
                                //     frameTime,
                                //     frameIndex.current,
                                // );
                                return new Promise<PlayFrameOption>(async (resolve, reject) => {
                                    try {
                                        const frameBlob = await ffmpegManager.getPlayFrame({
                                            inputFile: playingTrackItem.path,
                                            time: frameTime,
                                            frameIndex: ++frameIndex.current,
                                        });
                                        resolve({
                                            type: playingTrackItem.type,
                                            frame: frameBlob,
                                        });
                                    } catch (err) {
                                        reject(err);
                                    }
                                });
                            }
                        },
                    );
                    const result = await Promise.all(framePromise);
                    renderFrame(result);
                } else {
                    renderDefaultFrame();
                }
                setCurrentTime(curPlayTime.current);
                curPlayTime.current += frameInterval;

                // debugger;

                // 播放音轨需要变动了
                if (nearestTrackTimestamp !== -1 && nearestTrackTimestamp <= curPlayTime.current) {
                    clearTimer();
                    setCurrentTime(curPlayTime.current);
                    return;
                }

                const shouldRestartGenPlayFrame = checkCurrentTime(
                    playingTrackList,
                    curPlayTime.current,
                );
                // console.log(
                //     'shouldRestartGenPlayFrame',
                //     shouldRestartGenPlayFrame,
                //     playingTrackList,
                // );

                if (
                    playerState !== PlayState.PLAY ||
                    shouldRestartGenPlayFrame ||
                    frameIndex.current >= fps
                ) {
                    // console.log('genPlayFrame', frameIndex.current, fps);
                    clearTimer();
                    // 如果不需要更新，则继续播放；反之，更新playingTrackList再播放
                    if (shouldRestartGenPlayFrame) {
                        setCurrentTime(curPlayTime.current);
                    } else if (!cmpFloat(duration, curPlayTime.current)) {
                        setTimeout(
                            () => genPlayFrame(fixFloat(curPlayTime.current / 1000, 3)),
                            frameInterval,
                        );
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

    // 初始化离屏canvas
    useEffect(() => {
        if (width && height) {
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = width;
            offscreenCanvas.height = height;
            const offscreenCtx = offscreenCanvas.getContext('2d');

            offscreenCanvasRef.current = offscreenCanvas;
            offscreenCtxRef.current = offscreenCtx;
        }
    }, [width, height]);

    useEffect(() => {
        console.log('hello canvas player', playerState, playingTrackList);
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
    }, [playerState, playingTrackList]);

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
            </div>
        </div>
    );
}
