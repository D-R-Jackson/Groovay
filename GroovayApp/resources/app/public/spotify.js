//document.getElementById('searchButton').onclick = findSongs

var audioElement = null;
var songsArray = [];
var playlist = [];
var playlistButton = [];
var buttonsArray = [];
var trackUrlArray = [];
var imgUrl = null;
var songIndexPlaylist = 0;

var ip = 'http://localhost:3000'
var audio;
var createPlaylistButton = document.getElementById('createPlaylist')
var playlistDiv = document.getElementById('playlistTemp')
var resultsDiv;
var track_;
var songInput = document.getElementById('textInput')
stopButton = document.getElementById('stop')
async function GetCurrentlyLoggedInAcc() {
    try{
        const response = await fetch(`${ip}/api/currentlyLoggedAcc`);
        const data = await response.json();
      
        console.log(data)
    }catch(error){
        console.error('There was an error with getting the currently logged in account', error)
    }
}
GetCurrentlyLoggedInAcc()
if(stopButton != null){
    stopButton.addEventListener('click', function(){
        audio.pause()
    });

}
var timeout
songInput.addEventListener('input',async function(){
    console.log(songInput.value)
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        findSongs();
    }, 500);
})

songInput.addEventListener('keydown', async(event)=>{
    if(event.key === 'Enter' && event.target.value != ''){
        findSongs()
    }
})


buttonsArray.forEach(button => {
    button.addEventListener('click', playSong(button))
});

playlistButton.forEach(b =>{
    b.addEventListener('click', addToTempPlaylist(b))
    //b.onclick = addToPlaylist(b)
})
async function getImageUrl(trackId, img) {
    let id = trackId
    try{
        const response = await fetch(`${ip}/coverArt/${id}`)
        const data = await response.json();

        if(data != null){
            //console.log("img url:", data.coverArtUrl)
            img.src=data.coverArtUrl
            img.width=100
            img.height=100
        }else{
            console.log('there was an error')
        }
    }catch(error){
        console.error(error)
    }
}
async function addToTempPlaylist(b, v){
    //var trackID = b.innerHTML.split('<!--')[1].split('-->')[0];
    var trackID = b
    var track
    playlistDiv.innerHTML = ''
    
    console.log('trackID: ', trackID)
    try{
        const response = await fetch(`${ip}/track/${trackID}`)
        const data = await response.json()
        track = data
        console.log('data:', data)
        console.log('song name: ', data.name)
    }catch(error){
        console.error("There was an error ",error)
    }
    songIndexPlaylist++;
    playlist.push(v)
    console.log(playlist)
    playlist.forEach(song =>{
        var songImg = document.createElement('img') 
        songImg.style.width = '50px'
        songImg.style.height = '50px'
        songImg.style.padding = '5px'
        songImg.style.display = 'flexbox'
        songImg.src = song.img
        playlistDiv.appendChild(songImg)
    })
}

