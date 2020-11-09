/*##########################################################################
Config
############################################################################ */

const imageZoom = (document.querySelector("#image-zoom")) ? document.querySelector("#image-zoom") : false;
const holderItems = (document.querySelectorAll(".image-holder__item")) ? document.querySelectorAll(".image-holder__item") : false;
const imageMenue = (document.querySelector("#image-menue")) ? document.querySelector("#image-menue") : false;
const menuOptions = (imageMenue) ? imageMenue.querySelectorAll(".image-options__item") : false;
const slider = (document.getElementById('grid-size')) ? document.getElementById('grid-size') : false;
const root = document.documentElement;

/*##########################################################################
Classes
############################################################################ */

/* Handle Interactions
---------------------------------------------------------------------------- */

class handleInteractions {

  constructor(holderItems, options, states) {
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
    this.setGridSize();
    this.setRotations();
  }

  setGridSize() {
    let gridSize = this.states.getStates("grid-size");
    root.style.setProperty('--grid-size', gridSize + "rem");
  }

  setSliderEvents() {
    let $slider = this.slider;
    let $states = this.states;
    this.slider.addEventListener('change', function () {
      root.style.setProperty('--grid-size', $slider.value + "rem");
      $states.storeStates("grid-size", $slider.value);
    });
  }

  openInNewTab() {
    let url = this.marked.querySelector("img").src;
    let win = window.open(url, '_blank');
    win.focus();
  }

  setRotations() {
    let $states = this.states;
    this.holderItems.forEach(item => {
      let rotation = $states.getStates(item.id);
      if (rotation) {
        item.setAttribute('data-rotation', rotation);
      }
    });
  }

  setRotation() {
    let element = this.marked.querySelector("img")
    let dataset = element.dataset.rotation;

    if (dataset === "90") {
      element.setAttribute('data-rotation', '180');

    } else if (dataset === "180") {
      element.setAttribute('data-rotation', '270');

    } else if (dataset === "270") {
      element.setAttribute('data-rotation', '0');

    } else {
      element.setAttribute('data-rotation', '90');
    }

    this.states.storeStates(element.id, dataset);
  }

  setMenuOptions() {
    this.menuOptions.forEach(item => {
      item.addEventListener('click', (event) => {
        let state = item.id;

        if (state === "is-large") {
          this.zoomImage(this.marked);
          this.options.toggleOption(state);

        } else if (state === "rotate") {
          this.setRotation();

        } else if (state === "open") {
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
    element = element.parentNode;
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
    else {
      this.marked.classList.remove("is-marked");
      element.classList.add("is-marked");
      this.marked = element;
      this.options.showMenue(element);
    }
  }

  zoomImage(obj) {
    let img = obj.querySelector("img");
    imageZoom.querySelector("img").src = img.src;
    imageZoom.querySelector("img").setAttribute("data-rotation", img.dataset.rotation);
    imageZoom.classList.toggle("is-active");
    imageZoom.querySelector("figcaption").innerText = img.alt;
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

        case "KeyR":
          this.setRotation();
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

class storeHandler {
  constructor(elements) {

    elements.forEach(element => {
      element = element.parentNode;
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
    catch (e) {
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


/* Image Canvas
---------------------------------------------------------------------------- */

class imageCanvas {

  constructor(holderItems) {
    this.replaceImages(holderItems);

  }

  replaceImages(items) {
    items.forEach(item => {
      let idParent = "holder-" + item.id;
      item.parentNode.id = idParent;
      this.createCanvas(idParent);
    });
  }

  createCanvas(id) {
    id.setup = function () {
      id.createCanvas(400, 400);
    }

    holderItems.forEach(item => {
      new p5(this.createCanvas, item)
    });

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


  /* Image Canvas
  -------------------------------------------------------------------------- */
  // const canvas = new imageCanvas(imageZoom);


  /* Interactions
  -------------------------------------------------------------------------- */
  const interactions = new handleInteractions(holderItems, options, states);

});


/* Prevent Scrolling on Spacebar hit. 
---------------------------------------------------------------------------- */

window.onkeydown = function (e) {
  return !(e.keyCode == 32);
};

