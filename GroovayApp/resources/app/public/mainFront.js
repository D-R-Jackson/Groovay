var globalUsername
var usersData
var loginResult = document.getElementById('LoginResult')

var ipAdd = 'http://localhost:3000'

CheckForAlreadyLoggedIn()
function CheckForAlreadyLoggedIn(){
    console.log('PreChecks cookie:', document.cookie)
    if(document.cookie!=""){
        cookie = JSON.parse(document.cookie)
        console.log('Cookies:',cookie)
        GetLogin(cookie[0], cookie[1])
        return
    }
    if(document.cookie == ""){
        console.log('There is no cookies to parse for login information')
        return
    }
}
function GetUsername(){
    
    return globalUsername
}
function GetData(){
    globalUsername = usersData.username  //If users name is changed then gloablUsername is also changed accordingly
    return usersData
}

document.addEventListener('click', (event)=>{
    const divToRemove = document.getElementsByClassName('makeOnTopDiv')[0]

    if(!divToRemove.contains(event.target) && document.getElementById('songResults') != undefined){
        //document.body.removeChild(divToRemove)
        document.getElementById('songResults').removeChild(divToRemove)
    }
})


async function GetLogin(username, password) {
    const playlistDiv = document.getElementById('playlistResults') //new
    console.log('playlist Div from main script: ', playlistDiv)
    if(username == '' && password ==''){
        console.log('Please input username and password')
        return
    }
    if(username == ''){
        console.log('Please input a Username')
        return
    }
    if(username ==''){
        console.log('please input a password')
        return
    }
    try{
        console.log('attemting to fetch login')
        const loadingBar = document.createElement('div')
        loadingBar.className = 'equalizer'
        loadingBar.innerHTML = `        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>`
 
        playlistDiv.appendChild(loadingBar)
        const response = await fetch(`${ipAdd}/api/logins/${username}/${password}`)
        if(!response.ok){
            throw new Error('cound lot get thing')
        }
        console.log(response)
        var result = await response.json()
        
        console.log('Login', result)
        if(result.username == username){
            if(loginResult!=null){
                loginResult.innerHTML = "Login Was successful";
            }
            globalUsername = result.username;
            usersData = result
            var login = []
            login.push(username).username
            login.push(password)
            document.cookie = JSON.stringify(login);

            lightModeButtonFunc(result.light)
            document.getElementById('eq250').value = result.eqSett.eq250
            document.getElementById('eq500').value = result.eqSett.eq500
            document.getElementById('eq1k').value = result.eqSett.eq1k
            document.getElementById('eq4k').value = result.eqSett.eq4k
            document.getElementById('eq10k').value = result.eqSett.eq10k
            document.getElementById('bass').value = result.eqSett.bass
            document.getElementById('treble').value = result.eqSett.treb
            UpdateImgLinks(!result.light)
            if(result.doSearchHistory){
                document.getElementById('doHistory').innerText = 'Saving History'
            }else{
                document.getElementById('doHistory').innerText = 'Not Saving History'
            }
            const wait = setTimeout(home(), 250)
            const createPlaylistContainer = document.createElement('div')
            createPlaylistContainer.id = 'createPlaylistContainer'
            await GetPlaylists()
            playlistDiv.removeChild(loadingBar)
            var playlistDivMain = document.getElementById('playlistResults')
            const createPlaylistInput = document.createElement('input')
            createPlaylistInput.type = 'text'
            createPlaylistInput.placeholder = 'Playlist Name Here'
            createPlaylistInput.id = 'playlistNameInput'
            const playlistCreationButton = document.createElement('button')
            playlistCreationButton.id = 'createPlaylist'
            playlistCreationButton.innerText = 'Create Playlist'
            createPlaylistContainer.appendChild(createPlaylistInput)
            createPlaylistContainer.appendChild(playlistCreationButton)
            
            playlistDivMain.insertBefore(createPlaylistContainer, playlistDivMain.firstChild)
     
  
            const spotifyScript = document.createElement('script')
            spotifyScript.src = 'spotify.js'
            document.body.appendChild(spotifyScript)

            playlistCreationButton.addEventListener('click', ()=>CreatePlaylist())
            

            audio.pause()
        }
        if(!result){
            loginResult.innerHTML = "Username or Password was incorrect"
            playlistDiv.remove(loadingBar)
        }
    }catch(error){
        console.error('an error hass occured', error)
    }
}
