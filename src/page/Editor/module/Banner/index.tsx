import React from 'react';

interface IProps {
    className: string;
}

export default function Banner(props: IProps) {
    return <div className={`${props.className}`}>Banner</div>;
}
