

var ip = 'http://localhost:3000'
var volumeslider
var progresslider
var switchPlaylistBool = true;
var activeButton
var globalButtonArray = []
var globalSongObjArray = []
var previousSongsArray = []

var isShuffle = false;
var currentSongUrl;
var shuffleButton = document.getElementById('shuffle')
var previousButton = document.getElementById('previousSong')
previousButton.addEventListener('click', ()=> previousSong())
var nextButton = document.getElementById('nextSong')
nextButton.addEventListener('click', ()=>nextSong())
shuffleButton.addEventListener('click', ()=> toggleShuffle())
var pauseButton = document.getElementById('pause')
pauseButton.addEventListener('click', ()=>Pause())
var currentlyPlayingIndex;
var choosePlaylistButton;
var songButtonsArray = [];
var songObjArray = []
var playlistButtonArray = []

var deletePlaylistName;

progress()
volume()

//var creationButton = document.getElementById('creationButton').onclick = GetPlaylists
GetPlaylists()
function GetGlobalButtonArray(button){
    globalButtonArray.push(button)
    console.log('GlobalButtonArray:' ,globalButtonArray)
}
async function DeletePlaylist(i, playlistIndex, songButton){
    try{
        const response = await fetch(`${ip}/api/deleteFromPlaylist/${i}/${deletePlaylistName}/${GetUsername()}`)
        const data = await response.json()
        console.log('Attempting to delete song, Returned Playlist: ', data)
        ReloadPlaylist(i,playlistIndex,songButton)
        
    }catch(error){
        console.error('An Error has occured with deleting from playlist', error)
    }

    //document.getElementById(deletePlaylistName).click()
}
async function ReloadPlaylist(i,playlistIndex, songButton){
    
    await GetPlaylists()    
    playlistButtonArray[playlistIndex].click() 
    audio.pause()
}
function getPlaylistButtonsForOtherScript(){
    return playlistButtonArray;
}
function SwitchPlaylist(butt){
    globalButtonArray = songButtonsArray
    console.log(`ChoosePlaylist ButtonId: ${butt.id}`)
    if(butt.id == 'choosePlaylist'){
        //currentlyPlayingIndex = -1;
        PlaySong(globalButtonArray[0].innerHTML.split('<!--')[1].split('-->')[0],globalButtonArray[0])
    }
    if(butt.id == 'playSong'){
        currentlyPlayingIndex = globalButtonArray.indexOf(butt)
    }
}
async function GetPlaylists(){
    var playlistDiv = document.getElementById('playlists')
    //    <button id="createPlaylist" onclick="CreatePlaylist()" >createPlaylist</button>
    //<input type="text" placeholder="Playlist Name Here" id="playlistNameInput">
    //<button id="createPlaylist" onclick="CreatePlaylist()" >createPlaylist</button>



    /*
    if(document.getElementById('songResults') != null){
        document.getElementById('songResults').innerHTML = ''
    }
    if(playlistDiv != null && playlistDiv.innerHTML != ''){
        playlistDiv.innerHTML = ''
    }*/
    playlistDiv.innerHTML = ''

    console.log('hello')
    try{
        console.log('Username in songPlayer.js', GetUsername())
        console.log('beggining try sequence')
        const filesResponse = await fetch(`${ip}/api/getPlaylists/${GetUsername()}`);
        //console.log('response:', filesResponse)
        if(!filesResponse.ok){
            throw new Error('Network response was not ok')
        }
        
        fileNames = await filesResponse.json()
        //console.log(fileNames)
        const jsonArrays = await Promise.all(
            fileNames.map(async (fileName)=>{
                JSON.stringify(fileName)
                //console.log(fileName)
                const response = await fetch(`${ip}/api/getPlaylist/${fileName}/${GetUsername()}`)
                if(!response.ok){
                    throw new Error(`failed to fetch playlist for ${fileName}`)
                }
                const data = await response.json()
                //console.log(data)
                return data


            })
        )   
        console.log(jsonArrays)
        if(jsonArrays.length == 0){
            playlistDiv.innerText = 'No Playlists Found'
        }
        playlistButtonArray = []
        jsonArrays.forEach(playlist => {
            //console.log(playlist)
            
            var nameOfPlaylist = fileNames[jsonArrays.indexOf(playlist)]
            nameOfPlaylist = nameOfPlaylist.split('.json')[0]
            //console.log(fileNames[jsonArrays.indexOf(playlist)])
            
            var b = document.createElement('button')//button of the to load the playlist
            playlistButtonArray.push(b)
            b.innerHTML = nameOfPlaylist
            b.id = nameOfPlaylist
            b.className = 'playlistButtons'
            var tempSongsArray = []
            b.addEventListener('click', function(){
                home()
                deletePlaylistName = nameOfPlaylist
                console.log('The playlist you are removing from:' ,deletePlaylistName)
                songButtonsArray = []
                let playlistButtonColor = b.style.color
                choosePlaylistButton = document.createElement('button')
                choosePlaylistButton.style.borderRadius = '100%'
                choosePlaylistButton.innerText = '|>'
                choosePlaylistButton.style.height = '50px'
                choosePlaylistButton.style.width = '50px'
                choosePlaylistButton.id = 'choosePlaylist'
                choosePlaylistButton.addEventListener('click', ()=>SwitchPlaylist(choosePlaylistButton))
                playlistButtonArray.forEach(button =>{
                    button.style.color = playlistButtonColor
                })
                b.style.color = 'red'
                
                console.log('you Clicked me!')
                //globalButtonArray = []
                var songsDiv = document.getElementById('songResults')
                var mainDiv = document.getElementById('Main')
                /*
                if(songsDiv != null){
                    songsDiv.innerHTML = ''
                    songsDiv.appendChild(choosePlaylistButton)
                }else{
                    mainDiv.innerHTML = ''
                    mainDiv.appendChild(choosePlaylistButton)
                }*/
                if(playlist.length == 0){
                    if(songsDiv == null){
                        mainDiv.innerHTML = 'No Songs In playlist'
                    }else{
                    document.getElementById("songResults").innerHTML = 'No songs in playlist'
            
                    }
                }
            
                playlist.forEach(song => {
                    var songButton = document.createElement('button')
                    tempSongsArray.push(songButton)
                    var optionsButton = document.createElement('button')
                    optionsButton.innerText = 'Delete'
                    optionsButton.id = 'OptionsButton'
                    /*
                    optionsButton.style.padding = '10px'
                    optionsButton.style.backgroundColor = '#f5e7d3'
                    optionsButton.style.marginLeft = 'auto'
                    optionsButton.style.borderRadius = '5px'*/
                    //optionsButton.style.right = '5%'
                    //optionsButton.style.position = 'absolute'

                    
                    
                    //optionsButton.style.hover.backgroundColor = '#ffffff'
                    
                    optionsButton.style.border = '0px'
                    optionsButton.addEventListener('click', (event)=>{
                        event.stopPropagation()
                        DeletePlaylist(song.index, playlistButtonArray.indexOf(b), songButton)
                    })
                    
                    optionsButton.addEventListener('mouseover', () => {
                        songButton.style.pointerEvents = 'none';
                        //optionsButton.style.pointerEvents = 'auto'
                    });
            
                    optionsButton.addEventListener('mouseout', () => {
                        songButton.style.pointerEvents = 'auto';
                    });
                    optionsButton.style.zIndex='10'
                    var text = document.createElement('span')
                    text.style.padding = '5px'
                    //globalButtonArray.push(songButton)
                    songButtonsArray.push(songButton)
                    console.log(`SongsButtonArray length: ${songButtonsArray.length}`)
                    //console.log(`PlaylistButtons: ${playlistButtons.length}`)
                    //songButton.addEventListener('click', ()=>setPlayingPlaylist(playlistButtons))
                    if(song.img!=null){
                        var albumImage = document.createElement('img')
                        albumImage.src = song.img
                        albumImage.style.borderRadius = '5px'
                        albumImage.width = 75
                        albumImage.height = 75
                        albumImage.style.marginRight = '10px'
                        albumImage.setAttribute('class', 'albumImg')
                        songButton.appendChild(albumImage)
            
                    }
                    if(songsDiv == null){
                        mainDiv.appendChild(songButton)
                    }else{
                        songsDiv.appendChild(songButton)
            
                    }
                    console.log('addedButton')
                    if(song.name != null && song.artists != null){
                        //text.innerHTML = `<strong>${song[1]}</strong> by ${song[2]} <!--${song[0]}-->`
                        text.innerHTML = `<strong>${song.name}</strong> by ${song.artists.join(', ')}      <!--${song.link}-->`
                    }else{
                        //text.innerHTML = `${song[0].split(`Sounds/`)[1].split('.mp3')[0]} <!--${song[0]}-->`
                        text.innerHTML = `${song.link.split(`Sounds/`)[1].split('.mp3')[0]}      <!--${song.link}-->`
                    }
                    
                    songButton.appendChild(text)
                    songButton.appendChild(optionsButton)
                    songButton.style.display = 'flex'
                    songButton.style.alignItems = 'center'
                    songButton.id = 'playSong'
                    songButton.style.borderRadius = '5px'
                    songButton.style.width = '70%'
                    songButton.userData = song
                    
                    
                    songButton.addEventListener('click', async =>{
                        console.log('playlist activated:', nameOfPlaylist)
                        //PlaySong(song[0], songButton)
                        PlaySong(song.link, songButton, song)
                        
                        SwitchPlaylist(songButton)
                    })
            
                    
                });
            })
            document.getElementById('playlists').appendChild(b)
        });
        //console.log(jsonArrays)
    }catch(error){
        console.error('An Error Occured', error)
    }
}



