import { Ref, useMemo, useRef } from 'react';
import useVideoTrackStore from '@/store/useVideoTrackStore';

// 还需要细化碰撞体积的逻辑，需要计算出如果碰撞了，最近的空隙是否能容纳下这个选中的track；或者是做吸顶；
const checkIsColliding = (
    interval: (number | string)[][],
    left: number,
    right: number,
    id: string,
) => {
    for (let i = 0; i < interval.length; ++i) {
        const item = interval[i];
        if (
            item[2] !== id &&
            (((item[0] as number) <= left && left < (item[1] as number)) ||
                ((item[0] as number) <= right && right < (item[1] as number)))
        ) {
            // console.log('id', item[2], id);
            // console.log('left', item[0], left, item[1]);
            // console.log('right', item[0], right, item[1]);
            return false;
        }
    }
    return true;
};

export const useTrackDragger = (trackList: TrackItem[], trackListRef: Ref<HTMLElement>) => {
    const addTrackItem = useVideoTrackStore((s) => s.addTrackItem);

    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const originalStartLeftRef = useRef(0);
    const newStartLeftRef = useRef(0);

    const selectedTrackItemRef = useRef<any>(null);

    const trackInterval = useMemo(() => {
        const interval = trackList.map((item) => {
            return [item.startLeft, item.startLeft + (item.trackWidth || 0), item.id];
        });
        return interval.sort((item1, item2) => (item1[0] as number) - (item2[0] as number));
    }, [trackList]);

    const handleDragStart = (
        clientX: number,
        trackItem: TrackItem,
        trackItemElement: HTMLElement | null = null,
    ) => {
        isDraggingRef.current = true;
        dragStartXRef.current = clientX;
        selectedTrackItemRef.current = trackItemElement;

        if (trackItem) {
            originalStartLeftRef.current = trackItem.startLeft;
        }

        const handleDragMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !trackItem) return;

            const deltaX = e.clientX - dragStartXRef.current;
            const newStartLeft = originalStartLeftRef.current + deltaX;

            // Prevent dragging beyond track boundaries
            if (newStartLeft < 0 || !selectedTrackItemRef.current) return;

            newStartLeftRef.current = newStartLeft;
            // console.log('handleDragMove', selectedTrackItemRef.current, newStartLeftRef.current);
            (selectedTrackItemRef.current as HTMLElement).style.left =
                `${newStartLeftRef.current}px`;
        };

        const handleDragEnd = () => {
            if (
                checkIsColliding(
                    trackInterval,
                    newStartLeftRef.current,
                    newStartLeftRef.current + (trackItem.trackWidth || 0),
                    trackItem.id,
                )
            ) {
                addTrackItem({
                    ...trackItem,
                    startLeft: newStartLeftRef.current,
                });
            } else {
                (selectedTrackItemRef.current as HTMLElement).style.left =
                    `${originalStartLeftRef.current}px`;
            }
            isDraggingRef.current = false;
            selectedTrackItemRef.current = null;
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        };

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
    };

    return {
        handleDragStart,
    };
};
