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
                                        const { playerPosition, size } = frameItem.extra!;
                                        offscreenCtx.drawImage(
                                            img,
                                            playerPosition.x,
                                            playerPosition.y,
                                            size.width,
                                            size.height,
                                        );
                                    },
                                    extra: 'img',
                                });
                            };
                        } else if (frameItem.type === 'text') {
                            resolve({
                                renderFn: () => {
                                    const { content, playerPosition, style } = frameItem.extra!;
                                    const {
                                        fontSize,
                                        color,
                                        width,
                                        height,
                                        fontFamily = 'Arial',
                                        fontWeight = 'normal',
                                        fontStyle = 'normal',
                                        lineHeight = 1.2, // 默认行高为字体大小的1.2倍
                                    } = style;

                                    // 设置文字样式
                                    console.log(
                                        'style: ',
                                        `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`,
                                    );
                                    offscreenCtx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
                                    offscreenCtx.fillStyle = color;
                                    offscreenCtx.textBaseline = 'top';

                                    // 保存当前状态，以便后续恢复
                                    offscreenCtx.save();

                                    // 如果指定了宽度，则进行文字换行处理
                                    // 针对字符进行换行对于性能来说有一定消耗，考虑使用二分有优化；也需要考虑对这类静态的资源使用缓存
                                    if (width) {
                                        const text = content;
                                        let line = '';
                                        let y = playerPosition.y + fontSize * (lineHeight - 1);
                                        let charNum = 0;

                                        for (let i = 0; i < text.length; i++) {
                                            const char = text[i];
                                            const testLine = line + char;
                                            const metrics = offscreenCtx.measureText(testLine);
                                            const testWidth = metrics.width;
                                            ++charNum;

                                            console.log(testWidth, width);
                                            if (testWidth > width && charNum > 1) {
                                                offscreenCtx.fillText(line, playerPosition.x, y);
                                                line = char;
                                                charNum = 1;
                                                y += fontSize * lineHeight;
                                            } else {
                                                line = testLine;
                                            }
                                        }
                                        // 绘制最后一行
                                        if (line) {
                                            offscreenCtx.fillText(line, playerPosition.x, y);
                                        }
                                    } else {
                                        // 单行文字
                                        offscreenCtx.fillText(
                                            content,
                                            playerPosition.x,
                                            playerPosition.y,
                                        );
                                    }

                                    // 如果指定了高度，则裁剪超出部分
                                    if (height) {
                                        offscreenCtx.restore();
                                        offscreenCtx.save();
                                        offscreenCtx.beginPath();
                                        offscreenCtx.rect(
                                            playerPosition.x,
                                            playerPosition.y,
                                            width || Infinity,
                                            height,
                                        );
                                        offscreenCtx.clip();
                                    }
                                },
                                extra: 'text',
                            });
                        }
                    });
                });

                // 等待所有图片加载完成后，一次性绘制到主canvas
                Promise.all(drawPromises)
                    .then((res) => {
                        console.log('res', res);
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
            },
        });
    });
};
