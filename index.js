const { app, BrowserWindow, ipcMain, dialog, shell} = require('electron');
const Path = require("path")
const fs = require('fs')
const ytdl = require('ytdl-core');
let ffmpegPath =require('@ffmpeg-installer/ffmpeg').path;
let musicDefaultPath = Path.join(__dirname, 'musicas');
const Ffmpeg = require('fluent-ffmpeg')

const isDev = false




let musicas = [];
let win = BrowserWindow


const createWindow = () => {
    win = new BrowserWindow({
      width: 1000,
      height: 600,
      webPreferences:{preload: Path.join(__dirname,'./preload.js')},
      minHeight:599,
      minWidth:999,
      maxHeight:601,
      maxWidth: 1001,
      autoHideMenuBar: !isDev,
      fullscreenable: false,
      fullscreen: false,
      maximizable:isDev,
      icon: Path.join(__dirname,'./icon.ico')

    });
    

    if(!isDev)
    {
        musicDefaultPath = Path.join(__dirname.replace("app.asar", ""), 'musicas');
        ffmpegPath = Path.join(__dirname.replace("app.asar", "ffmpeg.exe"))
    }
   
    ipcMain.on('request-Url',(event, url)=>reqWeb(url))
    ipcMain.on('get-music', (event,url)=>getMusicInfo(url))
    ipcMain.on('delete-music', (event,titulo)=>deleteMusic(titulo))
    ipcMain.on('download-music', (event, path)=>downloadMusic(path))
    ipcMain.on('getPath', (event)=>getPath())
    win.loadFile(Path.join(__dirname,'Pages/index.html'));
    
  };



  app.whenReady().then(() => {
    createWindow();
  });


  app.on("window-all-closed",()=>{
    if(process.platform !== "darwin") app.quit();
  });


  const deleteMusic = (titulo)=>{
      musicas.forEach((musica)=>{
        if(musica.videoDetails.title === titulo)
        {
          musicas.splice(musicas.indexOf(musica),1)
        }
      })
      win.webContents.send('musics-list', musicas)
  }

  const getPath = ()=>{
    let pathArchive
    dialog.showOpenDialog(win,{properties:['openDirectory']}).then((result)=>{
      if(result.canceled) 
      {
        pathArchive = musicDefaultPath
      }
      else
      {
        pathArchive= result.filePaths
      }
      win.webContents.send('receivePath', pathArchive)
    })
  }

  const getMusicInfo = async (url)=>
  {
      let isRepeated = false
      try{
        let info = await ytdl.getInfo(url)
        musicas.forEach((musica)=>
      {
        if(musica.videoDetails.title === info.videoDetails.title)
        {
          dialog.showMessageBox(win, {title: 'Adicionar', message: 'Não podes adicionar músicas iguais'})
          isRepeated = true
        }
      })

      if(!isRepeated)
      {
        musicas.push(info)
        win.webContents.send('musics-list', musicas)
      }

      } 
      catch{
        dialog.showMessageBox(win, {title: 'Adicionar', message: 'Erro ao adicionar música'})
      }
  }


const downloadMusic = (path)=>{
  if(!(musicas.length === 0))
  {
    dialog.showMessageBox(win, {title: 'Progresso', message: 'Download iniciado...!'})
    let musicsCompleted = 0;
    musicas.forEach((musica)=>{
      const song = ytdl(musica.videoDetails.video_url,{filter: 'audioonly', quality:'highestaudio'})
      //song.pipe(fs.createWriteStream(Path.join(path,musica.videoDetails.title.replace("/", "").replace("|", "")+'.mp3')))
      ///+
      try{
      Ffmpeg({source: song}).on('codecData', data => {
        // HERE YOU GET THE TOTAL TIME
        totalTime = parseInt(data.duration.replace(/:/g, '')) 
      })
    .on('progress', progress => {
        // HERE IS THE CURRENT TIME
        const time = parseInt(progress.timemark.replace(/:/g, ''))
  
        // AND HERE IS THE CALCULATION
        const percent = (time / totalTime) * 100
            
        win.webContents.send('receivePercentage', percent, musica.videoDetails.title)
      }).setFfmpegPath(ffmpegPath).outputFormat('mp3').pipe(fs.createWriteStream(Path.join(path,musica.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, '')+'.mp3'))).on('finish',()=>{
        musicsCompleted++;
        if(musicas.length <= musicsCompleted)
        {
          win.webContents.send('downloadFinish')
          dialog.showMessageBox(win, {title: 'Progresso', message: 'As músicas foram instaladas com sucesso!'})
        }
      })
      }
      catch (error)
      {
          console.log(error)
      }
    })
  }
  else
  {
    dialog.showMessageBox(win, {title: 'Erro', message: 'Não é possível fazer download sem adicionar músicas!'})
  }
}


const reqWeb = (url)=>{
    shell.openExternal(url)
}