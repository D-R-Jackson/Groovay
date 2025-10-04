let isLight
var doHistory


let lightmodeButton = null;
//const ip = 'http://localhost:3000'
//Things with images
const pause = document.getElementById('pause')
const shuffleButtonImg = document.getElementById('shuffle')
const previousButtonImg = document.getElementById('previousSong')
const nextButtonImg = document.getElementById('nextSong')

const acc = document.getElementById('account')
const homeButtonImg = document.getElementById('home')
const searchButtonImg = document.getElementById('Search')

const historyButton = document.getElementById('doHistory')

let stylesheet = document.getElementById('styleSheet')
if(document.getElementById('lightmodeBox') != null){
    lightmodeButton = document.getElementById('lightmodeBox')
}

document.getElementById('eq250').addEventListener('change', ()=>SaveUserData())
document.getElementById('eq500').addEventListener('change', ()=>SaveUserData())
document.getElementById('eq1k').addEventListener('change', ()=>SaveUserData())
document.getElementById('eq4k').addEventListener('change', ()=>SaveUserData())
document.getElementById('eq10k').addEventListener('change', ()=>SaveUserData())
document.getElementById('bass').addEventListener('change', ()=>SaveUserData())
document.getElementById('treble').addEventListener('change', ()=>SaveUserData())


document.getElementById('eqReset').addEventListener('click', ()=>{
    document.getElementById('eq250').value = 0
    document.getElementById('eq250').dispatchEvent(new Event('input', {bubbles:true}))
    document.getElementById('eq500').value = 0
    document.getElementById('eq500').dispatchEvent(new Event('input', {bubbles:true}))
    document.getElementById('eq1k').value = 0
    document.getElementById('eq1k').dispatchEvent(new Event('input', {bubbles:true}))
    document.getElementById('eq4k').value = 0
    document.getElementById('eq4k').dispatchEvent(new Event('input', {bubbles:true}))
    document.getElementById('eq10k').value = 0
    document.getElementById('eq10k').dispatchEvent(new Event('input', {bubbles:true}))
    document.getElementById('bass').value = 0
    document.getElementById('bass').dispatchEvent(new Event('input', {bubbles:true}))
    document.getElementById('treble').value = 0
    document.getElementById('treble').dispatchEvent(new Event('input', {bubbles:true}))
    SaveUserData()
})

function Dark(){
    stylesheet.href = 'darkMode.css'
    //pause.children[0].src = './Resources/DarkMode/Pause.png'
    shuffleButtonImg.children[0].src = './Resources/DarkMode/Shuffle.png'
    previousButtonImg.children[0].src = './Resources/DarkMode/Prev.png'
    nextButtonImg.children[0].src = './Resources/DarkMode/Next.png'
    acc.children[0].src = './Resources/DarkMode/Account.png'
    homeButtonImg.children[0].src = './Resources/DarkMode/Home.png'
    searchButtonImg.children[0].src = './Resources/DarkMode/Search.png'
    if(pause.children[0].src.includes('Play')){
        pause.children[0].src = './Resources/DarkMode/Play.png'
    }else{
        pause.children[0].src = './Resources/DarkMode/Pause.png'
    }
    isLight = false
}
function Light(){
    stylesheet.href = 'lightMode.css'
    //pause.children[0].src = './Resources/LightMode/Pause.png'
    shuffleButtonImg.children[0].src = './Resources/LightMode/Shuffle.png'
    previousButtonImg.children[0].src = './Resources/LightMode/Prev.png'
    nextButtonImg.children[0].src = './Resources/LightMode/Next.png'
    acc.children[0].src = './Resources/LightMode/Account.png'
    homeButtonImg.children[0].src = './Resources/LightMode/Home.png'
    searchButtonImg.children[0].src = './Resources/LightMode/Search.png'
    if(pause.children[0].src.includes('Play')){
        pause.children[0].src = './Resources/LightMode/Play.png'
    }else{
        pause.children[0].src = './Resources/LightMode/Pause.png'
    }
    isLight = true
}
UpdateImgLinks(isLight)

function GetDarkModeGlob(){
    return isLight
}

function lightModeButtonFunc(doLight){
    console.log('DarkButtonPressed!')
    if(!doLight){
        Dark()
        isLight = doLight

       // UpdateImgLinks(doLight)

        return
    }
    if(doLight){
        Light()
        isLight = doLight

       // UpdateImgLinks(doLight)

        return
    }

}

lightmodeButton.addEventListener('click', ()=>{
    UpdateImgLinks(isLight)
    
    console.log('DarkButtonPressed!')
    if(isLight){
        Dark()
        SaveUserData()
        return
    }
    if(!isLight){
        Light()
        SaveUserData()
        return
    }

})

var isShowingHistory = false

document.getElementById('viewHistory').addEventListener('click', ()=>{
    ShowHistory()
})
document.getElementById('deleteHistory').addEventListener('click', ()=>{
    DeleteHistory()
})

function ShowHistory(){
    if(!isShowingHistory){
        document.getElementById('SearchHistory').children[1].innerText = GetData().searchHistory //JSON.stringify(GetData().searchHistory)
        isShowingHistory = true
        return
    }
    if(isShowingHistory){
        document.getElementById('SearchHistory').children[1].innerText = 'Search History'
        isShowingHistory = false
        return
    }
}

function DeleteHistory(){
    GetData().searchHistory = []
    document.getElementById('SearchHistory').children[1].innerText = 'Search History'
    isShowingHistory = false
    SaveUserData()
}
function DoHistory(){
    if(doHistory){
        doHistory = false
        GetData().doSearchHistory = doHistory
        historyButton.innerText = 'Not Saving History'
        return
    }
    if(!doHistory){
        doHistory = true
        GetData().doSearchHistory = doHistory
        historyButton.innerText = 'Saving History'
        return
    }
}

historyButton.addEventListener('click', ()=>{
    DoHistory()
    SaveUserData()
})




const usernameInputChange = document.getElementById('newUsername')
const passwordInputChange = document.getElementById('changePassword')
passwordInputChange.addEventListener('keydown', async(event)=>{
    if(event.key === 'Enter'){
        await changeUsername();        
        passwordInputChange.value = ''
        usernameInputChange.value = ''
        
    }
})
async function changeUsername(){
    ///api/changeUsername/:newUsername/:oldUsername/:password
    console.log(`${ip}/api/changeUsername/${usernameInputChange.value}/${GetUsername()}/${passwordInputChange.value}`)
    const response = await fetch(`${ip}/api/changeUsername/${usernameInputChange.value}/${GetUsername()}/${passwordInputChange.value}`)
    const data = await response.json()
    if(data === true){
        GetData().username = usernameInputChange.value
        console.log(GetData())
        console.log(GetUsername())
        document.cookie = JSON.stringify([GetUsername(), GetData().password])
    }
    if(data === false){
        console.log('errorororro')
    }


}

async function SaveUserData(){
    GetData().light = isLight
    GetData().eqSett.eq250 = document.getElementById('eq250').value
    GetData().eqSett.eq500 = document.getElementById('eq500').value
    GetData().eqSett.eq1k = document.getElementById('eq1k').value
    GetData().eqSett.eq4k = document.getElementById('eq4k').value
    GetData().eqSett.eq10k = document.getElementById('eq10k').value
    GetData().eqSett.bass = document.getElementById('bass').value
    GetData().eqSett.treb = document.getElementById('treble').value

    try{
        const response = await fetch(`${ip}/api/saveUserData/${GetUsername()}`, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(GetData())
        })
        const data = await response.json()
        console.log(data)


    }catch(error){
        console.error('theres been an error with updating the user information')
    }

}