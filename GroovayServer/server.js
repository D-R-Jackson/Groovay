//Imports The Required Libraries
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); 
const axios = require('axios');
const error = require('console');
const { AI } = require('./AI.js')
const app = express();

app.use(express.json())
const soundsDir = path.join(__dirname, 'public/Sounds');
const playlistDir = path.join(__dirname, 'public/Playlists')
const loginDir = path.join(__dirname, 'Logins/logins.json')
var loggedInAcc = ''
//Allows the API keys to be pulled from apiKeys.env
require('dotenv').config({path:"./apiKeys.env"})
//Sets the CORS options
const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
//Sets The app to push the Public folder to The frontend
app.use(express.static(path.join(__dirname, 'public')));
var mp3Files = []
//Endpoint to get the song link from the Deezer API
app.get('/track/:song', async(req,res)=>{
    const searchQuery = encodeURIComponent(req.params.song);
    const responseURL = `https://api.deezer.com/search?q=${searchQuery}`
    console.log(responseURL)
    try{

        const response = await axios.get(responseURL);
        console.log(`Search Query ${searchQuery}:: ${response.data.data[0]}`)
        res.json(response.data.data[0]);
        

    }catch(error){
        console.error('Error:', error.response?.data || error.message);
        res.status(500).json({error:'fauked to fetch artist'})
    }
})

