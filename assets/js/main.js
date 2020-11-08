/*##########################################################################
Config
############################################################################ */

const imageZoom = document.querySelector("#image-zoom");
const holderItems = document.querySelectorAll(".image-holder__item");
const imageMenue = document.querySelector("#image-menue");
const menuOptions = imageMenue.querySelectorAll(".image-options__item");
const slider = document.getElementById('grid-size');
const root = document.documentElement;

/*##########################################################################
Classes
############################################################################ */

/* Handle Interactions
---------------------------------------------------------------------------- */

class handleInteractions { 

  constructor(holderItems, options, states ) { 
    this.holderItems = holderItems;
    this.options = options;
    this.states = states;
    this.slider = slider;
    this.marked = false;
    this.menuOptions = menuOptions;
    this.setClickEvents();
    this.setKeyboardEvents();
    this.setMenuOptions();
    this.setSliderEvents();
  }

  setSliderEvents() { 
    let slider = this.slider;
    this.slider.addEventListener('change', function () {
      root.style.setProperty('--grid-size', slider.value + "rem");
    });
  }

  openInNewTab() {
    let url = this.marked.src;
    let win = window.open(url, '_blank');
    win.focus();
  }

  setMenuOptions() { 
    this.menuOptions.forEach(item => {
      item.addEventListener('click', (event) => {
        let state = item.id;
        if (state === "is-large") {
          this.zoomImage(this.marked);
          this.options.toggleOption(state);
        } else if(state === "open"){ 
          this.openInNewTab();
        } else { 
          this.marked.classList.toggle(state);
          this.states.toogleState(this.marked, state);
          this.options.toggleOption(state);
        }
      });
    });
  }
  
  setClickEvents() { 
    this.holderItems.forEach(item => {
      item.addEventListener('click', (event) => {
        let item = event.target;
        this.handleMarking(item);
      });
    });
  }

  handleMarking(element) { 
    if (!this.marked) { 
      element.classList.add("is-marked");
      this.marked = element;
      this.options.showMenue(element);
    }
    else if (this.marked && this.marked === element) { 
      this.marked.classList.remove("is-marked");
      this.marked = false;
      this.options.hideMenue();
    }
    else{
      this.marked.classList.remove("is-marked");
      element.classList.add("is-marked");
      this.marked = element;
      this.options.showMenue(element);
    }
  }

  zoomImage(obj) {
    imageZoom.querySelector("img").src = obj.src;
    imageZoom.classList.toggle("is-active");
    imageZoom.querySelector("figcaption").innerText = obj.alt;
  }

  setKeyboardEvents() { 
    document.addEventListener('keydown', e => { 
      if (!this.marked) {
        return false;
      }
      switch (e.code) {
        case "KeyS":
          this.marked.classList.toggle("is-fav");
          this.states.toogleState(this.marked, "is-fav");
          this.options.toggleOption("is-fav");
          break;
  
        case "Space":
          this.zoomImage(this.marked);
          this.options.toggleOption("is-large");
          break;
  
        case "KeyD":
          this.marked.classList.toggle("is-bad");
          this.states.toogleState(this.marked, "is-bad");
          this.options.toggleOption("is-bad");
          break;
  
        case "KeyF":
          if (this.marked.requestFullscreen) {
            this.marked.requestFullscreen();
          }
          break;
        default:
          return false;
      }
    });
  }
}

/* Image Options
---------------------------------------------------------------------------- */

class imageOptions { 

  constructor(states) { 
    this.target = imageMenue;
    this.states = states;
    this.menuOptions = menuOptions;
  }

  resetOptions() {
    this.menuOptions.forEach(option => {
      option.classList.remove("is-active");
    });
  }

  assignOptions(key) { 
    let activeStates = this.states.getStates(key);
    this.resetOptions();
    if (activeStates) { 
      activeStates.forEach(state => { 
        this.toggleOption(state);
      });
    }
  }

  showMenue(element) { 
    this.target.classList.add("is-active");
    let key = element.id;
    this.assignOptions(key);
  }

  hideMenue() { 
    this.target.classList.remove("is-active");
  }

  toggleOption(option) { 
    let target = document.getElementById(option);
    target.classList.toggle("is-active");
  }
}


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
    if (this.storageAvailable('localStorage')) {
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
  
  storageAvailable(type) {
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

}


/*##########################################################################
Main
############################################################################ */

document.addEventListener("DOMContentLoaded", function (event) {

  /* Storage
  -------------------------------------------------------------------------- */
  const states = new storeHandler(holderItems);


  /* Image Options
  -------------------------------------------------------------------------- */
  const options = new imageOptions(states);


  /* Interactions
  -------------------------------------------------------------------------- */  
  const interactions = new handleInteractions(holderItems, options, states);

});


/* Prevent Scrolling on Spacebar hit. 
---------------------------------------------------------------------------- */

window.onkeydown = function (e) {
  return !(e.keyCode == 32);
};