/*
async function setPlayingPlaylist(playlist) {
    console.log(playlist)

    if(switchPlaylist){

        console.log('trying to switch playlist ')
        playlist.forEach(song =>{
            console.log(song)
            globalButtonArray.push(song)
        })
        switchPlaylist = false
        console.log('switchPlaylist:', switchPlaylist)

        return
    }
    if(!switchPlaylist){
        console.log('this playlist is already selected')
        return
    }
    
}
    */
var audio;
function stop(aud){
    aud.pause();
    aud.currentTime = 0;
}

function getPreviousSongs(){
    if(previousSongsArray.length <= 10){
        previousSongsArray.push(globalButtonArray[currentlyPlayingIndex])
        console.log(previousSongsArray)
    }
    if(previousSongsArray.length > 10){
        previousSongsArray.shift()
        console.log(globalButtonArray[currentlyPlayingIndex])
        /*
        for(i =0; i < previousSongsArray.length; i++){
            
            previousSongsArray[i] = previousSongsArray[1+i] 
        }
            */
    }
}
function previousSong(){
    if(previousSongsArray[previousSongsArray.length -1]!= undefined){
        previousSongsArray[previousSongsArray.length - 1].click()
        previousSongsArray.pop()
        console.log(previousSongsArray)
    }else{
        shuffle()
    }

}

