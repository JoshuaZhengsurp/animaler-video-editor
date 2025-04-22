import React, { useEffect, useState } from 'react';
import { InputNumber, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import style from './editor.module.scss';
import useVideoTrackStore from '@/store/useVideoTrackStore';
import { debounce } from 'lodash';
import { eventbus } from '@/utils/pubsub';
import { TRACK_UPDATE_EVENT } from '@/utils/const';

/**
 * @todo 仿照TextEditor组件，完成ImageEditor组件
 * @todo 要求功能： 图片长宽，位置，透明度，修改上次图片资源替换当前图片
 */

const defaultImageConfig = {
    size: {
        width: 200,
        height: 200,
        realWidth: 200,
        realHeight: 200,
    },
    playerPosition: {
        x: 0,
        y: 0,
    },
    opacity: 1,
    duration: 3000,
};

export default function ImageEditor() {
    const selectedTrackId = useVideoTrackStore((s) => s.selectedTrackId);
    const getTrackItem = useVideoTrackStore((s) => s.getTrackItem);
    const addTrackItem = useVideoTrackStore((s) => s.addTrackItem);

    const [editedTrackItem, setEditedTrackItem] = useState<TrackItem | ImageTrackItem | null>(null);

    // 从当前选中的 track item 中获取值，如果没有则使用默认值
    const size = (editedTrackItem as ImageTrackItem)?.size || defaultImageConfig.size;
    const playerPosition =
        (editedTrackItem as ImageTrackItem)?.playerPosition || defaultImageConfig.playerPosition;
    const opacity = (editedTrackItem as ImageTrackItem)?.opacity || defaultImageConfig.opacity;
    const duration = (editedTrackItem as ImageTrackItem)?.duration || defaultImageConfig.duration;

    const debounceUpdateTrackItem = debounce((newTrackItem: TrackItem) => {
        addTrackItem(newTrackItem as TrackItem);
        setEditedTrackItem(newTrackItem);
    }, 8);

    const handleUpdateImageTrack = (path: Array<keyof ImageTrackItem | string>, value: any) => {
        if (!editedTrackItem) return;

        const newTrackItem = editedTrackItem;
        let current: any = newTrackItem;

        // 遍历路径直到倒数第二个元素
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }

        // 设置最后一个属性的值
        current[path[path.length - 1]] = value;
        debounceUpdateTrackItem({ ...newTrackItem } as TrackItem);
    };

    // 处理图片上传
    const handleImageUpload = async (file: File) => {
        if (!editedTrackItem) return false;

        // 创建一个临时的URL以预览图片
        const url = URL.createObjectURL(file);

        // 获取图片的真实尺寸
        const img = new Image();
        img.src = url;
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        // 更新图片路径和尺寸信息
        handleUpdateImageTrack(['path'], url);
        handleUpdateImageTrack(['size'], {
            ...size,
            realWidth: img.width,
            realHeight: img.height,
        });

        return false; // 阻止默认上传行为
    };

    const handleTrackUpdate = (trackId: string) => {
        if (selectedTrackId === trackId) {
            const trackItem = getTrackItem(selectedTrackId);
            if (trackItem) {
                setEditedTrackItem(trackItem);
            }
        }
    };

    // 监听选中的 track 变化
    useEffect(() => {
        handleTrackUpdate(selectedTrackId);
    }, [selectedTrackId]);

    useEffect(() => {
        eventbus.on(TRACK_UPDATE_EVENT, handleTrackUpdate);
        return () => {
            eventbus.off(TRACK_UPDATE_EVENT, handleTrackUpdate);
        };
    }, []);

    return (
        <div className={style['editor']}>
            <div className={style['editor-title']}>图片编辑</div>
            <div className={style['editor-content']}>
                {/* 图片上传 */}
                <div className={style['upload-section']}>
                    <Upload
                        accept='image/*'
                        showUploadList={false}
                        beforeUpload={(file) => handleImageUpload(file)}
                    >
                        <Button icon={<UploadOutlined />}>更换图片</Button>
                    </Upload>
                </div>

                {/* 尺寸控制 */}
                <div className={style['size-controls']}>
                    <div className={style['control-item']}>
                        <label htmlFor='width' className={style['control-label']}>
                            宽度
                        </label>
                        <InputNumber
                            id='width'
                            className={style['control-input']}
                            value={size.width}
                            onChange={(value) => handleUpdateImageTrack(['size', 'width'], value)}
                            min={0}
                            max={size.realWidth * 2}
                            controls={false}
                        />
                    </div>
                    <div className={style['control-item']}>
                        <label htmlFor='height' className={style['control-label']}>
                            高度
                        </label>
                        <InputNumber
                            id='height'
                            className={style['control-input']}
                            value={size.height}
                            onChange={(value) => handleUpdateImageTrack(['size', 'height'], value)}
                            min={0}
                            max={size.realHeight * 2}
                            controls={false}
                        />
                    </div>
                </div>

                {/* 位置控制 */}
                <div className={style['position-controls']}>
                    <div className={style['control-item']}>
                        <label htmlFor='position-x' className={style['control-label']}>
                            X
                        </label>
                        <InputNumber
                            id='position-x'
                            className={style['control-input']}
                            value={playerPosition.x}
                            onChange={(value) =>
                                handleUpdateImageTrack(['playerPosition', 'x'], value)
                            }
                            controls={false}
                        />
                    </div>
                    <div className={style['control-item']}>
                        <label htmlFor='position-y' className={style['control-label']}>
                            Y
                        </label>
                        <InputNumber
                            id='position-y'
                            className={style['control-input']}
                            value={playerPosition.y}
                            onChange={(value) =>
                                handleUpdateImageTrack(['playerPosition', 'y'], value)
                            }
                            controls={false}
                        />
                    </div>
                </div>

                {/* 透明度控制 */}
                <div className={style['opacity-control']}>
                    <div className={style['control-item']}>
                        <label htmlFor='opacity' className={style['control-label']}>
                            透明度
                        </label>
                        <InputNumber
                            id='opacity'
                            className={style['control-input']}
                            value={opacity}
                            onChange={(value) => handleUpdateImageTrack(['opacity'], value)}
                            min={0}
                            max={1}
                            step={0.1}
                            controls={false}
                        />
                    </div>
                </div>
                <div className={style['duration-control']}>
                    <div className={style['control-item']}>
                        <label htmlFor='duration' className={style['control-label']}>
                            duration
                        </label>
                        <InputNumber
                            id='duration'
                            className={style['control-input']}
                            value={duration}
                            onChange={(value) => handleUpdateImageTrack(['duration'], value)}
                            min={0}
                            step={1}
                            controls={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
