document.addEventListener('DOMContentLoaded', () => {
  addEventListeners()
})

function addEventListeners(){
  const minimizeButton = document.getElementById('minimize');
  const maximizeButton = document.getElementById('maximize');
  const closeButton = document.getElementById('close');


  if (minimizeButton) {
      minimizeButton.addEventListener('click', () => {
          window.electron.minimize();
      });
  } else {
    console.log('Minmize not find')
  }

  if (maximizeButton) {
      maximizeButton.addEventListener('click', () => {
          window.electron.maximize();
      });
  } else {
      console.error("Maximize not found");
  }

  if (closeButton) {
      closeButton.addEventListener('click', () => {
          window.electron.close();
      });
  } else {
      console.error("Close not found");
  }
}
