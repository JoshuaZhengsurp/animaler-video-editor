import {dialog, ipcMain} from 'electron'
import fs from 'fs'

export function open() {
    ipcMain.handle('dialog:openFile', handleFileOpen);
}

async function handleFileOpen() {
    console.log('handleFileOpen');
    const {canceled, filePaths} = await dialog.showOpenDialog({});
    if(!canceled) {
        console.log(filePaths);
        return filePaths[0];
        // return await getVideoData(filePaths[0]);
    }
}

/**
 * @todo 获取视频数据，转Uint8Array？
*/
async function getVideoData(filePath: string) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
            }
            const videoData = new Uint8Array(data);
            resolve(videoData);
        });
    })
}
