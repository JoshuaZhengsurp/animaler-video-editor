import { initConfig, ToolConfig, toolType } from '@/page/Editor/Sider/config';
import { create } from 'zustand';

interface SiderStore extends Partial<ToolConfig> {
    setToolConfig: (toolConfig: ToolConfig) => void;
}

/**
 * @description 侧边工具栏配置
 */
export const useSiderStore = create<SiderStore>(set => ({
    ...initConfig,
    setToolConfig: toolConfig => {
        set({
            text: toolConfig.text || '',
            icon: toolConfig.icon || '',
            component: toolConfig.component || null,
            type: toolConfig.type || toolType.UNKNOWN,
        });
    },
}));
