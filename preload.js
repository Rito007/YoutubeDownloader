const { contextBridge, ipcRenderer } = require('electron')


contextBridge.exposeInMainWorld("winApi",{
    uploadMusic: (url) => ipcRenderer.send('get-music', url),
    downloadMusic: (path) => ipcRenderer.send('download-music', path),
    deleteMusic: (path) => ipcRenderer.send('delete-music', path),
    mainMusics: (musicas) => ipcRenderer.on('musics-list', musicas),
    getPath: () => ipcRenderer.send('getPath'),
    onPathReceived: (pathReceived)=> ipcRenderer.on('receivePath', pathReceived),
    downloadInProgress: (percentage, title) => ipcRenderer.on('receivePercentage', percentage, title),
    onDownloadFinish: (nothing)=>ipcRenderer.on('downloadFinish', nothing),
    requestWeb: (url)=>ipcRenderer.send('request-Url', url)
})
