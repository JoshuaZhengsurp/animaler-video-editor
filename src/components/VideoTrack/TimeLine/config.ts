export interface TimeLineConfig {
    bgColor: string;
    ratio: number;
    textSize: number;
    textScale: number;
    lineWidth: number;
    textBaseline: 'alphabetic' | 'bottom' | 'hanging' | 'ideographic' | 'middle' | 'top';
    textAlign: 'center' | 'end' | 'left' | 'right' | 'start';
    longColor: string;
    shortColor: string;
    textColor: string;
    subTextColor: string;
    focusColor: string;
}

function getTimeLineConfig(isDark: boolean): TimeLineConfig {
    return {
        bgColor: isDark ? '#13131B' : '#E5E7EB', // 背景颜色
        // ratio: window.devicePixelRatio, // 设备像素比
        ratio: 1, // render的时候可能导致重复scale；暂且统一为1
        textSize: 11, // 字号
        textScale: 0.83, // 支持更小号字： 10 / 12
        lineWidth: 2, // 线宽
        // eslint-disable-next-line
        textBaseline: 'top', // 文字对齐基线 (ts 中定义的textBaseLine是一个联合类型)
        // eslint-disable-next-line
        textAlign: 'center' as 'center', // 文字对齐方式
        longColor: isDark ? '#ABABC0' : '#374151', // 长线段颜色
        shortColor: isDark ? '#ABABC0' : '#6B7280', // 短线段颜色
        textColor: isDark ? '#ABABC0' : '#374151', // 文字颜色
        subTextColor: isDark ? '#9CA3AF' : '#6B7280', // 小文字颜色
        focusColor: isDark ? '#6D28D9' : '#C4B5FD', // 选中元素区间
    };
}

const defaultTimeLineConfig = getTimeLineConfig(true);

export { defaultTimeLineConfig, getTimeLineConfig };
