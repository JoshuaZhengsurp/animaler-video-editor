export function getVideoFrameIndexByTimestamp(time: number, fps: number) {
    const startPFrameTimestamp = Math.floor(time);
    return {
        startPFrameTimestamp,
        frameIndex: Math.round((time - startPFrameTimestamp) * fps) + 1,
    };
}

/************************** 解码时获取视频metadata ***************************/
/**
 * @description 获取解释时的视频metaData
 * @todo 考虑也在node做解码，使用C++桥接node，来解码视频数据（如果后续打算用c++来代替解码模块）
 * @todo 在解析视频时，log输入内容中，有一项是是(XXX, YYY)导致解码有问题
 * 目前实现方式：通过链表，构建出metadata树形结构数据
 */

const VIDEO_INFO = 'videoInfo';
let lastMessage = '';

enum VideoTransInfoPropName {
    OTHER,
    INPUT,
    OUTPUT,
}

export enum TransLogProcessState {
    INIT,
    NEXT,
    LAST,
    NO_CHANGE,
}

let curVideoTransInfoPropName: VideoTransInfoPropName = 0;

// 获取每行前面的空格数
const getIndentation = (msg: string) => {
    const match = msg.match(/^\s*/); // 匹配行首的所有空格
    return {
        msg: msg.trim(), // 去掉前后的空格，保留内容
        spaces: match ? match[0].length : 0, // 空格的长度
    };
};

export const getMetaDataWithTranMessage = (
    message: string,
    metadata: Record<string, any>,
): MetaDataWithTranMessageType | {} => {
    if (lastMessage === message) {
        return {};
    }

    lastMessage = message;
    const { msg, spaces } = getIndentation(message);
    if (spaces !== 0) {
        if (
            curVideoTransInfoPropName === VideoTransInfoPropName.INPUT ||
            curVideoTransInfoPropName === VideoTransInfoPropName.OUTPUT
        ) {
            const curSpacesNumber = metadata?.spaces || 0;
            const msgInfo = msg.split(',').map((info) => {
                return info.split(': ').map((item) => item.trim());
            });

            let result: Record<string, any> = {};
            let nextPropName = '';

            if (msgInfo.length === 1 && msgInfo[0].length === 1) {
                nextPropName = msgInfo[0][0] as string;
                result[nextPropName] = {};
            } else if (msgInfo.length) {
                nextPropName = msgInfo[0][0] as string;
                msgInfo.forEach((items) => {
                    const iLen = items.length;
                    if (iLen === 1) {
                        result?.[VIDEO_INFO]
                            ? result[VIDEO_INFO].push(items[0])
                            : (result[VIDEO_INFO] = [items[0]]);
                    } else {
                        if (iLen === 2) {
                            result[items[0]] = items[1];
                        } else {
                            result[items[0]] = items.slice(1);
                        }
                    }
                });
            }

            // console.log('result', curSpacesNumber, spaces, nextPropName, result, metadata);

            if (curSpacesNumber < spaces) {
                metadata.data = Object.assign(metadata.data, result);
                return {
                    transLogProcessState: TransLogProcessState.NEXT,
                    spaces,
                    propName: nextPropName,
                };
            } else if (curSpacesNumber === spaces) {
                while (metadata?.spaces && metadata.spaces >= spaces) {
                    metadata = metadata.last;
                }
                metadata.data = Object.assign(metadata.data, result);
                return {
                    transLogProcessState: TransLogProcessState.NO_CHANGE,
                    spaces: spaces,
                    newCurMetaData: metadata,
                    propName: nextPropName,
                };
            } else {
                while (metadata?.spaces && metadata.spaces >= spaces) {
                    metadata = metadata.last;
                }
                metadata.data = Object.assign(metadata.data, result);
                return {
                    transLogProcessState: TransLogProcessState.LAST,
                    spaces: spaces,
                    newCurMetaData: metadata,
                    propName: nextPropName,
                };
            }
        } else {
            return {};
        }
    } else {
        if (msg.includes('Input #')) {
            curVideoTransInfoPropName = VideoTransInfoPropName.INPUT;
            // console.log('[INPUT]', spaces, msg);
            metadata.data.input = {};
            return {
                transLogProcessState: TransLogProcessState.NEXT,
                propName: 'input',
                spaces: 0,
            };
        } else if (msg.includes('Output #')) {
            curVideoTransInfoPropName = VideoTransInfoPropName.OUTPUT;
            // console.log('[OUTPUT]', spaces, msg);
            metadata.data.output = {};
            return {
                transLogProcessState: TransLogProcessState.NEXT,
                propName: 'output',
                spaces: 0,
            };
        } else {
            curVideoTransInfoPropName = VideoTransInfoPropName.OTHER;
            return { transLogProcessState: TransLogProcessState.INIT, spaces: 0 };
        }
    }
};
/************************** 解码时获取视频metadata ***************************/