async function addToPlaylist(button, song) {
    var playlistName
    button.innerHTML = 'Add To Playlist'
// this displays the buttons for the plahylists 

    /*
    async function yes(){
        return new Promise((resolve) =>{

            getPlaylistButtonsForOtherScript().forEach(playlist =>{
                newButton = document.createElement('button')
                newButton.innerText = playlist.innerText
                button.appendChild(newButton)
                newButton.addEventListener('click',()=>{
                    button.innerHTML = 'Add To Existing Playlist'
                    playlistName = playlist.innerText + '.json'
                    console.log(playlistName)
                    console.log(song)
                    console.log(button.children)
                    

                    resolve()
                })
            });
        })


    }*/

    async function yes() {
        return new Promise((resolve) =>{
            if(document.getElementsByClassName('makeOnTopDiv').length > 0){
                //document.body.removeChild(document.getElementsByClassName('makeOnTopDiv')[0])
                document.getElementById('songResults').removeChild(document.getElementsByClassName('makeOnTopDiv')[0])
            }
            const makeOnTopDiv = document.createElement('div')
            makeOnTopDiv.className = 'makeOnTopDiv'
            
            const buttonRect = button.getBoundingClientRect()
            console.log(`buttonRectTop: ${buttonRect.top}`)
            const scrollOffset = document.getElementById('songResults').scrollTop

            let yOffset = 100

            if(buttonRect.top < 500) yOffset = 100;
            if(buttonRect.top >500) yOffset = 350

            makeOnTopDiv.style.top = `${buttonRect.top +scrollOffset - yOffset}px`
            makeOnTopDiv.style.left = `${buttonRect.left -225}px`
            
            const buttonsDiv = document.createElement('div')


            buttonsDiv.className = 'addToPlaylistDiv'
            makeOnTopDiv.appendChild(buttonsDiv)
            //document.body.appendChild(makeOnTopDiv)
            document.getElementById('songResults').appendChild(makeOnTopDiv)
            getPlaylistButtonsForOtherScript().forEach(playlist =>{
                const newButton = document.createElement('button')
                newButton.innerText = playlist.innerText
                newButton.style.width = '80%'
                newButton.style.alignSelf = 'centre'
                newButton.id = 'selectPlaylistForAddingButton'
                buttonsDiv.appendChild(newButton)
                newButton.addEventListener('click', ()=>{
                    buttonsDiv.innerHTML = ''
                    playlistName = playlist.innerText + '.json'

                    resolve()
                })
            })
        })
    }



    await yes();
    try{///api/addToPlaylist/:username/:playlistName This is adding to the playlsit server side 
        const response = await fetch(`${ip}/api/addToPlaylist/${GetUsername()}/${playlistName}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(song) 
        })
        console.log(await response.json())
            GetPlaylists()
        button.innerHTML = 'Add To Playlist'

        //findSongs()

    }catch(error){
        console.log(error)
    }
}
async function showPlaylist() {
    resultsDiv.innerHTML = ''
    var i = 0
    resultsDiv = document.getElementById('songResults');
    playlist.forEach(song => {
        
        const albumImage = document.createElement('img')
        const songButton = document.createElement('button')
        const buttonsText = document.createElement('span')

        
        albumImage.width=100;
        albumImage.height=100;
        albumImage.src = playlist[i][3]
        albumImage.setAttribute('class', 'albumImg')
        songButton.setAttribute(`onclick`, `playSong(this)`)
        buttonsText.innerHTML = `<p><strong>${playlist[i][1]}</strong> by${playlist[i][2]}</p>  <!--${song}-->`
        
        //add stuff to the button after it sets the innerhtml
        songButton.appendChild(albumImage)
        songButton.appendChild(buttonsText)

        resultsDiv.appendChild(songButton)
        songButton.style.display = 'flex';
        songButton.style.alignItems = 'center'
        albumImage.style.marginRight = '10px'

        i++;
    });
}

async function CreatePlaylist() {
    songIndexPlaylist = 0;
    //playlistDiv.innerHTML = ''
    var playlistName = document.getElementById("playlistNameInput").value;
    console.log(playlist)
    try {
        const response = await fetch(`${ip}/api/savePlaylist/${playlistName}/${GetUsername()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(playlist)
        });

     
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json(); 
        console.log(result.message);
    } catch (error) {
        console.error('Error occurred:', error);
    }
    playlist = []
    GetPlaylists()

}
async function GetUrlFromDeezer(trackName, artistName) {
    var string = trackName + " " + artistName
    console.log('Input for deezer: ', string)
    try{
        const response = await fetch(`${ip}/track/${string}`)
        var data = await response.json()
        console.log('Song preview link: ', data.preview)
        return data.preview;
    }catch(error){
        console.error('an error has occured getting song from deezer: ',error)
    }
}
async function findSongs() {
    playlistButton = []
    //buttonsArray = []
    //trackUrlArray = []
    //songsArray = []
    console.log('Pressed find songs button')
    var songName = songInput.value
    if(songName!= '' && GetData().doSearchHistory)GetData().searchHistory.push(songName)
    if(songName == ''){
        console.log('SongName is undefined')
        resultsDiv.innerHTML = ''
        return
    }
    try {
        const response = await fetch(`${ip}/search?q=${songName}`);
        const data = await response.json();
        
        resultsDiv = document.getElementById('songResults');
        // Check if tracks and items exist
        if (data.tracks && data.tracks.items.length > 0) {
            //console.log('Tracks found:', data.tracks.items);  // Log the array of tracks
                buttonsArray = []
                trackUrlArray = []
                globalButtonArray = []
            console.log('fini')
            resultsDiv.innerHTML = '';  // Clear previous results
            await sleep(100)
            data.tracks.items.slice(0, 30).forEach(async (track) => {
                let i = 0
                track_ = track;
                track.preview_url = await GetUrlFromDeezer(track.name, track.artists.map(artist=>artist.name))
                // Make sure preview_url exists and the track is not already added
                if (track.preview_url && !trackUrlArray.includes(track.id)) {
                    //songsArray.push(track.preview_url); // Add preview_url to songsArray
                    //songsArray.splice(i,0,track.preview_url)
                    //console.log('found song,', track.id)
                    const itemDiv = document.createElement('div')
                    const image = document.createElement('img');
                    image.src = track.album.images[0].url
                    const trackButton = document.createElement('button');
                    const addToOtherPlaylist = document.createElement('button')
                    addToOtherPlaylist.innerText = 'Add To Playlist'
                    //trackButton.style.background = 'teal';
                    trackButton.innerHTML = `<!--${track.preview_url}-->`
                    const text = document.createElement('p');
                    //const addButton = document.createElement('button')
                    //playlistButton.push(addButton)
                    //console.log('Playlist Buttons ', playlistButton)
                    text.innerHTML = `<strong>${track.name}</strong> by ${track.artists.map(artist => artist.name).join(', ')} `;
                    //addButton.innerHTML = `<script src="spotify.js"></script>ADD ME TO UR PLAYLIST! <!--${track.id}-->`
                   // await getImageUrl(track.id, image); 
                    //trackUrlArray.push(track.id); // Add track ID to trackUrlArray


                    addToOtherPlaylist.id = 'addToPlaylist'
                    image.id = 'searchImg'
                    image.width = 75
                    image.height = 75

                    trackUrlArray.push(track.id)

                    trackButton.appendChild(image)
                    trackButton.appendChild(text)
                    trackButton.appendChild(addToOtherPlaylist)
                    /*
                    itemDiv.appendChild(trackButton)
                    itemDiv.appendChild(addToOtherPlaylist)*/
                    
                    // Append elements to trackButton
                    /*
                    itemDiv.appendChild(image);
                    itemDiv.appendChild(text);
                    //itemDiv.appendChild(addButton)
                    itemDiv.appendChild(trackButton)
                    itemDiv.appendChild(addToOtherPlaylist)
                    */
                    GetGlobalButtonArray(trackButton)
                    buttonsArray.push(trackButton); // Add trackButton to buttonsArray
                    //buttonsArray.splice(i,0,trackButton)
                    //console.log('Button Array:', buttonsArray);
                    //console.log('Track Array:', songsArray);

                    //
                    //console.log('This is the index thats fucking me ', index)

                    var v = {}
                    v.link = track.preview_url
                    v.name = track.name
                    v.artists = track.artists.map(artist=>artist.name)
                    v.img = track.album.images[0].url
                    //v.songIndex = songIndexPlaylist
                    console.log(`Saving Playlist V: ${JSON.stringify(v)}`)
                    //var v = [track.preview_url, track.name, track.artists.map(artist => artist.name).join(', '), track.album.images[0].url, songIndexPlaylist]
                    //***FIGURE OUT HOW THIS SHIT ALL WORKS AGAIN
                    //***CREATE MAKE SURE I CAN ADD AI PLAYLIST TO A NEW PLAYLIST
                    //***CHANGE v SO THAT ITS AN OBJECT AND NOT A LIST
                    //***MAKE IT SO OTHER FUNCTIONS WORK WITH NEW PLAYLIST STRUCTURE
                    addToOtherPlaylist.addEventListener('click',(event)=>{
                        event.stopPropagation()
                        
                        addToPlaylist(addToOtherPlaylist,v)
                    })
                    //addButton.setAttribute('onclick', `addToTempPlaylist(this, ${v})`)
                    //addButton.addEventListener('click', ()=>addToTempPlaylist(track.id,v))
                    //trackButton.setAttribute('onclick', `playSong(${track.preview_url})`)
                    trackButton.addEventListener('click', () => PlaySong(track.preview_url, trackButton, v));
                    trackButton.id = 'playButton';
                    itemDiv.style.display = 'block';  // Ensure the buttons are displayed on new lines
                    itemDiv.style.margin = '10px';
                    
                    // Append each track button to the results div
                    resultsDiv.appendChild(trackButton);
                    
                    await sleep(50); // Sleep for a bit to avoid API throttling
                    i++;
                }
            });
        } else {
            document.getElementById('songResults').innerText = 'No songs found';
            console.log('songsnotfound')
        }
    } catch (error) {
        //
        console.error('Error fetching song data:', error);
        document.getElementById('songResults').innerText = 'Error fetching song data.';
    }
    
}


//buttonsArray.forEach(button, playSong(button))
function playSearchedSong(url){
        if(audio != null){
            stop(audio)
        }
        //var url = butt.innerHTML.split('<!--')[1].split('-->')[0]
        //console.log('children:', butt.children.lastchild)// get the child with the url in it then shit will be aight

        //console.log('InnerHTML' , butt.innerHTML)
        //console.log(buttonsArray.indexOf(butt))
        
        console.log('URL:', url)
        
        //let index = buttonsArray.indexOf(butt);
        
        audio = new Audio(url)
        audio.play();
}

function stop(aud){
    aud.pause();
    aud.currentTime = 0;
    if(audio.paused){
        console.log('The audio was paused')
    }else{
        console.log('audio was not paused')
    }
}
    
//});



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }