import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import style from './index.module.scss';

import { ToolConfig, toolConfigList, toolType } from '../config';
import { useSiderStore } from '@/store/useSiderStore';

export default function Tool() {
    const [setToolConfig, type] = useSiderStore(useShallow(state => [state.setToolConfig, state.type]));

    const selectTool = (tool: ToolConfig) => {
        setToolConfig(tool);
    };

    return (
        <div>
            {toolConfigList.map(tool => (
                <div
                    className={`${style['tool-item']} ${tool.type === type ? style['tool-item__light'] : ''}`}
                    key={tool.type}
                    onClick={() => selectTool(tool)}
                >
                    <span>{tool.text}</span>
                </div>
            ))}
        </div>
    );
}
