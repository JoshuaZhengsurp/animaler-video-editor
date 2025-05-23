import React, { useEffect, useRef, useState } from 'react';
import { useVideoStore } from '@/store/useVideoDataStore';

import Duration from '@/components/VideoTrack/Duration';
import TimeLine from '@/components/VideoTrack/TimeLine';
import TimePointer from '@/components/VideoTrack/TimePointer';
import TrackContent from '@/components/VideoTrack/TrackContent';

import style from './index.module.scss';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { PlayState, useVideoPlayerStore } from '@/store/useVideoPlayerStore';
import { debounce } from 'lodash';

/**
 * @todo 通过canvas绘制播放视频
 */

export default function Track() {
    const videoTrackStore = useVideoTrackStore();
    const currentTime = useVideoTrackStore((s) => s.currentTime);
    const tracks = useVideoTrackStore((s) => s.tracks);
    const selectTrackId = useVideoTrackStore((s) => s.selectedTrackId);
    const splitTrackItem = useVideoTrackStore((s) => s.splitTrackItem);
    const deleteTrackItem = useVideoTrackStore((s) => s.deleteTrackItem);
    const setCurrentTime = useVideoTrackStore((s) => s.setCurrentTime);
    const setPlayerState = useVideoPlayerStore((s) => s.setPlayState);

    const [pointerPosition, setPointerPosition] = useState(0);
    const initLockRef = useRef(false);

    // const mainVideo = useMemo(() => videoList[0] || null, [videoList]);

    const isDragTimePointerEffect = useRef(false);

    const debounceUpdatePlayerState = debounce(() => {
        setPlayerState(PlayState.READY);
    }, 100);

    const handleUpdateTimestamp = (position: number) => {
        if (position >= 0) {
            isDragTimePointerEffect.current = true;
            const curTimestamp = videoTrackStore.getCurrentTimeByPosition(position);
            videoTrackStore.setCurrentTime(curTimestamp);
            setPlayerState(PlayState.PAUSE);
            setPointerPosition(() => {
                debounceUpdatePlayerState();
                return position;
            });
        }
    };

    const handleUpdatePosition = (timestamp: number) => {
        if (timestamp >= 0) {
            const position = videoTrackStore.getCurrentPositionByTime(timestamp);
            setPointerPosition(position);
        }
    };

    // 视频音轨分离
    const handleVideoSplit = async () => {
        if (selectTrackId) {
            splitTrackItem(selectTrackId);
        }
    };

    // 音轨删除
    const handleVideoDelete = () => {
        if (selectTrackId) {
            deleteTrackItem(selectTrackId);
        }
    };

    // 使用isDragTimePointerEffect目的是，避免拖拽时间轴是重复触发
    useEffect(() => {
        if (!isDragTimePointerEffect.current) {
            handleUpdatePosition(videoTrackStore.currentTime);
        } else {
            isDragTimePointerEffect.current = false;
        }
    }, [currentTime]);

    // 首次track完成加载后，让player设置为ready状态
    useEffect(() => {
        if (!initLockRef.current && tracks.length) {
            console.log('initLockRef', tracks);
            initLockRef.current = true;
            setCurrentTime(0);
            setPlayerState(PlayState.READY);
        }
    }, [tracks]);

    return (
        <div className={style['track']}>
            <div className={style['track-banner']}>
                {/* todo: 更多操作 */}
                {/* todo: duration  */}
                <div className={style['track-banner-left']}>
                    <span onClick={handleVideoSplit}>剪切</span>
                    <span onClick={handleVideoDelete}>删除</span>
                </div>
                <Duration
                    className='h-8 flex items-center text-xs'
                    curDurationClassName='inline-block mr-1'
                    durationClassName='inline-block ml-1 text-gray-500'
                    duration={videoTrackStore.duration || 0}
                    curDuration={videoTrackStore.currentTime}
                />
            </div>
            <div className={style['track-video']}>
                <TimeLine
                    className='w-full h-8 bg-light-50'
                    duration={videoTrackStore.duration || 0}
                />
                <TrackContent className='h-full w-full grow' tracks={tracks} />
                <TimePointer left={pointerPosition} updateTimestamp={handleUpdateTimestamp} />
            </div>
        </div>
    );
}
