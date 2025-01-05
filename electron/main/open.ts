import {app, dialog, ipcMain} from 'electron'

export function open() {
    ipcMain.handle('dialog:openFile', handleFileOpen);
}

async function handleFileOpen() {
    console.log('handleFileOpen');
    const {canceled, filePaths} = await dialog.showOpenDialog({});
    if(!canceled) {
        console.log(filePaths);
        return filePaths[0];
    }
}