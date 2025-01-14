import React from 'react';

interface Iprops {
    onLast?: () => void;
    onNext?: () => void;
    onPlay?: () => void;
    onForWard?: () => void;
    onBackWard?: () => void;
}

/**
 * @todo
 * { icon, cb, tip }
 */

export default function PlayerControl(props: Iprops) {
    const { onBackWard, onForWard, onLast, onNext, onPlay } = props;
    return (
        <div className='w-full h-full flex justify-center items-center gap-2'>
            <div onClick={() => onLast && onLast()}>上一个</div>
            <div onClick={() => onBackWard && onBackWard()}>后退</div>
            <div onClick={() => onPlay && onPlay()}>暂停/开始</div>
            <div onClick={() => onForWard && onForWard()}>快进</div>
            <div onClick={() => onNext && onNext()}>下一个</div>
        </div>
    );
}
