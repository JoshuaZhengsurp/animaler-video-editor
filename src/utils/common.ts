export const formatDurationTime = (duration: string) => {
    if (duration) {
        const reg = /(\d+):(\d{2}):(\d+(?:\.\d+)?)/;
        const match = duration.match(reg);

        const h = match?.[1] ? +match?.[1] : 0;
        const m = match?.[2] ? +match?.[2] : 0;
        const s = match?.[3] ? +match?.[3] : 0;

        return (h * 60 * 60 + m * 60 + s) * 1000;
    }
    return -1;
};

/**
 * @description 补充前置0，转成字符串；
 * @param num num > 0
 */
export const formatPrefixZero = (num = 0, preZeroNum = 0) => {
    const numLen = num > 0 ? Math.floor(Math.log10(num) + 1) : 1;
    if (numLen < preZeroNum) {
        // 添加preZeroNum-numLen个前置零
        return '0'.repeat(preZeroNum - numLen) + num;
    }
    return num;
};

export const formatDurationTimeToString = (duration = 0, isSecondFloor = false) => {
    // debugger;
    let s = formatPrefixZero(
        isSecondFloor
            ? (duration % (60 * 1000)) / 1000
            : Math.floor((duration % (60 * 1000)) / 1000),
        2,
    );
    duration = Math.floor(duration / (60 * 1000));
    let m = formatPrefixZero(duration % 60, 2);
    let h = formatPrefixZero(Math.floor(duration / 60), 2);
    return `${h}:${m}:${s}`;
};

/**
 * 将视频分辨率字符串“256x240”提取，生成宽、高和宽高比；
 */
export const parseVideoResolution = (resolution: string) => {
    const match = resolution.match(/^(\d+)x(\d+)$/);
    if (!match) return null;

    const height = parseInt(match[1], 10);
    const width = parseInt(match[2], 10);
    const ratio = width / height;

    return { width, height, ratio };
};

/**
 * 计算在容器中保持指定宽高比的适应尺寸
 * @param containerDimensions - 容器尺寸 [宽度, 高度]
 * @param containerAspectRatio - 容器宽高比
 * @param targetAspectRatio - 目标宽高比
 * @returns [width, height] - 计算后的尺寸，保持目标宽高比且适应容器
 */
export const calculateFitDimensions = (
    containerDimensions: number[],
    containerAspectRatio: number,
    targetAspectRatio: number,
) => {
    const [containerWidth, containerHeight] = containerDimensions;
    let fitWidth = containerWidth;
    let fitHeight = containerHeight;

    // 检查尺寸是否为有效的正数
    if (!containerWidth || !containerHeight || containerWidth <= 0 || containerHeight <= 0) {
        throw new Error('容器宽度和高度必须大于0');
    }

    // 检查宽高比是否为有效的正数
    if (
        !containerAspectRatio ||
        !targetAspectRatio ||
        containerAspectRatio <= 0 ||
        targetAspectRatio <= 0
    ) {
        throw new Error('容器宽高比和目标宽高比必须大于0');
    }

    if (targetAspectRatio > containerAspectRatio) {
        fitWidth = containerWidth;
        fitHeight = fitWidth / targetAspectRatio;
    } else {
        fitHeight = containerHeight;
        fitWidth = fitHeight * targetAspectRatio;
    }

    return [fitWidth, fitHeight];
};

/**
 * 计算子盒子在容器中的居中位置
 * @param containerDimensions - 容器盒子尺寸 [宽度, 高度]
 * @param childDimensions - 子盒子尺寸 [宽度, 高度]
 * @returns [x, y] - 子盒子左上角的坐标位置
 */
export const calculateCenterPosition = (
    containerDimensions: number[],
    childDimensions: number[],
): [number, number] => {
    const [containerWidth, containerHeight] = containerDimensions;
    const [childWidth, childHeight] = childDimensions;

    // 检查输入参数是否有效
    if (containerWidth <= 0 || containerHeight <= 0 || childWidth <= 0 || childHeight <= 0) {
        throw new Error('容器和子盒子的尺寸必须大于0');
    }

    // 计算居中位置的x和y坐标
    const x = Math.max(0, (containerWidth - childWidth) / 2);
    const y = Math.max(0, (containerHeight - childHeight) / 2);

    return [x, y];
};
// export const splitFileNameAndSuffix = (name: string) => {
//     const fileName = origin.split(/[\\/]/).pop() || '';
//     const fileSuffix = fileName.split('.').pop() || '';
// }

/**
 * @description 比较浮点数；差值1e-4认为等于
 * @parma a
 * @parma b
 * @returns a <= b
 */
export const cmpFloat = (a: number, b: number) => {
    return a < b || Math.abs(a - b) < 1e-4;
};

/**
 * @description 四舍五入，保留指定位数的小数（确认会是6位以内，避免精度和性能丢失）
 * @param num 需要处理的数字
 * @param decimals 需要保留的小数位数（0-6）
 * @returns 处理后的数字
 */
export const fixFloat = (num: number, decimals: number): number => {
    const multiplier = Math.pow(10, decimals);
    return Math.round(num * multiplier) / multiplier;
};

export const fixPlayerFrameTime = (time: number, frameInterval: number) => {
    const fixedTimestamp = Math.round(time / frameInterval) * frameInterval;
    return {
        fixedTimestamp,
        hasFix: cmpFloat(fixedTimestamp, time),
    };
};
