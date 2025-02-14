import React from 'react';

interface Iprops {
    left: number;
}

export default function TimePointer(props: Iprops) {
    const { left } = props;
    return (
        <div className='absolute' style={{ left: `${left}px`, top: '1.5rem' }}>
            position: {left}
        </div>
    );
}
