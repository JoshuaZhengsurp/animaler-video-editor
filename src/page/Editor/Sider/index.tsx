import React from 'react';

import Tool from './Tool';

import style from './index.module.scss';
import { useSiderStore } from '@/store/useSiderStore';
import { useShallow } from 'zustand/react/shallow';
import { toolType } from './config';
import Media from './Media';

export default function Sider() {
    // const { component, text } = useSiderStore(
    //     useShallow(state => ({
    //         component: state.component,
    //         text: state.text,
    //     })),
    // );

    // const component = useSiderStore(state => state.component);
    const text = useSiderStore(state => state.text);
    const type = useSiderStore(state => state.type);

    console.log('sider', text);

    return (
        <>
            <div className={style['tool-list']}>
                <Tool />
            </div>
            <div className={style['display']}>
                {type === toolType.VIDEO && <Media />}
                {/* {type === toolType.AUDIO && <Media />}
                {type === toolType.DRAWER && <Media />}
                {type === toolType.FILTERS && <Media />}
                {type === toolType.TEXT && <Media />} */}
            </div>
        </>
    );
}
