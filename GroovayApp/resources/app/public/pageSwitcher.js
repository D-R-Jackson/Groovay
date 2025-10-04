var buttons = document.getElementsByClassName('ButtonCss')
var searchInput = document.getElementById('textInput')
var script;
var loginScript;
var eqScript
var musicScript;
var next = document.getElementById('nextSong')
var prev = document.getElementById('previousSong')
console.log()
for(i = 0;i < buttons.length; i++){
    console.log(buttons[i])
}
var changingThing = document.getElementById('ChangeableThing')
buttons[0].addEventListener('click', () => account())
buttons[1].addEventListener('click', () => home())
buttons[2].addEventListener('click', () => search())

const eqStuff = document.getElementById('eqStuff')
async function account(){
    home()
    console.log(await GetUsername())
    if(await GetUsername() === undefined || await GetUsername() === null){
        document.getElementById('Main').innerHTML = `
        <div id="loginStuff">
            <p> Login Or SignUp </p>
            <input type="text" id="username" placeholder="Username">
            <input type="password" id="password" placeholder="Password">
            <button id="login">Login</button>       
            
            <button id="signUp">SignUp</button>
            <div id="LoginResult"></div>
            <script src="Login.js"></script>
        </div>`
        loginScript = document.createElement('script');
        loginScript.src = 'Login.js'
        document.head.appendChild(loginScript)
    } else{
        
        document.getElementById('Main').innerHTML = ``
        document.getElementById('Main').appendChild(eqStuff)
        eqStuff.style.display = 'flex'
        
    }

            buttons[2].style.display = 'inline-block'
        searchInput.style.display = 'none'


    /*
    if(script!=null){
        document.head.removeChild(script)
    }
        */
}
function home() {
    /*
    if(script!=null){
        document.head.removeChild(script)
    }
    if(loginScript!=null){
        document.head.removeChild(loginScript)
    }*/
    //document.head.removeChild(script)
    //document.head.removeChild(musicScript)
    if(changingThing != null){
        prev.disabled = false;
        next.disabled = false;
        console.log('home')    
        buttons[2].style.display = 'inline-block'
        searchInput.style.display = 'none'
        console.log('')
        if(Array.prototype.slice.call(document.getElementById('Main').children).includes(eqStuff)){
            eqStuff.style.display = 'none'
            document.body.appendChild(eqStuff)
            //document.getElementById('Main').removeChild(eqStuff)

        }

        //changingThing.innerHTML = '<div id="Main"></div><div id="CurrentlyPlayingInfo"></div>'
       changingThing.innerHTML = '<div id="Main"></div>'
       
    }

}
function search(){
    home()
    /*
    if(loginScript!=null){
        document.head.removeChild(loginScript)
    }
        */

    
    next.disabled = true;
    prev.disabled = true;
       eqStuff.style.display = 'none'
       console.log('search')
    changingThing.innerHTML = `
    <div id="Main">       
    <!--<input type="text" placeholder="Search" id="songInput">-->
    <!--<button id="searchButton">Play specific song</button>-->
    <!--<button id="creationButton" >GetPlaylists</button>-->
    <div id="songResults"></div>
   
    </div>`

    
    /*  
    <button id="createPlaylist" onclick="CreatePlaylist()" >createPlaylist</button>
    <input type="text" placeholder="Playlist Name Here" id="playlistNameInput">
    
    <div id="searchBackground">       
    <!--<input type="text" placeholder="Search" id="songInput">-->
    <input type="text" placeholder="Playlist Name Here" id="playlistNameInput">
    <!--<button id="searchButton">Play specific song</button>-->
    <button id="stop">Stop</button><button id="createPlaylist" onclick="CreatePlaylist()" >createPlaylist</button>
    <!--<button id="creationButton" >GetPlaylists</button>-->
    <div id="songResults"></div>
    <div id='playlistTemp'></div>
    </div>` */
    console.log('')
    if(Array.prototype.slice.call(document.getElementById('Main').children).includes(eqStuff)){
        eqStuff.style.display = 'none'
        document.body.appendChild(eqStuff)
        //document.getElementById('Main').removeChild(eqStuff)

    }
    script = document.createElement("script");
    buttons[2].style.display = 'none'
    searchInput.style.display = 'inline-block'
    //musicScript = document.createElement('script')
    //musicScript.src='songPlayer.js'
    script.src = "spotify.js";
    //document.head.appendChild(script);
    //document.head.appendChild(musicScript);

}