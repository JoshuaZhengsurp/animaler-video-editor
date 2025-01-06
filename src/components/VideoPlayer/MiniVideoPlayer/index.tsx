import React, { Fragment } from 'react';

interface IProps {
    key: number | string;
    videoRef: React.MutableRefObject<HTMLVideoElement>;
    title: string;
}

export default function MiniVideo(props: IProps) {
    const { videoRef, key, title } = props;

    return (
        <Fragment key={key}>
            <div className="w-full h-full">
                <video ref={videoRef} />
                {/* <div>
                    component
                </div> */}
            </div>
            <div className="w-full m-1 text-xs">{title}</div>
        </Fragment>
    );
}