//Endpoint --- REDUNDANT ==> Keeping for future refrence 
app.get('/api/songs', (req, res) => {
    console.log('Received request for /api/songs'); 
    fs.readdir(soundsDir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        const audioFiles = files.filter(file => file.endsWith('.mp3'));
        console.log('Audio files found:', audioFiles);
        audioFiles.forEach(file =>{
            var name = `/Sounds/${file}`
            var tempArr = []
            tempArr.push(name)
            mp3Files.push(tempArr)
        }) 
        res.json(audioFiles);
    });
});
  
   //Endpoint To Login
   app.get('/api/logins/:userName/:password', (req,res) =>{
    const username = req.params.userName;
    const password = req.params.password;
    fs.readFile(loginDir, async(err,data) =>{
        if(err){
            console.error('error reading logins', err)
        }
        const serverLogins = JSON.parse(data)
        for(i=0; i<serverLogins.length; i++){
            //Checks if username Is the same as login
            if(username == serverLogins[i][0]){
                //Checks if password matches aswell
                if(password == serverLogins[i][1]){
                        const data = await fs.readFileSync(path.join(__dirname,'UserInfo',`${username}Data.json`), 'utf8')

                        await RefreshLinks(username)
                        console.log('You are logged in as', username)
                        return res.json(JSON.parse(data))           

                    

                }                
            }
            
            if(i == serverLogins.length-1){
                res.json(false)
                return
            }  
        }
    })
   })
   var logins = []
   var userDat = {}
   //Changing username Endpoint
   app.get('/api/changeUsername/:newUsername/:oldUsername/:password', (req,res)=>{
        const oldUsername = req.params.oldUsername
        const newUsername = req.params.newUsername
        const password = req.params.password

        var usernamePassword = [newUsername, password]
        fs.readFile(loginDir, 'utf8', async(err,data) =>{
            if(err){
                console.error('error Reading login file for changing username: ', err)
                return res.status(500).json({error: 'failed to read directory'})
            }
            var loginData = JSON.parse(data)
            //Checks if Username already exists
            for(let login of loginData){
                if(login[0] === newUsername){
                    console.log('Username already exists (change username)')
                    return res.json({message: 'this username already exists choose another'})
                }
                //Changes the login to the new username
                if(login[0] === oldUsername){
                    loginData.pop(login)
                    loginData.push(usernamePassword)

                    await changeLogin(req,res,oldUsername,newUsername, loginData)
                }
            }
        })
   })

   //Function For Changing Username
   async function changeLogin(req,res, oldUsername, newUsername,loginData){
        const userDataRaw =  fs.readFileSync(path.join(__dirname, 'UserInfo', `${oldUsername}Data.json`), 'utf-8');
        const userData = await JSON.parse(userDataRaw)
        userData.username = newUsername
        //Changes the userData file to include new username
        fs.writeFile(path.join(__dirname,'UserInfo',`${oldUsername}Data.json`), JSON.stringify(userData,null,2), (err)=>{
            if(err){
                console.error('error writing user Data to file', err)
                return res.json(false)
            }
            console.log('wrote user data')
               
        })
        //Changes the login Array to include the new email
        fs.writeFile(loginDir, JSON.stringify(loginData, null, 2), (err)=>{
            if(err){
                console.error('there was an error writing logins: ', err)
                return res.json(false)
                
            }
        })
        //Renames user data file to be for the new username
        fs.rename(path.join(__dirname, 'UserInfo', `${oldUsername}Data.json`), path.join(__dirname, 'UserInfo', `${newUsername}Data.json`), (err)=>{
            if(err){
                console.error('there was an error with renaming file', error)
                return res.json(false)
            }
        })
        //Renames the Playlist folder to correspond to the new playlist
        fs.rename(path.join(__dirname,'public','Playlists',`${oldUsername}Playlists`),path.join(__dirname,'public','Playlists',`${newUsername}Playlists`),(err)=>{
            if(err){
                console.error('There was an error renaming directory')
                return res.json(false)}
        })
        
        res.json(true)
   }
    var logins = []
    var userDat = {}
    //Endpoint for Users to sign up
   app.post('/api/signup/:username/:password', (req,res) =>{
    const username = req.params.username
    const password = req.params.password
    var usernamePassword = []
    fs.readFile(loginDir,'utf8', (err,data) =>{
        if(err){
            console.error('error reading loginfile', err)
            return res.status(500).json({error: 'failed to read directory'})        
        }

        var loginData = JSON.parse(data)
        //Checks each login To ensure that the username doesnt already exist
        for(let login of loginData){
            if(login[0] == username){
                console.log('username already exists')
                logins = []
                return res.json({message:'This username already exists Choose another'})
            }
            else{               
                logins.push(login)
            }
            
        }

                //Sets all the user data before adding it to the User data file.
                userDat.username = username
                userDat.password = password
                userDat.eqSett = {}
                userDat.eqSett.eq250 = 0
                userDat.eqSett.eq500 = 0
                userDat.eqSett.eq1k = 0
                userDat.eqSett.eq4k = 0
                userDat.eqSett.eq10k = 0
                userDat.eqSett.bass = 0
                userDat.eqSett.treb = 0
                userDat.light = true
                userDat.doSearchHistory = true
                userDat.searchHistory = []
                console.log(userDat)
        usernamePassword.push(username)
        usernamePassword.push(password)
        logins.push(usernamePassword)
        console.log(logins)
        writeToLogin(req,res,username)
    })
    

        
   })
   //Function to Rewrite the Login File
   function writeToLogin(req,res, userName){
    //Writes The User Data File
    fs.writeFile(path.join(__dirname,'UserInfo',`${userName}Data.json`), JSON.stringify(userDat,null,2), (err)=>{
        if(err){
            console.error('error writing user Data to file', err)
            return res.status(500).json({error:'failed to create json file'})
        }
        console.log('wrote user data')
        userDat = {}

    })
    //Writes The Login to the login file
    fs.writeFile(loginDir, JSON.stringify(logins), (err) =>{
        var playlistPath = path.join(playlistDir,`/${userName}Playlists`)
        if(err){
            console.error('error writing json file:', err)
            return res.status(500).json({error: 'failed to create json file'});
        }

        console.log('Logins was added too successfuly');
        //Creates A new Directory For the users Playlists
        fs.mkdirSync(playlistPath)
        
        res.json({ message: `New Login!` });
        logins = []
        
    })
   }
//Sending Which account is logged in ---Depreciated
app.get('/api/currentlyLoggedAcc', (req, res)=>{
    console.log('currently logged in account', loggedInAcc)
    res.json(loggedInAcc)
})

//Spotify API keys
var client_id = process.env.SPOT_CLIENT_KEY;
var secret_id = process.env.SPOT_SECRET_KEY;
console.log(client_id, secret_id)
let token = null;
//Function To Get the spotify Token when The server Starts
async function getSpotifyToken() {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({
                'grant_type': 'client_credentials'
            }), {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(client_id + ':' + secret_id).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        token = response.data.access_token;
        console.log('Token fetched successfully:', token);
    } catch (error) {
        console.error('Error fetching Spotify token:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.data);
        }
    }
}
getSpotifyToken()



