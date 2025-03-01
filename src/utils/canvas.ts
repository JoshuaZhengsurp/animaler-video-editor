/**
 * @description 处理canvas 相关方法库
 */
import { PER_SECOND } from './const';
import { TimeLineConfig } from '@/components/VideoTrack/TimeLine/config';

/**
 * 时间轴格子长度
 * @param duration 视频总时长（秒）
 * @param timeLineWidth 时间轴总宽度（像素）
 * @returns [大格子宽度, 小格子宽度]
 */
const getGridWidth = (timeLineWidth: number, duration?: number) => {
    // 计算每像素代表的秒数
    !duration && (duration = 15 * PER_SECOND);
    const secondsPerPixel = duration / timeLineWidth;

    // 根据时长选择合适的时间单位和间隔
    let timeInterval: number; // 每个大格子代表的秒数

    if (duration <= 60 * PER_SECOND) {
        // 1分钟以内，以1秒为单位
        timeInterval = 1;
    } else if (duration <= 300 * PER_SECOND) {
        // 5分钟以内，以5秒为单位
        timeInterval = 5;
    } else if (duration <= 600 * PER_SECOND) {
        timeInterval = 15;
    } else if (duration <= 900 * PER_SECOND) {
        // 15分钟以内，以1分钟为单位
        timeInterval = 60;
    } else if (duration <= 3600 * PER_SECOND) {
        // 1小时以内，以5分钟为单位
        timeInterval = 2 * 60;
    } else {
        // 超过1小时，以15分钟为单位
        timeInterval = 4 * 60;
    }

    // 计算大格子的像素宽度
    const bigGridWidth = Math.max(timeLineWidth * 0.1, (4 * timeInterval) / secondsPerPixel);
    // 小格子宽度为大格子的1/4
    const smallGridWidth = bigGridWidth / 4;

    return {
        ceil: timeInterval,
        grid: [bigGridWidth, smallGridWidth],
    };
};

// let ishasScale = false;

export const drawTimeLine = (
    canvasContext: CanvasRenderingContext2D,
    { duration }: { duration: number },
    timeLineConfig: TimeLineConfig & { width: number; height: number },
) => {
    // const DEV_IS_HAVE_SCALE = 'DEV_IS_HAVE_SCALE';
    const {
        width,
        height,
        ratio,
        longColor,
        shortColor,
        bgColor,
        textSize,
        textAlign,
        textBaseline,
        textColor,
        lineWidth,
    } = timeLineConfig;
    if (!width || !height) {
        return null;
    }

    // console.log(ishasScale, sessionStorage.getItem(DEV_IS_HAVE_SCALE));

    // canvasContext.scale(ratio, ratio);
    if (canvasContext.__radio__ !== ratio) {
        // console.log(canvasContext.__radio__);
        canvasContext.scale(ratio, ratio);
        canvasContext.__radio__ = ratio;
    }
    canvasContext.clearRect(0, 0, width, height);
    canvasContext.fillStyle = bgColor;
    canvasContext.fillRect(0, 0, width, height);

    // 添加平移操作，确保 0:00 能完全显示
    const translateX = 1.02 * 16; // 向右平移一个数字的宽度
    canvasContext.translate(translateX, 0);

    // 绘制时间轴刻度
    const data = getGridWidth(width, duration);
    const [bigGridWidth, smallGridWidth] = data.grid;
    const ceil = data.ceil;

    const totalGrids = Math.ceil(width / bigGridWidth); // 总大格数

    canvasContext.beginPath();
    canvasContext.strokeStyle = longColor;
    canvasContext.lineWidth = lineWidth;
    canvasContext.font = `${textSize}px Arial`;
    canvasContext.fillStyle = textColor;
    canvasContext.textAlign = textAlign;
    canvasContext.textBaseline = textBaseline;

    // 绘制大格和时间文本
    for (let i = 0; i <= totalGrids; i++) {
        const x = i * bigGridWidth;
        // 绘制大格线
        canvasContext.moveTo(x, height / 2);
        // canvasContext.lineTo(x, height);

        // 绘制时间文本
        const seconds = i * ceil * 4;
        const timeText = formatTime(seconds);
        canvasContext.fillText(timeText, x, (height - textSize * 0.6) / 2);
    }
    canvasContext.stroke();

    canvasContext.strokeStyle = shortColor;
    const totalSmallGrids = Math.ceil(width / smallGridWidth);
    const dotRadius = 2; // 圆点半径
    const dotY = height * 0.5 + dotRadius; // 圆点垂直位置，设在下半部分

    for (let i = 0; i <= totalSmallGrids; i++) {
        const x = i * smallGridWidth;
        // 如果不是大格的位置才绘制小圆点
        if (i % 4 !== 0) {
            canvasContext.beginPath();
            canvasContext.arc(x, dotY, dotRadius, 0, Math.PI * 2);
            canvasContext.fill();
        }
    }

    canvasContext.stroke();

    // 重置变换，避免影响后续绘制
    canvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);

    return {
        ceil: ceil * PER_SECOND,
        perCeilGridWidth: smallGridWidth,
    };
};

// 格式化时间显示
const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
