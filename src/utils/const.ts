export const IS_SHOW_FFMPEG_LOG = localStorage.getItem('IS_SHOW_FFMPEG_LOG') === '1';
export const IS_SHOW_TRANCODE_STATUS = localStorage.getItem('IS_SHOW_TRANCODE_STATUS') === 'true';

export const PER_SECOND = 1000;

export const PATH_CONFIG = {
    resourcePath: '/resource/', // 资源目录，存放视频、音频等大文件
    framePath: '/frame/', // 持久化帧文件，用于轨道
    playFrame: '/pframe/', // 播放帧文件，因为文件体积大，可能会不定时删除
    audioPath: '/audio/', // 合成音频文件
    logPath: '/logs/', // 命令日志文件目录
    wavePath: '/wave/', // 音频波形文件目录
};

export const START_FRAME_INDEX_KEY = '#FRAME#';

export const TRACK_ITEM_HEIGHT = 56; //px
