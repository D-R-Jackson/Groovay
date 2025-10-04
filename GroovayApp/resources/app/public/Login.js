var usersData;
var ip = 'http://localhost:3000'
var usernameInput = document.getElementById('username')
var passwordInput = document.getElementById('password')
var loginResult = document.getElementById('LoginResult')
var signup = document.getElementById('signUp')
var logins;
var button = document.getElementById('login')
var globalUsername = null;
if(button!=null){button.addEventListener('click', ()=> GetLogin(usernameInput.value,passwordInput.value))}
if(signup!=null){signup.addEventListener('click', ()=> SendLogin(usernameInput.value,passwordInput.value))}
//button.addEventListener('click', ()=>GetPassword())
/*
usernameInput.addEventListener('input', ()=>{
    button.innerText = usernameInput.value
})
    */

function GetUsername(){
    console.log('GEt username', globalUsername)
    return globalUsername
}
/*
function GetData(){
    return usersData
}*/
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
            loginResult.innerHTML = "Username or Password was incorrect LoGING"
            playlistDiv.removeChild(loadingBar)
        }
    }catch(error){
        console.error('an error hass occured', error)
    }
}


async function SendLogin(username, password) {
    if(username == '' && password ==''){
        console.log('Please input username and password')
        return
    }
    if(username == ''){
        console.log('Please input a Username')
        return
    }
    if(password == ''){
        console.log('please input a password')
        return
    }
    const loginArray = [];
    loginArray.push(username)
    loginArray.push(password)
    try{
        const response = await fetch(`${ip}/api/signup/${username}/${password}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginArray)
        })
        const data = await response.json();  
        const message = data.message;        
        loginResult.innerHTML = message
        console.log(username,password)
        GetLogin(username,password)
        //console.log(await response.json().message)
        //loginArray = []
    }catch(error){
        console.error('an error occured', error)
    }
}

async function GetCurrentlyLoggedInAcc() {
    try{
        const response = await fetch(`${ip}/api/currentlyLoggedAcc`);
        const data = await response.json();
      
        console.log(data)
    }catch(error){
        console.error('There was an error with getting the currently logged in account', error)
    }
}