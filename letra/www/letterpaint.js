var game_data = {
    "test":game_data_test,
    "sentence":game_data_sentance,
    "words":game_data_words,
    "alphabet": game_data_alphabet,
    "numbers": game_data_numbers
};

var characters = {
  "A":{"lifts":3, "threshold":0.9},
  "a":{"lifts":2, "threshold":0.5},
  "Á":{"lifts":4, "threshold":0.55},
  "f":{"lifts":2, "threshold":0.45},
  "i":{"lifts":2, "threshold":0.45},
  "Í":{"lifts":2, "threshold":0.45},
  "í":{"lifts":2, "threshold":0.45},
  "s":{"threshold":0.5}, "S":{"threshold":0.5}
};

(function(){

  var color_blue = "#2c3e50"; /* 44, 62, 80 */
  var color_red = "#FA4252"; /* 240, 96, 80 */
  var color_orange = "#EF9033"; /* 239, 144, 51 */
  var color_yellow = "#F7CD1F";/* 247, 205, 31 */
  var color_black = "#415C71"; /* 65, 92, 113 */

  /* Get container elements */
  var container = document.querySelector('#container');

  /* Get buttons */
  //var startbutton = document.querySelector('#intro button');
  var infobutton = document.querySelector('#infos');
  var installbutton = document.querySelector('#install');
  var mainbutton = document.querySelector('.mainbutton');
  var characterbutton = document.querySelector('#character');
  //var winbutton = document.querySelector('#win button');
  //var reloadbutton = document.querySelector('#reload');

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
  var textcolour = [249, 66, 82];  //red
  var xoffset = 0;
  var yoffset = 0;
  var linewidth = 10;//20
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
  var offset_delta_y = 0;

  /* Overall game presets */
  var draw_lift = 0;
  var state = 'intro';
  var sound = getSetup("sound");
  var level = getSetup("level");
  var currentstate;
  var charscontainer = "";

  if(level == "sentance"){
    $("#words").css("font-size", "60px");
  }else{
    $("#words").css("font-size", "90px");
  }

  function showWord(){
    draw_lift = 0;
    if(!game_data[level][wordindex]){ wordindex = 0; }
    charscontainer = game_data[level][wordindex].split("");
    document.querySelector('#words').innerHTML = charscontainer;
    wordindex = wordindex + 1;
  }

  function init() {
    showWord();
    xoffset = container.offsetLeft;
    yoffset = container.offsetTop;
    fontsize = container.offsetHeight / 1.5;
    linewidth = container.offsetHeight / 25; //19, 20
    paintletter();
    setstate('intro');
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
  function setstate(newstate, detail) {
    state = newstate;
    //container.className = newstate;
    window.get_state = currentsate = state;
    speak(newstate, detail);
  }

  function eventmainbuttonhandler(){
    if(currentsate == "intro"){start(); return;}
    if(currentsate == "win"){winner(); return;}
    if(currentsate == "error"){retry(); return;}
    if(currentsate == "play"){cancel(); return;}
  }

  window.score = JSON.parse(localStorage.getItem("score") || '{}');
  function setScore(attr, value){
    var word = charscontainer.join("");
    if (!score[level]){ score[level] = {}; }
    if (!score[level][word]){score[level][word] = {};}
    if (!score[level][word][attr]){score[level][word][attr] = 0;}
    score[level][word][attr] = score[level][word][attr] + 1;
    localStorage.setItem("score", JSON.stringify(score));
  }

  function speak(newstate, detail){
    if(newstate == "intro"){
      $("#character").html('<img src="images/Letra_kall_2.png" width="100%">').show();
      $("#character").show();
    }
    if(newstate == "play"){
      $("#character").html("");
      $("#character").hide();
    }
    if(newstate == "win"){
      //say("Vel gert!");
      $("#character").html('<img src="images/Velgert.gif" width="100%">').show();
    }
    if(newstate == "error"){
      $("#character").html('<img src="images/Letra_kall_1.png" width="100%">').show();
      if (detail == "lifts"){
        //say("Þú ættir að búa til fleira linur!");
      }else{
        //say("Þú teiknaðir fyrir utan stafinn!");
      }
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
    offset_delta_y = 0;
    chars_letterindex = chars[letterindex];
    if((chars_letterindex == "g") || (chars_letterindex == "j") || (chars_letterindex == "p") || (chars_letterindex == "y") || (chars_letterindex == "ý") || (chars_letterindex == "þ")){
      offset_delta_y = 130;
    }
    if(chars[letterindex] == " "){
      if(chars.length > letterindex){
        return getLetter();
      }
    }
    return chars[letterindex];
  }
  function paintletter(retryletter) {
    setScore("count");
    letter = retryletter || getLetter();
    if(!letterdrawn[letter]){letterdrawn[letter] = true;}
    c.width = container.offsetWidth;
    c.height = container.offsetHeight;
    cx.font = 'bold ' + fontsize + 'px Delius';
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
      (c.height / 1.3)-offset_delta_y
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
                charsdisplayed = charsdisplayed + "<b>" + chars[i] + "</b>";
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
      var pixel_amount = 0.80;
      var draw_lifts = 0;
      if (characters[letter]){
        if(characters[letter]["threshold"]){
          pixel_amount = characters[letter]["threshold"];
        }
        if(characters[letter]["lifts"]){
          draw_lifts = characters[letter]["lifts"];
        }
      }
      var pixel_percentage = getpixelamount(
        paintcolour[0],
        paintcolour[1],
        paintcolour[2]
      ) / letterpixels;
      console.info("Pixel " + pixel_percentage);
      if (pixel_percentage > pixel_amount) {
        if ((draw_lift+1) < draw_lifts){
          setstate('error', 'lifts');
        }else{
          setstate('win');
          if (sound) {
            winsound.play();
          }
        }
      }
    }
  }

  function addDraws(){
    draw_lift = draw_lift + 1;
    console.info("Draws" + draw_lift);
  }

  /* Mouse event listeners */

  function onmouseup(ev) {
    ev.preventDefault();
    oldx = 0;
    oldy = 0;
    mousedown = false;
    pixelthreshold();
    addDraws();
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
    addDraws();
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

  /* Button event handlers */
  var scorebutton = document.querySelector('#score');
  var setupbutton = document.querySelector('#setup');
  var homebutton = document.querySelector('#home');
  homebutton.addEventListener('click', function(){window.location.href = "index.html";}, false);
  scorebutton.addEventListener('click', function(){window.location.href = "list.html";}, false);
  setupbutton.addEventListener('click', function(){window.location.href = "setup.html";}, false);

  mainbutton.addEventListener('click', eventmainbuttonhandler, false);
  characterbutton.addEventListener('click', eventmainbuttonhandler, false);

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
  window.get_draws = draw_lift;
})();
