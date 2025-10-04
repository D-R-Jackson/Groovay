var currentAudio = null
var currentAudioContext = null
function EQ(url){
    if(currentAudioContext){
        currentAudioContext.close();
        currentAudioContext = null;
    }
    

    const eqAud = url
    eqAud.crossOrigin = "anonymous"
    const audioContext = new (window.AudioContext)();
    currentAudioContext = audioContext
    const source = audioContext.createMediaElementSource(eqAud);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 64;
    const frequencies = [250, 500, 1000, 4000, 10000];
    
    
    const filters = frequencies.map(freq => {
        let filter = audioContext.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1;
        filter.gain.value = 0;
        return filter;
    });
    
    const bassFilter = audioContext.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 200;
    bassFilter.gain.value = 0;
    
    const trebleFilter = audioContext.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 3000;
    trebleFilter.gain.value = 0;
    
    source.connect(filters[0]);
    for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
    }
    filters[filters.length - 1].connect(bassFilter);
    
    filters[0].gain.value = document.getElementById('eq250').value
    filters[0].gain.value = document.getElementById('eq500').value
    filters[0].gain.value = document.getElementById('eq1k').value
    filters[0].gain.value = document.getElementById('eq4k').value
    filters[0].gain.value = document.getElementById('eq10k').value
    bassFilter.gain.value = document.getElementById('bass').value
    trebleFilter.gain.value = document.getElementById('treble').value

    bassFilter.connect(trebleFilter);
    trebleFilter.connect(analyser);
    analyser.connect(audioContext.destination);
    
    
    document.getElementById("eq250").addEventListener("input", (event) => {
        filters[0].gain.value = event.target.value;
    });
    document.getElementById("eq500").addEventListener("input", (event) => {
        filters[1].gain.value = event.target.value;
        SaveUserData()
    });
    document.getElementById("eq1k").addEventListener("input", (event) => {
        filters[2].gain.value = event.target.value;
    });
    document.getElementById("eq4k").addEventListener("input", (event) => {
        filters[3].gain.value = event.target.value;
    });
    document.getElementById("eq10k").addEventListener("input", (event) => {
        filters[4].gain.value = event.target.value;
    });
    document.getElementById("bass").addEventListener("input", (event) => {
        bassFilter.gain.value = event.target.value;
    });
    document.getElementById("treble").addEventListener("input", (event) => {
        trebleFilter.gain.value = event.target.value;
    });
    
    
    
    const canvas = document.getElementById('eqCanvas');
    const ctx = canvas.getContext('2d');

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        requestAnimationFrame(draw);
    
        analyser.getByteFrequencyData(dataArray);
    
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2a2e35';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        const barWidth = (canvas.height / bufferLength) * 1;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i]/2;
            //console.log('drawing')
            ctx.fillStyle = `rgb(${barHeight + 22}, 92, 133)`;
            //ctx.fillstyle = '#7a5c85'
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
    
            x += barWidth + 1;
        }
    }
    draw();
    return audioContext
}
