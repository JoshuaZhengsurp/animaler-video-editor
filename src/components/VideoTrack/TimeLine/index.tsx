import React, { useEffect, useRef, useState, useCallback } from 'react';
import { defaultTimeLineConfig, defaultTimeLineConfig as timeLineConfig } from './config';
import { drawTimeLine as drawTimeLineCanvas } from '@/utils/canvas';
import useVideoTrackStore from '@/store/useVideoTrackStore';

export interface Iprops {
    duration: number;
    className: string;
}

export default function TimeLine(props: Iprops) {
    const { duration, className } = props;

    const setTrackWidth = useVideoTrackStore((s) => s.setTrackWidth);
    const setTimeLineCeilWidth = useVideoTrackStore((s) => s.setTimeLineCeilWidth);
    const setTimeIntervalCeil = useVideoTrackStore((s) => s.setTimeIntervalCeil);

    const timeLineRef = useRef<HTMLCanvasElement>(null);
    const timeLineContainerRef = useRef<HTMLDivElement>(null);

    const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);

    const [canvasRect, setCanvasRect] = useState({
        width: 0,
        height: 0,
    });

    const initTimeLineCanvasRect = useCallback(() => {
        if (timeLineContainerRef.current) {
            const { width, height } = timeLineContainerRef.current.getBoundingClientRect();
            setCanvasRect({
                width,
                height,
            });
            setTrackWidth(width);
        }
    }, []);

    const initTimeLineContext = useCallback(() => {
        if (timeLineRef.current) {
            canvasContextRef.current = timeLineRef.current.getContext('2d')!;
            canvasContextRef.current.font = `${
                timeLineConfig.textSize * timeLineConfig.ratio
            }px -apple-system, ".SFNSText-Regular", "SF UI Text", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", "WenQuanYi Zen Hei", "Microsoft YaHei", Arial, sans-serif`;
            canvasContextRef.current.lineWidth = timeLineConfig.lineWidth;
            canvasContextRef.current.textBaseline = timeLineConfig.textBaseline;
            canvasContextRef.current.textAlign = timeLineConfig.textAlign;
        }
    }, []);

    const drawTimeLine = () => {
        const res = drawTimeLineCanvas(
            canvasContextRef.current!,
            { duration },
            { ...canvasRect, ...timeLineConfig },
        );
        if (res) {
            setTimeLineCeilWidth(res.perCeilGridWidth);
            setTimeIntervalCeil(res.ceil);
        }
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            initTimeLineCanvasRect();
        });

        if (timeLineContainerRef.current) {
            resizeObserver.observe(timeLineContainerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [initTimeLineCanvasRect]);

    useEffect(() => {
        initTimeLineCanvasRect();
        initTimeLineContext();
    }, []);

    useEffect(() => {
        drawTimeLine();
    }, [duration, canvasRect]);

    return (
        <div ref={timeLineContainerRef} className={className}>
            <canvas
                ref={timeLineRef}
                width={canvasRect.width * timeLineConfig.ratio}
                height={canvasRect.height * timeLineConfig.ratio}
                style={{
                    width: `${canvasRect.width}px`,
                    height: `${canvasRect.height}px`,
                }}
            ></canvas>
        </div>
    );
}