let playImg = ''
let pauseImg = ''
let shufImg = ''

function UpdateImgLinks(light){
    if(light == false){
        console.log(light)
        playImg = './Resources/LightMode/Play.png'
        pauseImg = './Resources/LightMode/Pause.png'
        shufImg = './Resources/LightMode/Shuffle.png'

        return        
    }
    if(light == true){
        console.log(light)
        playImg = './Resources/DarkMode/Play.png'
        pauseImg = './Resources/DarkMode/Pause.png'
        shufImg = './Resources/DarkMode/Shuffle.png'

        return        
    }
}
/*
if(!audio.paused) pauseButton.children[0].src = playImg;
if(audio.paused) pauseButton.children[0].src = pauseImg;*/

function Pause(){
    this.blur()
    if(!audio.paused){
      audio.pause();   
      console.log("pause") 
      //pauseButton.innerText = "Play"
      pauseButton.children[0].src = playImg
      return;
    }
    if(audio.paused){
      console.log("play")
      audio.play()
      //pauseButton.innerText = "Pause"
      pauseButton.children[0].src = pauseImg
      return;
    }
       
  }
  
function nextSong(){
    if(isShuffle){
        console.log('globalbutton array', globalButtonArray)

        shuffle()
        getPreviousSongs()
        
        
    }
    if(!isShuffle){
        console.log('globalbutton array', globalButtonArray)
        
        getPreviousSongs()
        if(currentlyPlayingIndex + 1 >= globalButtonArray.length){
            PlaySong(globalButtonArray[0].innerHTML.split('<!--')[1].split('-->')[0],globalButtonArray[0],globalButtonArray[0].userData)

        }else{
            //globalButtonArray[currentlyPlayingIndex+1].click()
            //console.log(globalButtonArray[currentlyPlayingIndex+1].innerHTML.split('<!--')[1].split('-->')[0])
            PlaySong(globalButtonArray[currentlyPlayingIndex+1].innerHTML.split('<!--')[1].split('-->')[0],globalButtonArray[currentlyPlayingIndex+1],globalButtonArray[currentlyPlayingIndex+1].userData)

        }
        
    }
}

