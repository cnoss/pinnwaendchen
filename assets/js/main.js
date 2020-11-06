document.addEventListener("DOMContentLoaded", function(event) {
  let marked = false;

  document.querySelectorAll(".image-holder__item").forEach(item => {
    item.addEventListener('click', (event) => {
      let item = event.target;
      if (marked && marked != item) {
        marked.classList.remove("is-marked");
      }
      item.classList.toggle("is-marked");
      marked = item;
    });
  });


  document.addEventListener('keydown', logKey);
    function logKey(e) {
      if (!marked) { 
        return false;
      }
      switch (e.code) {
        case "KeyS":
          marked.classList.toggle("is-fav");
          break;
        
          case "Space":
            marked.classList.toggle("is-large");
          break;
        
          case "KeyD":
            marked.classList.toggle("is-bad");
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

window.onkeydown = function(e) { 
  return !(e.keyCode == 32);
};

