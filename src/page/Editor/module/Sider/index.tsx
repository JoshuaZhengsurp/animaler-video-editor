import React from 'react';

import Tool from './component/Tool';

import style from './index.module.scss';

interface IProp {}

export default function Sider(prop: IProp) {
    return (
        <>
            <div className={style['tool']}>
                <Tool />
            </div>
            <div className={style['display']}>display</div>
        </>
    );
}
