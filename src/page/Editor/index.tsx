import React from 'react';

import Banner from './Banner';
import Sider from './Sider';
import VideoEditor from './VideoEditor';

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
