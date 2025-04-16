import { Ref, useMemo, useRef } from 'react';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { PlayState, useVideoPlayerStore } from '@/store/useVideoPlayerStore';

// 检测是否发生碰撞，如果只碰撞过一次，可提供碰撞修复的startleft；反之。两次以上，则回复原位置
// 碰撞检测，时间复杂度为O(N), 但考虑到音轨个数，对性能消耗不算太大
// 有对音轨进行排序，可考虑使用二分来优化算法

type CollisionResult =
    | {
          isColliding: true;
          collidingNum: number;
          newStartLeft: number;
      }
    | {
          isColliding: false;
      };

const checkIsColliding = (
    interval: (number | string)[][],
    left: number,
    right: number,
    id: string,
): CollisionResult => {
    let collidingNum = 0;
    let newStartLeft = -1;
    for (let i = 0; i < interval.length; ++i) {
        const item = interval[i];
        const intervalLeft = item[0] as number;
        const intervalRight = item[1] as number;
        if (item[2] !== id && !(intervalRight <= left || right <= intervalLeft)) {
            if (intervalLeft <= left && left <= intervalRight) {
                ++collidingNum;
                newStartLeft = intervalRight;
            }
            if (intervalLeft <= right && right <= intervalRight) {
                ++collidingNum;
                newStartLeft = intervalLeft - (right - left);
            }
            if (left <= intervalLeft && intervalRight <= right) {
                collidingNum += 2;
            }
        }
    }
    if (collidingNum) {
        return {
            isColliding: true,
            collidingNum,
            newStartLeft,
        };
    }
    return { isColliding: false };
};

export const useTrackDragger = (trackList: TrackItem[]) => {
    const addTrackItem = useVideoTrackStore((s) => s.addTrackItem);
    const getCurrentTimeByPosition = useVideoTrackStore((s) => s.getCurrentTimeByPosition);
    const setPlayState = useVideoPlayerStore((s) => s.setPlayState);

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

        setPlayState(PlayState.PAUSE);

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
            const ret = checkIsColliding(
                trackInterval,
                newStartLeftRef.current,
                newStartLeftRef.current + (trackItem.trackWidth || 0),
                trackItem.id,
            );
            if (!ret.isColliding) {
                addTrackItem({
                    ...trackItem,
                    startLeft: newStartLeftRef.current,
                    startTime: getCurrentTimeByPosition(newStartLeftRef.current),
                });
            } else {
                const fixedStartLeft = ret.newStartLeft;
                if (fixedStartLeft >= 0 && ret.collidingNum < 2) {
                    // 这里需要再次进行碰撞检测，确保位置修正后不会再发生碰撞
                    const collidingAgainRet = checkIsColliding(
                        trackInterval,
                        fixedStartLeft,
                        fixedStartLeft + (trackItem.trackWidth || 0),
                        trackItem.id,
                    );
                    if (!collidingAgainRet.isColliding) {
                        (selectedTrackItemRef.current as HTMLElement).style.left =
                            `${ret.newStartLeft}px`;
                        addTrackItem({
                            ...trackItem,
                            startLeft: ret.newStartLeft,
                            startTime: getCurrentTimeByPosition(newStartLeftRef.current),
                        });
                    } else {
                        (selectedTrackItemRef.current as HTMLElement).style.left =
                            `${originalStartLeftRef.current}px`;
                    }
                } else {
                    (selectedTrackItemRef.current as HTMLElement).style.left =
                        `${originalStartLeftRef.current}px`;
                }
            }
            setPlayState(PlayState.READY);
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