function DisplayWhatSongIsPlaying(song){
    const songDiv = document.getElementById('CurrentSong')
    
    songDiv.innerHTML = ''
    
    const img = document.createElement('img')
    //img style
    img.style.width = '50px'
    img.style.height = 'auto'



    img.style.padding = '10px'
    img.src = song.img

    const text = document.createElement('p')
    //text style


    text.innerText = `${song.name} by ${song.artists}`
    
    songDiv.appendChild(img)
    songDiv.appendChild(text)
}

function PlaySong(url, butt, song){
    if(audio != null){
        stop(audio)
    }
    
    
    DisplayWhatSongIsPlaying(song)
    currentSongUrl = url
    activeButton = butt
    console.log('active button', activeButton)
    currentlyPlayingIndex = globalButtonArray.indexOf(butt)
    console.log(currentlyPlayingIndex)

    audio = new Audio(url)
    EQ(audio).resume()
    updateProgress()
    doShuffle()
    
    
    audio.volume = volumeslider.value/100
    audio.play();
}
//testing song navingation


async function progress() {
    progresslider = document.getElementById("ProgressBar");
    console.log('Progress Slider ', progresslider)
    progresslider.addEventListener("input", function () {
    if (audio.duration) {
        // Calculate the new time and set it to the audio's currentTime
        var seekTime = (progresslider.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    }
    });
}
async function volume() {
    console.log('attempting to get volume')
    volumeslider = document.getElementById("volume")
    console.log('volume slider,', volumeslider)
    volumeslider.addEventListener("mouseup", function(){
        audio.volume = volumeslider.value/100
        console.log(audio.volume)
        newVolume = audio.volume
      })
}
async function updateProgress(){
    if(audio != null){
        audio.addEventListener("timeupdate", function () {
        
            if (audio.duration) {
                var progress = (audio.currentTime / audio.duration) * 100;
                progresslider.value = progress;  // Update slider value with progress percentage
            }
            
    
        });
    }

}
function toggleShuffle(){
    
    if(isShuffle){
        isShuffle = false
        shuffleButton.children[0].src = shufImg
        shuffleButton.children[0].style.filter = ""
        console.log(isShuffle)
        return
    }
    if(!isShuffle){
        isShuffle = true
        shuffleButton.children[0].src = './Resources/ShuffleGreen.png'
        shuffleButton.children[0].style.filter = "drop-shadow(0 0 1rem #7baf91)"
        console.log(isShuffle)
        return
    }
    
}
function doShuffle(){
    if(isShuffle){
        audio.onended = function(){
            shuffle()
            getPreviousSongs()
        }
        
    }
    if(!isShuffle){
        audio.onended = function(){
            getPreviousSongs()
            if(currentlyPlayingIndex + 1 >= globalButtonArray.length){
                PlaySong(globalButtonArray[0].innerHTML.split('<!--')[1].split('-->')[0],globalButtonArray[0],globalButtonArray[0].userData)

            }else{
                PlaySong(globalButtonArray[currentlyPlayingIndex+1].innerHTML.split('<!--')[1].split('-->')[0],globalButtonArray[currentlyPlayingIndex+1],globalButtonArray[currentlyPlayingIndex+1].userData)


            }
        }
    }
}

function shuffle(){

        var min = 0
        var max = globalButtonArray.length
        var randomSongIndex = Math.floor(Math.random() * (max - min) + min);
        if(globalButtonArray[randomSongIndex] == activeButton){
          shuffle();
          console.log('was the same song')
        }else{
            PlaySong(globalButtonArray[randomSongIndex].innerHTML.split('<!--')[1].split('-->')[0],globalButtonArray[randomSongIndex], globalButtonArray[randomSongIndex].userData)

    
        }
        //console.log(randomSongIndex)
    
 
    
  }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }