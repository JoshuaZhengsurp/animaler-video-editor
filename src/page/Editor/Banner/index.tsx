import React, { useState, Fragment, useRef } from 'react';

import { Export } from 'styled-icons/boxicons-regular';

import Icon from '@/components/AppIcon';
import AutoSave from '@/components/AutoSave';
import style from './index.module.scss';

interface IProps {
    className: string;
}

export default function Banner(props: IProps) {
    const [title, setTitle] = useState('title');
    const lastTitle = useRef(title);

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e?.target) {
            setTitle(e.target.value);
        }
    };
    const handleInputFocus = () => {
        lastTitle.current = title;
    };
    const handleInputBlur = () => {
        if (!title) {
            setTitle(lastTitle.current);
        }
    };

    return (
        <div className={`${props.className} ${style['banner-contain']}`}>
            <div className={style['banner-left']}>
                <Icon className={style['banner-ico']} width={42} height={42} />
                <AutoSave />
            </div>
            <div className={style['banner-title']}>
                <input
                    value={title}
                    placeholder="vidoe title"
                    onChange={handleChangeTitle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                />
            </div>
            <div className={`${style['banner-export']} ${style['banner-button']}`}>
                <Export className={`${style['banner-export-svg']}`} size={22} />
                <span>导出</span>
            </div>
        </div>
    );
}
