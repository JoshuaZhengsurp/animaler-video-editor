import React, { useEffect, useState } from 'react';
import { Select, InputNumber, Input } from 'antd';
import { TypeBold, TypeItalic } from '@styled-icons/bootstrap';
import style from './editor.module.scss';
import useVideoTrackStore from '@/store/useVideoTrackStore';

const fontFamilies = [
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
];

const defaultTextConfig = {
    fontFamily: 'Open Sans',
    fontSize: 16,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    hasBackground: false,
};

const fontSizes = Array.from({ length: 61 }, (_, i) => ({
    value: (i + 4) * 2,
    label: `${(i + 4) * 2}`,
}));

export default function TextEditor() {
    const selectedTrackId = useVideoTrackStore((s) => s.selectedTrackId);
    const getTrackItem = useVideoTrackStore((s) => s.getTrackItem);
    const addTrackItem = useVideoTrackStore((s) => s.addTrackItem);

    const [editedTrackItem, setEditedTrackItem] = useState<TrackItem | TextTrackItem | null>(null);
    const fontFamily =
        (editedTrackItem as TextTrackItem)?.style?.fontFamily || defaultTextConfig.fontFamily;
    const fontSize =
        (editedTrackItem as TextTrackItem)?.style?.fontSize || defaultTextConfig.fontSize;
    const isBold =
        (editedTrackItem as TextTrackItem)?.style?.fontWeight === 'bold' ||
        defaultTextConfig.isBold;
    const isItalic =
        (editedTrackItem as TextTrackItem)?.style?.fontStyle === 'italic' ||
        defaultTextConfig.isItalic;
    // const [isUnderline, setIsUnderline] = useState(false);
    const hasBackground = !!(editedTrackItem as TextTrackItem)?.style?.backgroudColor || false;
    const playerPosition = (editedTrackItem as TextTrackItem)?.playerPosition || { x: 0, y: 0 };

    const handleUpdateTextTrackStyle = (path: string[], value: any) => {
        let curPtr = editedTrackItem;
        for (let i = 0; i < path.length - 1; ++i) {
            curPtr && (curPtr = curPtr[path[i]]);
        }
        curPtr && (curPtr[path[path.length - 1]] = value);
        addTrackItem(editedTrackItem as TrackItem);
        setEditedTrackItem(() => {
            if (editedTrackItem) {
                return { ...editedTrackItem };
            }
            return null;
        });
    };

    useEffect(() => {
        console.log('selectedTrackId');
        const trackItem = getTrackItem(selectedTrackId);
        if (trackItem) {
            setEditedTrackItem(trackItem);
        }
    }, [selectedTrackId]);

    return (
        <div className={style['editor']}>
            <div className={style['editor-title']}>文字编辑</div>
            <div className={style['editor-content']}>
                {/* 字体和字号选择 */}
                <div className={style['font-controls']}>
                    <Select
                        value={fontFamily}
                        onChange={(value) =>
                            handleUpdateTextTrackStyle(['style', 'fontFamily'], value)
                        }
                        options={fontFamilies}
                        className={style['font-family']}
                    />
                    <Select
                        value={fontSize}
                        onChange={(value) =>
                            handleUpdateTextTrackStyle(['style', 'fontSize'], value)
                        }
                        options={fontSizes}
                        className={style['font-size']}
                    />
                    <div className={style['color-picker']}>
                        <input
                            type='color'
                            title='Text color'
                            aria-label='Text color'
                            value={(editedTrackItem as TextTrackItem)?.style.color || '#ffffff'}
                            onChange={(e) =>
                                handleUpdateTextTrackStyle(
                                    ['style', 'color'],
                                    e?.target.value || '#fff',
                                )
                            }
                        />
                    </div>
                </div>

                {/* 文字样式控制 */}
                <div className={style['style-controls']}>
                    <div className={style['style-btn-list']}>
                        <button
                            className={`${style['style-btn']} ${isBold ? style['active'] : ''}`}
                            onClick={() =>
                                handleUpdateTextTrackStyle(
                                    ['style', 'fontWeight'],
                                    !isBold ? 'bold' : '',
                                )
                            }
                            title='Bold'
                            aria-label='Bold'
                        >
                            <TypeBold size={20} />
                        </button>
                        <button
                            className={`${style['style-btn']} ${isItalic ? style['active'] : ''}`}
                            onClick={() =>
                                handleUpdateTextTrackStyle(
                                    ['style', 'fontStyle'],
                                    !isItalic ? 'italic' : 'normal',
                                )
                            }
                            title='Italic'
                            aria-label='Italic'
                        >
                            <TypeItalic size={20} />
                        </button>
                    </div>
                    {/* <button
                        className={`${style['style-btn']} ${isUnderline ? style['active'] : ''}`}
                        onClick={() => setIsUnderline(!isUnderline)}
                        title='Underline'
                        aria-label='Underline'
                    >
                        <TypeUnderline size={20} />
                    </button> */}
                    <div className={style['text-width']}>
                        <div className={style['text-width-item']}>
                            <label htmlFor='text-width' className={style['text-width-label']}>
                                宽度
                            </label>
                            <InputNumber
                                id='text-width'
                                className={style['text-width-input']}
                                value={(editedTrackItem as TextTrackItem)?.style.width || 0}
                                onChange={(value) =>
                                    handleUpdateTextTrackStyle(['style', 'width'], value)
                                }
                                min={0}
                                max={9999}
                                controls={false}
                                title='width'
                                aria-label='width'
                            />
                        </div>
                    </div>
                </div>

                {/* 特效控制 */}
                <div className={style['effects-controls']}>
                    <div className={style['text-content']}>
                        <div className={style['text-content-item']}>
                            <label htmlFor='text-content-x' className={style['text-content-label']}>
                                Text
                            </label>
                            <Input
                                id='text-content-x'
                                className={style['text-content-input']}
                                value={(editedTrackItem as TextTrackItem)?.content || ''}
                                onChange={(value) =>
                                    handleUpdateTextTrackStyle(
                                        ['content'],
                                        value?.target.value || '',
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className={style['duration']}>
                        <div className={style['duration-item']}>
                            <label htmlFor='duration-x' className={style['duration-label']}>
                                duration
                            </label>
                            <InputNumber
                                id='duration'
                                className={style['duration-input']}
                                value={Math.round((editedTrackItem as TextTrackItem)?.duration)}
                                onChange={(value) =>
                                    handleUpdateTextTrackStyle(['duration'], value)
                                }
                                min={0}
                                controls={false}
                                title='duration'
                                aria-label='duration'
                            />
                        </div>
                    </div>
                    {/* 位置控制 */}
                    <div className={style['position']}>
                        <div className={style['position-item']}>
                            <label htmlFor='position-x' className={style['position-label']}>
                                X
                            </label>
                            <InputNumber
                                id='position-x'
                                className={style['position-input']}
                                value={playerPosition.x}
                                onChange={(value) =>
                                    handleUpdateTextTrackStyle(['playerPosition', 'x'], value)
                                }
                                min={0}
                                max={9999}
                                controls={false}
                                title='X position'
                                aria-label='X position'
                            />
                        </div>
                        <div className={style['position-item']}>
                            <label htmlFor='position-y' className={style['position-label']}>
                                Y
                            </label>
                            <InputNumber
                                id='position-y'
                                className={style['position-input']}
                                value={playerPosition.y}
                                onChange={(value) =>
                                    handleUpdateTextTrackStyle(['playerPosition', 'y'], value)
                                }
                                min={0}
                                max={9999}
                                controls={false}
                                title='Y position'
                                aria-label='Y position'
                            />
                        </div>
                    </div>

                    <div className={style['effect-item']}>
                        <label className={style['effect-label']} htmlFor='background-effect'>
                            <span className={style['background-icon']}></span>
                            Background
                        </label>
                        <input
                            id='background-effect'
                            type='checkbox'
                            checked={hasBackground}
                            onChange={(e) => {}}
                            aria-label='Toggle background effect'
                        />
                    </div>

                    {/* <div className={style['effect-item']}>
                        <label className={style['effect-label']} htmlFor='stroke-effect'>
                            <span className={style['stroke-icon']}></span>
                            Stroke
                        </label>
                        <input
                            id='stroke-effect'
                            type='checkbox'
                            checked={hasStroke}
                            onChange={(e) => setHasStroke(e.target.checked)}
                            aria-label='Toggle stroke effect'
                        />
                    </div> */}
                </div>

                {/* 重置按钮 */}
                {/* <button className={style['reset-btn']} onClick={handleReset}>
                    Reset
                </button> */}
            </div>
        </div>
    );
}
