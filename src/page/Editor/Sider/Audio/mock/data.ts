import audio_0PNG from '../assets/audio_0.png';
import audio_1PNG from '../assets/audio_1.png';
import audio_2PNG from '../assets/audio_2.png';
import audio_3PNG from '../assets/audio_3.png';

export const mockAudioData = {
    type: 'audio',
    items: [
        {
            id: 0,
            cover: audio_0PNG,
            time: 25000,
            format: 'mp3',
            name: '测试音频1',
            source: '/audio/audio_0.mp3',
        },
        {
            id: 1,
            cover: audio_1PNG,
            time: 16000,
            format: 'mp3',
            name: '测试音频2',
            source: '/audio/audio_1.mp3',
        },
        {
            id: 2,
            cover: audio_2PNG,
            time: 41000,
            format: 'mp3',
            name: '测试音频3',
            source: '/audio/audio_2.mp3',
        },
        {
            id: 3,
            cover: audio_3PNG,
            time: 46000,
            format: 'mp3',
            name: '测试音频4',
            source: '/audio/audio_2.mp3',
        },
    ],
};
