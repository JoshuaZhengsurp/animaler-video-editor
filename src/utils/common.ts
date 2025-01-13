/**
 * @description 获取解释时的视频metaData
 * @todo 考虑也在node做解码，使用C++桥接node，来解码视频数据（如果后续打算用c++来代替解码模块）
 */

const tmp = '';
let lastMessage = '';
// let lastTabNumber = 0;
let videoTransInfoPropName: 'input' | 'output' | '' = '';

// 获取每行前面的空格数
const getIndentation = (msg: string) => {
    const match = msg.match(/^\s*/); // 匹配行首的所有空格
    return {
        msg: msg.trim(), // 去掉前后的空格，保留内容
        spaces: match ? match[0].length : 0, // 空格的长度
    };
};

export const getMetaDataWithTranMessage = (message: string, metadata: Record<string, any>) => {
    if (lastMessage === message) {
        return;
    }
    console.log(message);
    lastMessage = message;
    // const { msg, spaces } = getIndentation(message);
    // if (spaces === 0) {

    // }
    // if (message.includes('input')) {
    //     console.log(message);
    // }
    return metadata;
};
