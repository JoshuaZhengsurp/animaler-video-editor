import React, { useEffect } from 'react';

import { ffmpegManager } from './utils/ffmpeg/manager';
import Editor from './page/Editor';

import './App.css';
import { useStateStore } from './store/useStateStore';

function App() {
    const { setIsLoading } = useStateStore();

    const init = async () => {
        await ffmpegManager.init();
        setIsLoading(false);
    };

    useEffect(() => {
        init();
    }, []);

    return <Editor />;
}

export default App;
