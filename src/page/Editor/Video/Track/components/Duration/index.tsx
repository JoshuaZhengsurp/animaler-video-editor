import React from 'react';
import { formatDurationTimeToString } from '@/utils/common';

interface Iprops {
    duration?: number;
    curDuration?: number;

    className: string;
    curDutationClassName?: string;
    dutationClassName?: string;
}

export default function Duration(props: Iprops) {
    const { duration, curDuration, className, curDutationClassName, dutationClassName } = props;

    return (
        <div className={className}>
            <span className={`${curDutationClassName}`}>
                {formatDurationTimeToString(curDuration)}
            </span>
            /<span className={`${dutationClassName}`}>{formatDurationTimeToString(duration)}</span>
        </div>
    );
}
