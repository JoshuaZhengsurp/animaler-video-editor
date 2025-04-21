import { drawText } from '@/utils/canvas';
import { MutableRefObject } from 'react';

interface PlayFrameOption {
    type: string;
    frame: string | Blob;
    ret?: any;
    extra?: any;
}

interface UseFrameRenderProps {
    canvasRef: MutableRefObject<HTMLCanvasElement | null>;
    offscreenCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
    offscreenCtxRef: MutableRefObject<CanvasRenderingContext2D | null>;
    width: number;
    height: number;
    frameWidth: number;
    frameHeight: number;
    centerX: number;
    centerY: number;
}

export default function useFrameRender({
    canvasRef,
    offscreenCanvasRef,
    offscreenCtxRef,
    width,
    height,
    frameWidth,
    frameHeight,
    centerX,
    centerY,
}: UseFrameRenderProps) {
    const renderDefaultFrame = async () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);
        }
    };

    const renderFrame = async (playFrame: Blob | Array<PlayFrameOption>) => {
        if (Array.isArray(playFrame)) {
            const ctx = canvasRef.current?.getContext('2d');
            const offscreenCtx = offscreenCtxRef.current;

            // 合成帧然后渲染
            if (ctx && offscreenCtx) {
                // 清除离屏canvas
                offscreenCtx.clearRect(0, 0, width, height);
                // 使用Promise.all等待所有图片加载完成
                const drawPromises = playFrame.map((frameItem) => {
                    return new Promise<{ renderFn: () => void; extra?: unknown }>((resolve) => {
                        if (frameItem.type === 'video') {
                            const img = new Image();
                            img.src = URL.createObjectURL(frameItem.frame as Blob);
                            img.onload = () => {
                                resolve({
                                    renderFn: () => {
                                        offscreenCtx.drawImage(
                                            img,
                                            centerX,
                                            centerY,
                                            frameWidth,
                                            frameHeight,
                                        );
                                        URL.revokeObjectURL(img.src);
                                    },
                                    extra: 'video',
                                });
                            };
                        } else if (frameItem.type === 'image') {
                            const img = new Image();
                            img.src = frameItem.frame as string;
                            img.onload = () => {
                                resolve({
                                    renderFn: () => {
                                        const {
                                            playerPosition,
                                            size,
                                            opacity = 1.0,
                                        } = frameItem.extra!;
                                        offscreenCtx.globalAlpha = opacity;
                                        offscreenCtx.drawImage(
                                            img,
                                            playerPosition.x,
                                            playerPosition.y,
                                            size.width,
                                            size.height,
                                        );
                                        offscreenCtx.globalAlpha = 1;
                                    },
                                    extra: 'img',
                                });
                            };
                        } else if (frameItem.type === 'text') {
                            resolve({
                                renderFn: () => {
                                    drawText(
                                        offscreenCtx,
                                        frameItem.extra! as Omit<TextTrackItem, 'type'>,
                                    );
                                },
                                extra: 'text',
                            });
                        }
                    });
                });

                // 等待所有图片加载完成后，一次性绘制到主canvas
                Promise.all(drawPromises)
                    .then((res) => {
                        res.forEach((item) => {
                            item.renderFn && item.renderFn();
                        });
                    })
                    .then(() => {
                        ctx.clearRect(0, 0, width, height);
                        ctx.drawImage(offscreenCanvasRef.current!, 0, 0);
                    });
            }
        } else {
            const img = new Image();
            img.src = URL.createObjectURL(playFrame);
            img.onload = () => {
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(img, centerX, centerY, frameWidth, frameHeight);
                }
                URL.revokeObjectURL(img.src);
            };
        }
    };

    return {
        renderDefaultFrame,
        renderFrame,
    };
}

export const genTextFrameRenderTask = (playingTrackItem: TextTrackItem) => {
    return new Promise<PlayFrameOption>((resolve) => {
        resolve({
            type: playingTrackItem.type,
            frame: playingTrackItem.path,
            extra: {
                content: playingTrackItem.content,
                playerPosition: playingTrackItem.playerPosition,
                style: playingTrackItem.style,
            },
        });
    });
};

export const genImageFrameRenderTask = (playingTrackItem: ImageTrackItem) => {
    return new Promise<PlayFrameOption>((resolve) => {
        resolve({
            type: playingTrackItem.type,
            frame: playingTrackItem.path,
            extra: {
                playerPosition: playingTrackItem.playerPosition,
                size: playingTrackItem.size,
                opacity: playingTrackItem.opacity,
            },
        });
    });
};
