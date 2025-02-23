import React, { useMemo } from 'react';
import { useVideoStore } from '@/store/useVideoDataStore';

import Duration from '@/components/VideoTrack/Duration';
import TimeLine from '@/components/VideoTrack/TimeLine';
import TimePointer from '@/components/VideoTrack/TimePointer';
import TrackContent from '@/components/VideoTrack/TrackContent';

import style from './index.module.scss';

/**
 * @todo 通过canvas绘制播放视频
 */

export default function Track() {
    // const {getVideoDuration} = useVideoStore((s)=>s.getVideoDuration);

    const videoList = useVideoStore((s) => s.videos);

    const mainVideo = useMemo(() => videoList[0] || null, [videoList]);

    return (
        <div className={style['track']}>
            <div className={style['track-banner']}>
                {/* todo: 更多操作 */}
                {/* todo: duration  */}
                <Duration
                    className='h-8 flex items-center text-xs'
                    curDurationClassName='inline-block mr-1'
                    durationClassName='inline-block ml-1 text-gray-500'
                    duration={mainVideo?.duration || 0}
                    curDuration={0}
                />
            </div>
            <div className={style['track-video']}>
                {/* 时间线, 需要同步位置啥的 */}
                <TimeLine className='w-full h-8 bg-light-50' duration={mainVideo?.duration || 0} />
                <TrackContent className='h-full w-full grow' />
                <TimePointer left={0} />
            </div>
        </div>
    );
}
