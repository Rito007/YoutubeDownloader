const url = document.getElementById("vidUrl")
const btn = document.getElementById("btn-add")
const btnDownload = document.getElementById("btn-download")
const btnPath = document.getElementById("btn-path")
const pathElement = document.getElementById("vidPath")
const progressBar = document.getElementById("progressBarC")
const progressBarTitle = document.getElementById("progressBarT")
const progressBarBody = document.getElementById("progressBarB")
const gitLink = document.getElementById("gitLink")

progressBarBody.style.display = "none"
window.winApi.getPath()

btn.addEventListener("click",()=>{
    const finalUrl = url.value
    url.value = ""
    window.winApi.uploadMusic(finalUrl)
})

gitLink.addEventListener('click',()=>{
    window.winApi.requestWeb("https://github.com/Rito007")
})

btnPath.addEventListener("click", ()=>{window.winApi.getPath()})

btnDownload.addEventListener("click", ()=>
{
    window.winApi.downloadMusic(pathElement.value)
})

window.winApi.onPathReceived((event, path)=>{
    pathElement.value = path
})

window.winApi.downloadInProgress((event, percentage, title)=>{
    progressBar.style.width = percentage + "%"
    progressBarTitle.innerHTML = title
    progressBarBody.style.display = ""
})
window.winApi.onDownloadFinish((event, undefined)=>{
   progressBarBody.style.display = "none"
})

window.winApi.mainMusics((event, musicas)=>{

    $('#listaMusics').empty()
    let id =0
    musicas.forEach((musica)=>{
        let htmlString = '<li class="stylledLi" id="musica'+id+'">' +
        '<div class="musicContent">'+
            '<h4 class="musicHeader" id="tituloid'+id+'">'+musica.videoDetails.title+'</h4>'+
            '<div class="musicSecondInfo">'+
                '<span>'+musica.videoDetails.author.name+'</span>'+
                '<span class="minutesSpan">'+ musica.videoDetails.lengthSeconds +' segundos</span>'+
            '</div>'+
        '</div>'+
    '</li>'
        $('#listaMusics').append(htmlString)

        document.getElementById("musica"+id).addEventListener('dblclick', (event)=>{
            let getId = event.currentTarget.id.replace("musica","tituloid")
            let valueofId = document.getElementById(getId).innerHTML
            window.winApi.deleteMusic(valueofId)
        })
        id++
    })
})




