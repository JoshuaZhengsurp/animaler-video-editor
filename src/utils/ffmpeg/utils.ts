export function getVideoFrameIndexByTimestamp(time: number, fps: number) {
    const startPFrameTimestamp = Math.floor(time);
    return {
        startPFrameTimestamp,
        frameIndex: Math.round((time - startPFrameTimestamp) * fps) + 1,
    };
}
