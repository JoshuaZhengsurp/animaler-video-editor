import { MaterialType, TextMaterial, Transform, Timeline } from '../types/material';

// 默认值配置
const DEFAULT_TRANSFORM: Transform = {
    x: 0,
    y: 0,
    width: 200,
    height: 40,
    rotation: 0,
    scale: { x: 1, y: 1 },
    opacity: 1,
    zIndex: 0,
};

const DEFAULT_TIMELINE: Timeline = {
    startTime: 0,
    endTime: 5000, // 默认5秒
    speed: 1,
    loop: false,
};

const DEFAULT_TEXT_STYLE = {
    fontSize: 16,
    fontFamily: 'Arial',
    color: '#000000',
    alignment: 'left' as const,
    bold: false,
    italic: false,
};

/**
 * 自定义素材传入时，解析文字素材JSON数据
 * @param json 文字素材JSON数据
 * @returns TextMaterial 文字素材对象
 * @throws Error 当必要字段缺失或格式错误时抛出异常
 */
export function parseTextMaterial(jsonData: Record<string, any>): TextMaterial {
    typeof jsonData === 'string' && (jsonData = JSON.parse(jsonData || '{}'));

    const transform: Transform = {
        ...DEFAULT_TRANSFORM,
        ...jsonData.transform,
    };
    const timeline: Timeline = {
        ...DEFAULT_TIMELINE,
        ...jsonData.timeline,
    };

    // 构建文字素材对象
    const textMaterial: TextMaterial = {
        id: jsonData.id,
        name: jsonData.name || `Text_${jsonData.id}`,
        type: MaterialType.TEXT,
        createTime: jsonData.createTime || Date.now(),
        path: jsonData.path || '',
        duration: jsonData.duration,
        transform,
        timeline,

        // 文字内容和样式
        content: jsonData.content,
        fontSize: jsonData.fontSize || DEFAULT_TEXT_STYLE.fontSize,
        fontFamily: jsonData.fontFamily || DEFAULT_TEXT_STYLE.fontFamily,
        color: jsonData.color || DEFAULT_TEXT_STYLE.color,
        alignment: jsonData.alignment || DEFAULT_TEXT_STYLE.alignment,
        bold: jsonData.bold ?? DEFAULT_TEXT_STYLE.bold,
        italic: jsonData.italic ?? DEFAULT_TEXT_STYLE.italic,

        // 效果和滤镜
        effects: jsonData.effects || [],
        filters: jsonData.filters || [],

        ...jsonData,
    };

    return textMaterial;
}

// 使用示例：
/*
const jsonData = {
    id: "text1",
    content: "Hello World",
    transform: {
        x: 100,
        y: 100,
        width: 300,
        height: 50
    },
    fontSize: 24,
    color: "#FF0000"
};

try {
    const textMaterial = parseTextMaterial(jsonData);
    console.log(textMaterial);
} catch (error) {
    console.error('Failed to parse text material:', error);
}
*/