app.use(async(req,res,next) => {
    if(!token){
        await getSpotifyToken();
    }
    next();
});

//Endpoint For Using GroovAI™ To Create a playlist
app.get('/getSongsFromAI/:prompt/:username', async (req,res)=>{
    try{
        const songList = await AI(req.params.prompt,req.params.username, token)
        console.log(songList)
        res.json(songList)
    }catch(error){
        console.log(error)
    }
})
//Endpoint for Searching the Spotify API for songs
app.get('/search', async (req, res)=>{
    const songName = req.query.q;
    console.log('searching for ', songName)
    try{
        const response = await axios.get('https://api.spotify.com/v1/search',{
            headers:{
                'Authorization': 'Bearer ' + token
            },
            params:{
                q:songName,
                type:'track'
            }
        });
        res.json(response.data);
    }catch(error){
        console.error('Error fetching from Spotify API:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.data);
        }
        res.status(500).send('Error fetching song data');
    }
})
//Endpoint to Get the cover Art of the Song
app.get('/coverArt/:id', async(req, res) =>{
    const trackId = req.params.id;
    try{
        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`,{
            headers:{
                'Authorization': 'Bearer ' + token
            }
        })
        const albumImages = response.data.album.images;
        const coverArtUrl = albumImages[0].url;
        res.json({ coverArtUrl });
    }catch(error){
        console.error('error fetching track data: ', error);
        res.status(500).json({error: 'failed to fetch track data'});

    }
});
//Endpoint to get the specific data of the track from the Spotify API
app.get('/track/:id', async(req, res) =>{
    const trackId = req.params.id;
    try{
        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`,{
            headers:{
                'Authorization': 'Bearer ' + token
            }
        })
        res.json(response.data)
    }catch(error){
        console.error('error fetching track data: ', error);
        res.status(500).json({error: 'failed to fetch track data'});

    }
});
//Creates an empty playlist so songs can be added.
app.post('/api/savePlaylist/:fileName/:username', (req, res) =>{
    const data = req.body; //This is depreciated. Keeping it just in case
    const username = req.params.username;
    const fileName = `${req.params.fileName}.json`;
    const filePath = path.join(playlistDir,`${username}Playlists`, fileName);

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) =>{
        if(err){
            console.error('error writing json file:', err)
            return res.status(500).json({error: 'failed to create json file'});

        }
        res.json({ message: `Playlist "${fileName}" saved successfully!` });
    })
})
//Endpoint for Deleting songs from playlists
app.get(`/api/deleteFromPlaylist/:songIndex/:playlist/:username`,(req,res)=>{
    var songIndex = req.params.songIndex;
    var playlistName = req.params.playlist;
    var user = req.params.username
    var filename = `${playlistName}.json`
    //Defines the path to the specific playlist that is having a song deleted.
    var filepath = path.join(playlistDir, `${user}Playlists`, filename)
    var playlist;
    fs.readFile(filepath,(err,data)=>{
        if(err){
            console.error('error Reading the playlist for song deletion', err)
            return res.status(500).json({error:'error Reading the playlist for song deletion'})
        }
        try{
            const playlistData = JSON.parse(data)
            playlistData.splice(songIndex,1)
            //Updates the Index of each song so it reflects the new playlist
            for(i = 0; i<playlistData.length; i++){
                song = playlistData[i]
                var indexOfSongTemp = song.index
                if(indexOfSongTemp >songIndex){         
                    song.index = indexOfSongTemp -1
                }
            }
            playlist = playlistData;

            fs.writeFile(filepath, JSON.stringify(playlist, null, 2), (err)=>{
                if(err){
                    console.error('there was an error overwriting the playlist: ', error)
                    return res.status(500).json({error: 'error overwriting playtlist'})
                }
                res.json(playlist)
            })
        }catch(error){
            console.error('Error with parsing the json data:',  error)
        }
    })
    
    
})
//Endpoint for saving the User data when it is changed by the user
app.post('/api/saveUserData/:username', (req,res)=>{
    const username = req.params.username
    const changedData = req.body

    fs.writeFile(path.join(__dirname, 'UserInfo', `${username}Data.json`), JSON.stringify(changedData,null,2), (err)=>{
        if(err){
            console.error('there was an error writing to user data file', err)
            return res.status(500).json({error: 'there was an error changing your user data xx'})
        }else{
            res.json('well done the data was saved i think')

        }
    })
})
//Endpoint for Adding songs to a playlist
app.post('/api/addToPlaylist/:username/:playlistName',(req,res)=>{
    
    const username = req.params.username;
    const playlistName = req.params.playlistName;
    const songToAdd = req.body;
    //Reads the Playlist file so the data can be added too
    fs.readFile(path.join(playlistDir, `${username}Playlists`, playlistName),(err,data)=>{
        if(err){
            console.error('Error reading File: ', err)
            return res.status(500).json({error:'Failed to read directory'})
        }

        const playlist = JSON.parse(data)
        playlist.push(songToAdd)

        //Updates all indexes of the songs so that they are Correct
        for(i=0; i<playlist.length;i++){
            song = playlist[i]
            song.index = i
        }
        //ReWrites the playlist to the correct playlist file
        fs.writeFile(path.join(playlistDir, `${username}Playlists`, playlistName), JSON.stringify(playlist, null, 2), (err)=>{
            if(err){
                console.error('there was an error writing to file', err)
                return res.status(500).json({error: 'there was an error adding to your playlist'})
            }
            res.json(playlist)
        })
    })
})
//Endpoint for sending all of the users playlists to the frontend
app.get('/api/getPlaylists/:username', (req,res) =>{
    const username = req.params.username
    var loggedInPlaylistPath = path.join(playlistDir,`${username}Playlists`)
    fs.readdir(loggedInPlaylistPath, (err, files) =>{
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        //Ensures all playlists end in .json
        const playlistJson = files.filter(file => file.endsWith('.json'));
        
        res.json(playlistJson)
    })
})
//Endpoint for Sending a specific playlist to the frontend
app.get('/api/getPlaylist/:filename/:username', (req, res) =>{
    const username = req.params.username
    const filename = req.params.filename

    const loggedInPlaylistPath = path.join(playlistDir,`${username}Playlists`)
    
    const filePath = path.join(loggedInPlaylistPath, filename)

    fs.readFile(filePath,'utf8', (err, data) =>{
        if(err){
            console.error('error reading file: ', err)
            return res.status(500).json({error: 'Failed to read file'})
        }
        try{
            const jsonData = JSON.parse(data)
            res.json(jsonData)
        }catch(err){
            console.error('error parsing json: ', err)
            res.status(500).json({error: 'failed to parse json'})
        }
    })
    
})
//Function for Refreshing song links
async function RefreshLinks(username) {
    const fs = require('fs').promises
    const playlistDirectory = path.join(__dirname, 'public', 'Playlists', `${username}Playlists`);
    
    try {
        const files = await fs.readdir(playlistDirectory);
        console.log(`All Files from Logged in Account: ${files}`);

       //Iterates through each playlist in the users folder for song refreshing
        for (const file of files) {
            const filePath = path.join(playlistDirectory, file);
            let refreshedPlaylist = [];

            try {
                const data = await fs.readFile(filePath, 'utf-8');
                const jsonData = JSON.parse(data);
                
                //Makes a request to the Deezer API To refresh the Song links for each song 
                if (jsonData.length > 0) {
                    for (const song of jsonData) {
                        const searchQuery = encodeURIComponent(`${song.name} ${song.artists}`);
                        const responseURL = `https://api.deezer.com/search?q=${searchQuery}`;
                        
                        try {
                            const response = await axios.get(responseURL);
                            song.link = response.data.data[0].preview;
                            refreshedPlaylist.push(song);
                        } catch (error) {
                            console.error(`Error while refreshing song link: ${error}`);
                        }
                    }
                }

                
                await fs.writeFile(filePath, JSON.stringify(refreshedPlaylist, null, 2));
                console.log(`Successfully updated: ${file}`);

            } catch (err) {
                console.error(`Error processing file ${file}: ${err}`);
            }
        }
    } catch (err) {
        console.error(`Error reading playlist directory: ${err}`);
    }
}

//Pauses for a specific time.

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//This is the part that defines where the server is running from.

const ip = "0.0.0.0"; 
const port = process.env.PORT || 3000;


app.listen(port, ip, () => {
    console.log(`Server running at http://${ip}:${port}`);
});


