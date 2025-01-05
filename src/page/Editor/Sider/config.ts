// import { CameraVideo } from '@styled-icons/bootstrap/CameraVideo';
// import { CameraVideoFill } from '@styled-icons/bootstrap/CameraVideoFill';
// import { ReactElement } from 'react';

import Media from './Media';

export enum toolType {
    UNKNOWN,
    VIDEO,
    AUDIO,
    DRAWER,
    FILTERS,
    TEXT,
}

export interface ToolConfig {
    text: string;
    type: toolType;
    icon?: string;
    component?: (() => JSX.Element) | null;
}

export const toolConfigList: ToolConfig[] = [
    {
        type: toolType.VIDEO,
        text: '媒体库',
        component: Media,
    },
    {
        type: toolType.AUDIO,
        text: '音频库',
    },
    {
        type: toolType.DRAWER,
        text: '素材库',
    },
    {
        type: toolType.FILTERS,
        text: '滤波',
    },
    {
        type: toolType.TEXT,
        text: '文字',
    },
];

export const initConfig = toolConfigList[0];
