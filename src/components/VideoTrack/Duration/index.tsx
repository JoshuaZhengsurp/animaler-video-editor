import React from 'react';
import { formatDurationTimeToString } from '@/utils/common';

interface Iprops {
    duration?: number;
    curDuration?: number;

    className: string;
    curDurationClassName?: string;
    durationClassName?: string;
}

export default function Duration(props: Iprops) {
    const { duration, curDuration, className, curDurationClassName, durationClassName } = props;

    return (
        <div className={className}>
            <span className={`${curDurationClassName}`}>
                {formatDurationTimeToString(curDuration)}
            </span>
            /<span className={`${durationClassName}`}>{formatDurationTimeToString(duration)}</span>
        </div>
    );
}
