const fs = require('fs')
const path = require('path')
const axios = require('axios');
const { error } = require('console');

const activityFile = fs.readFileSync(path.join(__dirname, 'activities.json'), 'utf-8');
const activityMap = JSON.parse(activityFile)
const moodFile = fs.readFileSync(path.join(__dirname, 'moods.json'), 'utf-8');
const moodMap = JSON.parse(moodFile)
const genreFile = fs.readFileSync(path.join(__dirname, 'genres.json'), 'utf-8');
const genreMap = JSON.parse(genreFile)
console.log('Activities:', activityMap.length, 'Moods:', moodMap.length, 'Genres:', genreMap.length)
const vectorMap = activityMap.concat(moodMap,genreMap)
const ip = 'http://groovay:3000'
function getRandomInt(max){
    return Math.floor(Math.random()*max)
}
let multiWordKeywords = []
let singleWordKeyword = []
let accessToken = null;

function cosineSim(vec1, vec2){
    var dotProduct = 0;
    var mag1 = 0;
    var mag2 = 0;
    for(i=0;i<vec1.length;i++){
        dotProduct += vec1[i]*vec2[i]
        mag1 += vec1[i]*vec1[i]
        mag2 += vec2[i]*vec2[i]
    }
    mag1 = Math.sqrt(mag1)
    mag2 = Math.sqrt(mag2)
    var simmilarity = dotProduct/(mag1*mag2)
    //console.log('cosinesim: ', simmilarity)
    return simmilarity;
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function recognise2Words(){
    for(i=0;i<vectorMap.length;i++){
        if(vectorMap[i].prompt.includes(" ")){
            multiWordKeywords.push(vectorMap[i].prompt);
        }
        if(!vectorMap[i].prompt.includes(" ")){
            singleWordKeyword.push(vectorMap[i].prompt)
        }
    }
}
function processANDtokenize(text){
    //ProcessingPrompt
    const prompt = text.toLowerCase();
    const splitPrompt = prompt.split(' ')
    const stopWords = ['a', 'the', 'for', 'create', 'me', 'they', 'playlist','going','to','im']
    const promptProcessed = splitPrompt.filter(word=>!stopWords.includes(word))
    console.log('var promptProcessed:', promptProcessed)
    let processedPromptFinal = []
    for(word of promptProcessed){
        for(i=0;i< vectorMap.length;i++){
            console.log(`Word:${word} vectorMap:${vectorMap[i].prompt}`)
            if(word.includes(vectorMap[i].prompt)){
                processedPromptFinal.push(vectorMap[i].prompt)
            }
        }
    }
    processedPromptFinal = [...new Set(processedPromptFinal)]
    //Tokenizing
    console.log('The processed prompt: ', processedPromptFinal)
    const tokenized = []
    recognise2Words()
    const tWords = processedPromptFinal.join(' ').toLowerCase().split(/\s+/)
    for(let i = 0; i<tWords.length; i++){
        if(i<tWords.length -1){
            const twoWordPhrase = `${tWords[i]} ${tWords[i+1]}`
            if(multiWordKeywords.includes(twoWordPhrase)){
                tokenized.push(twoWordPhrase)
                console.log('twoWordPhrase ', twoWordPhrase)
                i++;
                continue;
            }
        }
        if(singleWordKeyword.includes(tWords[i])){
            tokenized.push(tWords[i])
            console.log('singlewordphrase ', tWords[i])
            continue;
        }
    }
    var promptObjs = [] 
    vectorMap.forEach(obj=>{
        for(token of tokenized)
            
            if(obj.prompt == token){
                promptObjs.push(obj)
            }
    })

    return promptObjs;
}
function getSimmilarWords(wordVectors){
    const allSimmilarWords = []
    for(vector of wordVectors){
        console.log(vector.vector)
        var simmilarMoods = []
        var simmilarGenres = []
        var simmilarActivities = []
        const simmilarWords = {}
        //calculating simmilar words
        for(mood of moodMap){

            const simmilarity = cosineSim(vector.vector, mood.vector)
            var simmilarityObj = {}
            simmilarityObj.prompt = mood.prompt;
            simmilarityObj.sim = simmilarity
            simmilarMoods.push(simmilarityObj)
            
        }
        for(genre of genreMap){

            const simmilarity = cosineSim(vector.vector, genre.vector)
            var simmilarityObj = {}
            simmilarityObj.prompt = genre.prompt
            simmilarityObj.sim = simmilarity
            simmilarGenres.push(simmilarityObj)

        }
        for(activity of activityMap){

            const simmilarity = cosineSim(vector.vector, activity.vector)
            var simmilarityObj = {}
            simmilarityObj.prompt = activity.prompt
            simmilarityObj.sim = simmilarity
            simmilarActivities.push(simmilarityObj)
        }

        //sortingTheLists
        simmilarMoods.sort(function(a,b){return b.sim-a.sim})
        simmilarMoods = simmilarMoods.slice(0,3)
        simmilarGenres.sort(function(a,b){return b.sim-a.sim})
        simmilarGenres = simmilarGenres.slice(0,3)
        simmilarActivities.sort(function(a,b){return b.sim-a.sim})
        simmilarActivities = simmilarActivities.slice(0,3)
        simmilarWords.activity = simmilarActivities
        simmilarWords.mood = simmilarMoods
        simmilarWords.genre = simmilarGenres
        allSimmilarWords.push(simmilarWords)
    }
    return allSimmilarWords

    
}
async function getDeezerLink(search){
    searchQuery = encodeURIComponent(search)
    const responseURL = `https://api.deezer.com/search?q=${searchQuery}`
    try{
        const response = await axios.get(responseURL)
        if(!response.data?.data[0]?.preview){
            return undefined
            
        }
        else{           
            return response.data.data[0].preview
        }
    }catch(error){
        console.error('Error fetching songs from Deezer: ', error)
    }
}

// get cossine sim to find simmilart activites and such
//go spotify
async function AI(userPrompt,username,accessCode){
    console.log('userPrompt', userPrompt)
    if(userPrompt === '' || userPrompt === ' '){
        return(`${username} Please actually type something.`)
    }
    const accessToken = accessCode
    const wordVectors = processANDtokenize(userPrompt)
    const simmilarWords = getSimmilarWords(wordVectors)
    console.log(simmilarWords)
    console.log('UsingToken: ', accessToken)
    let responseData = []
    for(word of simmilarWords){
        for(i = 0; i<3; i++){

            let searchPrompt = `${word.activity[i].prompt} genre:${word.genre[i].prompt}` //The prompt the spotify API is queried with
            
            try{
                console.log('Search Prompt: ', searchPrompt)
                const response = await axios.get('https://api.spotify.com/v1/search',{
                    headers:{
                        'Authorization':'Bearer '+accessToken
                    },
                    params:{
                        q:searchPrompt,
                        type:'track',
                        offset: getRandomInt(25)
                    }
                });
                const data = response.data
                

                for(track of data.tracks.items){
                    song = {}
                    const artists = []
                    track.artists.forEach(artist=>{artists.push(artist.name)})
                    const link = await getDeezerLink(`${track.name} ${track.artists.map(artist=>artist.name)}`)
                    if(link === undefined){
                        console.log('link was undefined xx ')
                        continue;
                    }
                    song.name = track.name
                    song.artists = artists
                    song.link = link
                    song.img = track.album.images[0].url
                    responseData.push(song)

                }
                
            }catch(error){
                console.log('thers been an error: ', error.response.data)
                
            }
            
        }
    }
    for(i = 0; i<responseData.length;i++){
        responseData[i].index = i
    }
    if(responseData.length < 5){
        //code for redoing the playlist generation using only genres xx
        console.log('Im finna have to like redo the playlist generation because its shit ')
        for(word of simmilarWords){
            for(i = 0; i<3; i++){

                let searchPrompt = `genre:${word.genre[i].prompt}`
                
                try{
                    console.log('Search Prompt: ', searchPrompt)
                    const response = await axios.get('https://api.spotify.com/v1/search',{
                        headers:{
                            'Authorization':'Bearer '+accessToken
                        },
                        params:{
                            q:searchPrompt,
                            type:'track',
                            offset: getRandomInt(25)
                        }
                    });
                    const data = response.data
                    
       
                    for(track of data.tracks.items){
                        song = {}
                        const artists = []
                        track.artists.forEach(artist=>{artists.push(artist.name)})
                        const link = await getDeezerLink(`${track.name} ${track.artists.map(artist=>artist.name)}`)
                        if(link === undefined){
                            console.log('link was undefined xx ')
                            continue;
                        }
                        song.name = track.name
                        song.artists = artists
                        song.link = link
                        song.img = track.album.images[0].url
                        responseData.push(song)

                    }
                    
                }catch(error){
                    console.log('thers been an error: ', error.response.data)
                    
                }
                
            }
        }
    }
    let AIResponses = []
    if(simmilarWords.length != 0){
        AIResponses = [`Hey ${username} ive created you a ${wordVectors[0].prompt} playlist. I hope you Enjoy! <3`, `Yoooo Wys ${username} the ${wordVectors[0].prompt} playlist will be crazy yk.`, `Hello ${username} I am An AI created by God himself. I truly hope you enjoy your ${wordVectors[0].prompt} playlist. I spent a long time curating it`]//Changed during production

    }
    const errorResponses = [`Im sorry ${username} I cannot create you a playlist for ${userPrompt}. I hope you give me another Prompt so i may create you your desired playlist.`] //These would be changed during production
    try {
        console.log(`Creating Playlist For: ${responseData}`)
        const createPlaylistResponse = await fetch(`${ip}/api/savePlaylist/${wordVectors[0].prompt}/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseData)
        });

     
        if (!createPlaylistResponse.ok) {
            throw new Error(`HTTP error! status: ${createPlaylistResponse.status}`);
        }

        const result = await createPlaylistResponse.json(); 
        console.log(result.message);
        return(AIResponses[getRandomInt(AIResponses.length )])
    } catch (error) {
        console.error('Error occurred:', error);
        await sleep(150)
        return(errorResponses[getRandomInt(errorResponses.length)])
    }
   
}
module.exports = { AI };
