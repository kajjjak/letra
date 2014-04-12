
var _default_setup = '{"level":"alphabet", "sound":true, "state":null}'; // sentence, words, alphabet, numbers

function getSetup(attr, default_value){
  var setup = JSON.parse(localStorage.getItem("setup") || _default_setup);
  if(!setup[attr]){ return setup[attr]; }
  return setup[attr];
}

function setSetup(attr, value){
  var setup = JSON.parse(localStorage.getItem("setup") || _default_setup);
  setup[attr] = value;
  localStorage.setItem("setup", JSON.stringify(setup));
  return setup;
}

function togglesound() {
  if (sound) {
    sound = false;
    soundbutton.src = "images/Hljod-OFF.png";
  } else {
    sound = true;
    soundbutton.src = "images/Hljod-ON.png";
  }
  setSetup("sound", sound);
}

setTimeout(function(){
  window.soundbutton = document.querySelector('#sound');
  soundbutton.addEventListener('click', togglesound, false);
  window.sound = !getSetup("sound"); //load the opposite value
  togglesound(); //then fix the opposite value fixing the gui as well
}, 100);
