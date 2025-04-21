import React from 'react';

interface IProps {
    width: number;
    className: string;
}

export const PureLoadingTrack = ({ width, className }: IProps) => {
    return (
        <div
            className={className}
            style={{
                width: `${width}px`,
            }}
        />
    );
};
