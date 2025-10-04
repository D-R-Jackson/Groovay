const userInput = document.getElementById('GroovAI').children[1]
const chatArea = document.getElementById('AIChat')
//const ip = 'http://localhost:3000'
console.log('AI SCRIPT IS LOADED')
userInput.addEventListener('keydown',async (event)=>{
    if(event.key === 'Enter' && event.target.value != ''){
        event.preventDefault()
        let inputValue = event.target.value;
        console.log('input val: ', inputValue)
        console.log('attempting ai generation....')
        const username = GetUsername()
        
        //put code for ai
        try{
            
            const userText = document.createElement('div')
            const groovyText = document.createElement('div')

            userText.className = 'userMessage'
            userText.innerText = inputValue
            chatArea.appendChild(userText)
            chatArea.scrollTop = chatArea.scrollHeight
            event.target.value = ''
            groovyText.className = 'groovAIMessage'
            groovyText.innerHTML = `<span class="circle"></span><span class="circle"></span><span class="circle"></span>`
            
            chatArea.appendChild(groovyText)
            chatArea.scrollTop = chatArea.scrollHeight

            const response = await fetch(`${ip}/getSongsFromAI/${inputValue}/${username}`)//make this return a message to put as groovaytext innertext
            groovyText.innerText = await response.json()
            chatArea.scrollTop = chatArea.scrollHeight
        }catch(error){
            console.log('Theres been an error with AI generation: ',error)
        }
        GetPlaylists()
        event.target.value = ''
    }

})


