import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ffmpegManager } from '../../utils/ffmpeg';
import { calculateCenterPosition, calculateFitDimensions } from '@/utils/common';

interface IProps {
    width: number;
    height: number;
    videoFile?: string;
    fps?: number;
    videoResolution?: Record<string, any>;
}

export default function CanvasPlayer(props: IProps) {
    const { width, height, videoFile, fps = 30, videoResolution } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(15);
    const frameInterval = useRef<number>();

    const [frameWidth, frameHeight, centerX, centerY] = useMemo(() => {
        if (width && height && videoResolution?.ratio) {
            try {
                const frameDimemsions = calculateFitDimensions(
                    [width, height],
                    width / height,
                    videoResolution.ratio,
                );
                if (frameDimemsions) {
                    const [centerX, centerY] = calculateCenterPosition(
                        [width, height],
                        frameDimemsions,
                    );
                    return [...frameDimemsions, centerX, centerY];
                }
            } catch (e) {
                console.error(e);
            }
        }
        return [width, height, 0, 0];
    }, [width, height, videoResolution]);

    // console.log('calculateFitDimensions', frameWidth, frameHeight, videoResolution?.ratio);

    useEffect(() => {
        console.log('canvasplayer', videoFile);
        if (videoFile) {
            // ffmpegManager.getVideoDuration(videoFile).then((duration) => {
            //     setDuration(duration || 15);
            // });
        }
    }, [videoFile]);

    const renderFrame = async (time: number) => {
        if (!canvasRef.current || !videoFile) return;
        // const ratio = videoResolution?.ratio || width / height;

        const frameBlob = await ffmpegManager.extractFrame({
            inputFile: videoFile,
            time: 0,
            w: videoResolution?.width,
            h: videoResolution?.height,
        });

        console.log('frameBlob', frameBlob);

        const img = new Image();
        img.src = URL.createObjectURL(frameBlob);

        img.onload = () => {
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, centerX, centerY, frameWidth, frameHeight);
            }
            URL.revokeObjectURL(img.src);
        };
    };

    const play = () => {
        if (!videoFile || isPlaying) return;

        setIsPlaying(true);
        const frameTime = 1000 / fps;

        renderFrame(0);

        // frameInterval.current = window.setInterval(() => {
        //     setCurrentTime((prev) => {
        //         const nextTime = prev + frameTime / 1000;
        //         if (nextTime >= duration) {
        //             stop();
        //             return 0;
        //         }
        //         renderFrame(nextTime);
        //         return nextTime;
        //     });
        // }, frameTime);
    };

    const stop = () => {
        if (frameInterval.current) {
            clearInterval(frameInterval.current);
        }
        setIsPlaying(false);
    };

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
                    {Math.floor(currentTime)}s / {Math.floor(duration)}s
                </div>
            </div>
        </div>
    );
}
