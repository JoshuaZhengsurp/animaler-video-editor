import React from 'react';

import Banner from './module/Banner';
import Sider from './module/Sider';
import VideoEditor from './module/VideoEditor';

import style from './index.module.scss';

export default function Editor() {
    return (
        <div className={style.editor}>
            <Banner className={style.header} />
            <div className={style.content}>
                <div className={style['content-left']}>
                    <Sider />
                </div>
                <div className={style['content-right']}>
                    <VideoEditor />
                </div>
            </div>
        </div>
    );
}
