import React, { useRef } from 'react';

import styles from './index.module.scss';

interface IProps {
    left: number;
    updateTimestamp: (p: number) => void;
}

const LEFT_OFFSET = 16;

export default function TimePointer(props: IProps) {
    const { left, updateTimestamp } = props;

    const pointerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasEventListener = useRef(false);
    const isDraggingRef = useRef(false);

    /**
     * @todo 通过点击事件；确定点击的x方向位置；通过位置对并和时间轴单位长度，推测点击位置对应的视频时间戳
     */
    const updateVideoTimestamp = (e: React.MouseEvent | MouseEvent) => {
        if (containerRef.current) {
            // @todo rect.left疑似固定值，可优化
            const rect = containerRef.current.getBoundingClientRect();
            const clickX = e.clientX - rect.left - LEFT_OFFSET;
            updateTimestamp(clickX);
        }
    };

    /**
     * @todo 拖拽pointer；监听事件，实时移动pointer的位置
     */
    const handleDragEnd = () => {
        hasEventListener.current = false;
        pointerRef.current!.removeEventListener('mousemove', updateVideoTimestamp);
        pointerRef.current!.removeEventListener('mouseup', handleDragEnd);
    };

    const handleDragStart = (e: React.MouseEvent) => {
        isDraggingRef.current = true;

        const handleDragEnd = () => {
            isDraggingRef.current = false;
            cleanup();
        };

        const handleMouseLeave = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                cleanup();
            }
        };

        const cleanup = () => {
            pointerRef.current!.removeEventListener('mousemove', updateVideoTimestamp);
            pointerRef.current!.removeEventListener('mouseup', handleDragEnd);
            pointerRef.current!.removeEventListener('mouseleave', handleMouseLeave);
        };

        pointerRef.current!.addEventListener('mousemove', updateVideoTimestamp);
        pointerRef.current!.addEventListener('mouseup', handleDragEnd);
        pointerRef.current!.addEventListener('mouseleave', handleMouseLeave);
    };

    return (
        <div
            ref={containerRef}
            className={styles['time-pointer-content']}
            onClick={updateVideoTimestamp}
        >
            <div
                ref={pointerRef}
                className={styles['time-pointer']}
                style={{ left: `${left + LEFT_OFFSET}px` }}
                onMouseDown={handleDragStart}
            >
                <svg
                    className={styles['time-pointer-icon']}
                    viewBox='0 0 1024 1024'
                    version='1.1'
                    p-id='4623'
                    width='12'
                    height='14'
                >
                    <path
                        d='M39.384615 0h945.23077v700.731077l-427.165539 247.335385H474.190769L39.384615 695.296z'
                        fill='#ffffff'
                        p-id='4624'
                    ></path>
                </svg>
            </div>
        </div>
    );
}
