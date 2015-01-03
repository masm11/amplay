var files = [];
var curidx = 0;

var storage = navigator.getDeviceStorage('music');
var cursor = storage.enumerate();
cursor.onsuccess = function() {
    if (this.result) {
	var file = this.result;
	document.getElementById('msg').firstChild.nodeValue = file.name;
//	files.push(file.name);
	files.push(file);
	this.continue();
    } else {
	document.getElementById('msg').firstChild.nodeValue = 'done.';
//	play_next();
document.getElementById('msg').firstChild.nodeValue = 'd1.';


var audio_context = new AudioContext();
document.getElementById('msg').firstChild.nodeValue = 'd2.';
var request = new XMLHttpRequest({mozSystem: true});
// var request = new XMLHttpRequest();
document.getElementById('msg').firstChild.nodeValue = 'k1.';
document.getElementById('msg').firstChild.nodeValue = 'k11.' + URL.createObjectURL(files[0]);
// request.open('GET', URL.createObjectURL(files[0]), true);

// var audio = new Audio(URL.createObjectURL(files[0]));
// audio.play();

document.getElementById('msg').firstChild.nodeValue = 'a: ' + document.getElementById('audio');
document.getElementById('audio').src = window.URL.createObjectURL(files[0]);
// document.getElementById('audio').src = 'sound/doll_st_01.ogg';
document.getElementById('msg').firstChild.nodeValue = 'b: ' + document.getElementById('audio').src;

/*
// request.open('GET', '/sdcard/Music/rusur/hm04.wav', true);
// request.open('GET', '/sdcard///Music/rusur/hm04.wav', true);
// request.open('GET', '/Music/rusur/haji.ogg', true);
// request.open('GET', '///Music/rusur/haji.ogg', true);
// request.open('GET', '/', true);
// request.open('GET', 'rusur/haji.ogg', true);
// request.open('GET', '/rusur/haji.ogg', true);
// request.open('GET', 'sound/doll_st_01.ogg', true);
request.responseType = 'arraybuffer';
document.getElementById('msg').firstChild.nodeValue = 'k2.';
request.onload = function() {
    document.getElementById('msg').firstChild.nodeValue = 'k6.';
    audio_context.decodeAudioData(request.response,
				  function(buffer) {
				      //
				      document.getElementById('msg').firstChild.nodeValue = 'k8.';
				      var source = audio_context.createBufferSource();
				      document.getElementById('msg').firstChild.nodeValue = 'k9 ' + source;
				      source.buffer = buffer;
				      source.connect(audio_context.destination);
				      source.start(0);
				      //
				  },
				  function(e) {
				      document.getElementById('msg').firstChild.nodeValue = 'decode error.';
				  });
    document.getElementById('msg').firstChild.nodeValue = 'k7.';
}
document.getElementById('msg').firstChild.nodeValue = 'k3.';
request.onerror = function() {
    document.getElementById('msg').firstChild.nodeValue = 'error.';
}
document.getElementById('msg').firstChild.nodeValue = 'k4.';
request.send();
document.getElementById('msg').firstChild.nodeValue = 'k5.';
*/

/*
var audio_context = new AudioContext();
var request = storage.get('/sdcard/Music/rusur/hm04.wav');
// var request = storage.get('/sdcard///Music/rusur/hm04.wav');
document.getElementById('msg').firstChild.nodeValue = 'kita1 ' + request;
request.onsuccess = function() {
    document.getElementById('msg').firstChild.nodeValue = 'kita2';
    var file = this.result;
    document.getElementById('msg').firstChild.nodeValue = 'kita3';
    var data = file.getAsBinary();
    document.getElementById('msg').firstChild.nodeValue = 'kita4';
    document.getElementById('msg').firstChild.nodeValue = '' + data;

    var source = audio_context.createBufferSource();
    source.buffer = data;
    source.connect(audio_context.destination);
    source.start(0);
};
request.onerror = function() {
    document.getElementById('msg').firstChild.nodeValue = '' + this.error.name;
};
document.getElementById('msg').firstChild.nodeValue = 'kita5';
*/

    }
}
cursor.onerror = function() {
    document.write('error.');
}

function play_next() {
    if (++curidx >= files.length)
	curidx = 0;
    document.getElementById('msg').firstChild.nodeValue = '' + files[curidx];
    audio = new Audio(files[curidx]);
    audio.play();
//    audio.addEventListener('ended', play_next);
    
    var ival = setInterval(function() {
	clearInterval(ival);
	play_next();
    }, 5000);
}

function play_this(e) {
    document.getElementById('msg').firstChild.nodeValue = 'play_this';
    document.getElementById('msg').firstChild.nodeValue = '' + document.getElementById('file').value;
    
    e.preventDefault();
}

/*
files = [
    '/sdcard///Music/rusur/hm04.wav',
    '///Music/rusur/hm04.wav',
    '/Music/rusur/hm04.wav',
    'Music/rusur/hm04.wav',
    '/rusur/hm04.wav',
    'rusur/hm04.wav',
];
*/

/*
window.onload = function() {
    curidx = -1;
    play_next();
};
*/

// play_next();

window.onload = function() {
    document.getElementById('msg').firstChild.nodeValue = 'onload1';
    pt = document.getElementById('play_this')
    document.getElementById('msg').firstChild.nodeValue = 'onload2';
    pt.addEventListener('click', play_this, false);
    document.getElementById('msg').firstChild.nodeValue = 'onload3';
};
