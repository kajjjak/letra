var game_data = {
    "words":["fiskur", "mamma", "pabba", "akil"],
    "alphabet":"AaÁáBbDdÐðEeÉéFfGgHhIiÍíJjKkLlMmNnOoÓóPpRrSsTtUuÚúVvXxYyÝýÞþÆæÖö"
};

(function(){

  var color_blue = "#2c3e50"; /* 44, 62, 80 */
  var color_red = "#F06050"; /* 240, 96, 80 */
  var color_orange = "#EF9033"; /* 239, 144, 51 */
  var color_yellow = "#F7CD1F";/* 247, 205, 31 */
  var color_black = "#415C71"; /* 65, 92, 113 */

  /* Get container elements */
  var container = document.querySelector('#container');

  /* Get buttons */
  //var startbutton = document.querySelector('#intro button');
  var infobutton = document.querySelector('#infos');
  var installbutton = document.querySelector('#install');
  var mainbutton = document.querySelector('#mainbutton');
  //var winbutton = document.querySelector('#win button');
  //var reloadbutton = document.querySelector('#reload');
  var soundbutton = document.querySelector('#sound');
  var scorebutton = document.querySelector('#score');
  //var errorbutton = document.querySelector('#error button');

  /* Get sounds */
  var winsound = document.querySelector('#winsound');
  var errorsound = document.querySelector('#errorsound');

  /* Prepare canvas */
  var c = document.querySelector('canvas');
  var cx = c.getContext('2d');
  var letter = null;
  var fontsize = 300;
  var paintcolour = [65, 92, 113]; //black
  var textcolour = [240, 96, 80];  //red
  var xoffset = 0;
  var yoffset = 0;
  var linewidth = 20;
  var pixels = 0;
  var letterpixels = 0;
  var letterindex = -1;
  var wordindex = 0;
  var letterdrawn = {};

  /* Mouse and touch events */
  var mousedown = false;
  var touched = false;
  var oldx = 0;
  var oldy = 0;

  /* Overall game presets */
  var state = 'intro';
  var sound = true;
  var currentstate;
  var charscontainer = "";

  function showWord(){
    charscontainer = game_data["words"][wordindex].split("");
    document.querySelector('#words').innerHTML = charscontainer;
    wordindex = wordindex + 1;
  }

  function init() {
    showWord();
    xoffset = container.offsetLeft;
    yoffset = container.offsetTop;
    fontsize = container.offsetHeight / 1.5;
    linewidth = container.offsetHeight / 19;
    paintletter();
    setstate('intro');
  }

  function togglesound() {
    if (sound) {
      sound = false;
      soundbutton.className = 'navbuttonoff';
    } else {
      sound = true;
      soundbutton.className = 'navbutton';
    }
  }
  
  window.score = JSON.parse(localStorage.getItem("score") || '{"letters":{}, "words":{}}');
  function setScore(attr, value){
    var word = charscontainer.join("");
    console.info("Letter" + letter);
    console.info("Word" + word);
    if (!score["letters"][letter]){
      score["letters"][letter] = {"retries": 0, "wins": 0, "cancel":0, "unique":0, "count":0};
    }
    score["letters"][letter][attr] = score["letters"][letter][attr] + 1;
    if (!score["words"][word]){
      score["words"][word] = {"retries": 0, "wins": 0, "cancel":0, "unique":0, "count":0};
    }
    score["words"][word][attr] = score["words"][word][attr] + 1;
    localStorage.setItem("score", JSON.stringify(score));
  }

  function showerror() {
    setstate('error');
    if (sound) {
      errorsound.play();
    }
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }
  function setstate(newstate) {
    state = newstate;
    //container.className = newstate;
    window.get_state = currentsate = state;
    speak(newstate);
  }

  function eventmainbuttonhandler(){
    if(currentsate == "intro"){start(); return;}
    if(currentsate == "win"){winner(); return;}
    if(currentsate == "error"){retry(); return;}
    if(currentsate == "play"){cancel(); return;}
  }

  function speak(newstate){
    if(newstate == "intro"){
      say("Getur þú teiknað i stafina?");
    }
    if(newstate == "play"){
      say();
    }
    if(newstate == "win"){
      say("Vel gert!");
    }
    if(newstate == "error"){
      say("Þú teiknaðir fyrir utan stafinn!");
    }    
  }
  function moreneeded() {
    setstate('play');
    mousedown = false;
  }
  function retry(ev) {
    mousedown = false;
    oldx = 0;
    oldy = 0;
    paintletter(letter);
    setScore("retries");
  }
  function winner() {
    paintletter();
    setScore("wins");
  }
  function say(msg){
    if(msg){
      $("#speak").html(msg).show();
    }else{
      $("#speak").hide();
    }
  }
  function start() {
    setScore("starts");
    paintletter(letter);
  }
  function cancel() {
    setScore("cancels");
    paintletter();
    
  }
  function completed(){
      setScore("words");
      showWord();
  }
  function getLetter(){
    var chars = charscontainer;
    if (true){ 
        if(letterindex >= (chars.length-1)){ 
            letterindex = -1;
            letterdrawn = {};
            completed();
            chars = charscontainer;
        } 
        letterindex = letterindex + 1; 
    }else{ 
        letterindex = parseInt(Math.random() * chars.length,10); 
    }
    return chars[letterindex];
  }
  function paintletter(retryletter) {
    setScore("count");
    letter = retryletter || getLetter();
    if(!letterdrawn[letter]){letterdrawn[letter] = true;}
    c.width = container.offsetWidth;
    c.height = container.offsetHeight;
    cx.font = 'bold ' + fontsize + 'px Open Sans';
    cx.fillStyle = 'rgb(' + textcolour.join(',') + ')';
    cx.strokeStyle = 'rgb(' + paintcolour.join(',') + ')';
    cx.shadowOffsetX = 0;
    cx.shadowOffsetY = 0;
    //cx.shadowBlur = 4;
    //cx.shadowColor = 'pink';

    cx.textBaseline = 'baseline';
    cx.lineWidth = linewidth;
    cx.lineCap = 'round';
    cx.fillText(
      letter,
      (c.width - cx.measureText(letter).width) / 2,
      (c.height / 1.3)
    );
    pixels = cx.getImageData(0, 0, c.width, c.height);
    letterpixels = getpixelamount(
      textcolour[0],
      textcolour[1],
      textcolour[2]
    );
    cx.shadowOffsetX = 0;
    cx.shadowOffsetY = 0;
    cx.shadowBlur = 0;
    cx.shadowColor = '#333';
    setstate('play');
    drawLetters();
  }

  function drawLetters(){
    var chars = charscontainer;
    var charsdisplayed = "";
    for (var i = 0; i < chars.length; i++){
        if (letterindex == i){
            charsdisplayed = charsdisplayed + "<b class='blink_me'>" + chars[i] + "</b>";
        }else{
            if(letterdrawn[chars[i]]){
                charsdisplayed = charsdisplayed + "<i>" + chars[i] + "</i>";
            }else{
                charsdisplayed = charsdisplayed + "<b>" + chars[i] + "</b>";
            }
        }
    }
    document.querySelector("#words").innerHTML = charsdisplayed; 
  }

  function getpixelamount(r, g, b) {
    var pixels = cx.getImageData(0, 0, c.width, c.height);
    var all = pixels.data.length;
    var amount = 0;
    for (i = 0; i < all; i += 4) {
      if (pixels.data[i] === r &&
          pixels.data[i+1] === g &&
          pixels.data[i+2] === b) {
        amount++;
      }
    }
    return amount;
  }

  function paint(x, y) {
    var rx = x - xoffset;
    var ry = y - yoffset;
    var colour = pixelcolour(x, y);
    if( colour.r === 0 && colour.g === 0 && colour.b === 0) {
      showerror();
    } else {
      cx.beginPath();
      if (oldx > 0 && oldy > 0) {
        cx.moveTo(oldx, oldy);
      }
      cx.lineTo(rx, ry);
      cx.stroke();
      cx.closePath();
      oldx = rx;
      oldy = ry;
    }
  }

  function pixelcolour(x, y) {
    var index = ((y * (pixels.width * 4)) + (x * 4));
    return {
      r:pixels.data[index],
      g:pixels.data[index + 1],
      b:pixels.data[index + 2],
      a:pixels.data[index + 3]
    };
  }

  function pixelthreshold() {
    if (state !== 'error') {
      if (getpixelamount(
        paintcolour[0],
        paintcolour[1],
        paintcolour[2]
      ) / letterpixels > 0.35) {
       setstate('win');
       if (sound) {
         winsound.play();
       }
      }
    }
  }

  /* Mouse event listeners */

  function onmouseup(ev) {
    ev.preventDefault();
    oldx = 0;
    oldy = 0;
    mousedown = false;
    pixelthreshold();
  }
  function onmousedown(ev) {
    ev.preventDefault();
    mousedown = true;
  }
  function onmousemove(ev) {
    ev.preventDefault();
    if (mousedown) {
      paint(ev.clientX, ev.clientY);
      ev.preventDefault();
    }
  }

  /* Touch event listeners */

  function ontouchstart(ev) {
    touched = true;
  }
  function ontouchend(ev) {
    touched = false;
    oldx = 0;
    oldy = 0;
    pixelthreshold();
  }
  function ontouchmove(ev) {
    if (touched) {
      paint(
        ev.changedTouches[0].pageX,
        ev.changedTouches[0].pageY
      );
      ev.preventDefault();
    }
  }
  function showWords(){
    window.location.href = "list.html";
  }

  /* Button event handlers */

  //errorbutton.addEventListener('click', retry, false);
  soundbutton.addEventListener('click', togglesound, false);
  scorebutton.addEventListener('click', showWords, false);
  //reloadbutton.addEventListener('click', cancel, false);
  //winbutton.addEventListener('click', winner, false);
  //startbutton.addEventListener('click', start, false);

  mainbutton.addEventListener('click', eventmainbuttonhandler, false);

  /* Canvas event handlers */

  c.addEventListener('mouseup', onmouseup, false);
  c.addEventListener('mousedown', onmousedown, false);
  c.addEventListener('mousemove', onmousemove, false);
  c.addEventListener('touchstart', ontouchstart, false);
  c.addEventListener('touchend', ontouchend, false);
  c.addEventListener('touchmove', ontouchmove, false);

  window.addEventListener('load',init, false);
  window.addEventListener('resize',init, false);

  /* Cache update ready? Reload the page! */
  var cache = window.applicationCache;
  function refresh() {
    if (cache.status === cache.UPDATEREADY) {
     cache.swapCache();
     window.location.reload();
    }
  }
  cache.addEventListener('updateready', refresh, false);

  window.run_cancel = cancel;
  window.run_winner = winner;
  window.run_start = start;
  window.run_retry = retry;
})();
