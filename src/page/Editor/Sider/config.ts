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
    TEXT_EDITOR,
    DRAWER_EDITOR,
}

export const ToolEditorMap: Record<string, toolType> = {
    image: toolType.DRAWER_EDITOR,
    text: toolType.TEXT_EDITOR,
};

export interface ToolConfig {
    text: string;
    type: toolType;
    icon?: string;
}

export const toolConfigList: ToolConfig[] = [
    {
        type: toolType.VIDEO,
        text: '媒体库',
    },
    {
        type: toolType.DRAWER,
        text: '图片库',
    },
    {
        type: toolType.TEXT,
        text: '文字',
    },
    {
        type: toolType.AUDIO,
        text: '音频库',
    },
    {
        type: toolType.FILTERS,
        text: '滤波',
    },
];

export const hideToolConfigMap: Partial<Record<toolType, ToolConfig>> = {
    [toolType.TEXT_EDITOR]: {
        type: toolType.TEXT_EDITOR,
        text: '文字编辑',
    },
    [toolType.DRAWER_EDITOR]: {
        type: toolType.DRAWER_EDITOR,
        text: '图片编辑',
    },
};

export const initConfig = toolConfigList[0];
