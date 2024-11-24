import React from 'react';

import icon from '@/assets/miku.png';

interface IProps {
    className?: string;
    style?: Record<string, string>;
    width?: number | string;
    height?: number | string;
}

export default function Icon(props: IProps) {
    console.log(props);

    return <img src={icon} alt="" {...props} />;
}
