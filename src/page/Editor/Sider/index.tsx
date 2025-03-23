import React from 'react';

import Tool from './Tool';

import style from './index.module.scss';
import { useSiderStore } from '@/store/useSiderStore';
import { useShallow } from 'zustand/react/shallow';
import { toolType } from './config';
import Media from './Media';
import Audio from './Audio';
import Text from './Text';
import Drawer from './Drawer';

export default function Sider() {
    const text = useSiderStore((state) => state.text);
    const type = useSiderStore((state) => state.type);

    return (
        <>
            <div className={style['tool-list']}>
                <Tool />
            </div>
            <div className={style['display']}>
                {type === toolType.VIDEO && <Media />}
                {type === toolType.AUDIO && <Audio />}
                {type === toolType.TEXT && <Text />}
                {type === toolType.DRAWER && <Drawer />}
                {/* {type === toolType.FILTERS && <Media />}*/}
            </div>
        </>
    );
}
