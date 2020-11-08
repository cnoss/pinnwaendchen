/*##########################################################################
Config
############################################################################ */

let marked = false;
const imageZoom = document.querySelector("#image-zoom");
const holderItems = document.querySelectorAll(".image-holder__item");

/*##########################################################################
Classes
############################################################################ */



/* Store States
---------------------------------------------------------------------------- */

class storeHandler{
  constructor(elements) {
    elements.forEach(element => { 
      let states = this.getStates(element.id);
      let target = document.getElementById(element.id);
      if (states) { 
        states.forEach(state => {
          this.setState(target, state);
        });
      }
    });
  }

  getStates(key) { 
    return JSON.parse(localStorage.getItem(key));
  }

  setState(element, state) { 
    element.classList.add(state);
  }

  storeStates(key, states) { 
    return localStorage.setItem(key, JSON.stringify(states));
  }

  toogleState(element, newState) { 
    if (storageAvailable('localStorage')) {
      let id = element.id;
      let states = this.getStates(id);
      states = (Array.isArray(states)) ? states : [];
      if (states.includes(newState)) {
        let index = states.indexOf(newState)
        if (index > -1) { states.splice(index, 1) }
      } else { 
        states.push(newState);
      }
      this.storeStates(id, states);
    }
  }
}



/*##########################################################################
Functions
############################################################################ */

/* Zoom Images
---------------------------------------------------------------------------- */

function zoomImage(obj) {
  imageZoom.querySelector("img").src = obj.src;
  imageZoom.classList.toggle("is-active");

  imageZoom.querySelector("figcaption").innerText = obj.alt;
}


/* Check Local Storage
---------------------------------------------------------------------------- */

function storageAvailable(type) {
  var storage;
  try {
      storage = window[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
  }
  catch(e) {
      return e instanceof DOMException && (
          // everything except Firefox
          e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
          // acknowledge QuotaExceededError only if there's something already stored
          (storage && storage.length !== 0);
  }
}

/*##########################################################################
Main
############################################################################ */

document.addEventListener("DOMContentLoaded", function (event) {

  /* Storage
  -------------------------------------------------------------------------- */
  
  let states = new storeHandler(holderItems);


  /* Click Events
  -------------------------------------------------------------------------- */

  holderItems.forEach(item => {
    item.addEventListener('click', (event) => {
      let item = event.target;
      if (marked && marked != item) {
        marked.classList.remove("is-marked");
      }
      item.classList.toggle("is-marked");
      marked = item;
    });
  });


  /* Keyboard Events
  -------------------------------------------------------------------------- */

  document.addEventListener('keydown', logKey);
  function logKey(e) {
    if (!marked) {
      return false;
    }
    switch (e.code) {
      case "KeyS":
        marked.classList.toggle("is-fav");
        states.toogleState(marked, "is-fav");
        break;

      case "Space":
        zoomImage(marked);
        break;

      case "KeyD":
        marked.classList.toggle("is-bad");
        states.toogleState(marked, "is-bad");
        break;

      case "KeyF":
        if (marked.requestFullscreen) {
          marked.requestFullscreen();
        }
        break;
      default:
        return false;
    }
  }

});


/* Prevent Scrolling on Spacebar hit. 
---------------------------------------------------------------------------- */

window.onkeydown = function (e) {
  return !(e.keyCode == 32);
};

