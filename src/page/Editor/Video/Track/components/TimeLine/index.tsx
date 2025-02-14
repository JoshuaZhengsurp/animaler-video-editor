import React from 'react';

interface Iprops {
    duration: number;
}

export default function TimeLine(props: Iprops) {
    const { duration } = props;
    return <>TimeLine: {duration}</>;
}
