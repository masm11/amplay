var files = [];
var curidx = 0;

function set_msg(str) {
    document.getElementById('msg').firstChild.nodeValue = str;
}

var storage = navigator.getDeviceStorage('music');
var cursor = storage.enumerate();
cursor.onsuccess = function() {
    if (this.result) {
	var file = this.result;
	set_msg(file.name);
	files.push(file);
	this.continue();
    } else {
	set_msg('done.');
//	play_next();
	set_msg('d1.');


var audio_context = new AudioContext();
set_msg('d2.');
var request = new XMLHttpRequest({mozSystem: true});
// var request = new XMLHttpRequest();
set_msg('k1.');
set_msg('k11.' + URL.createObjectURL(files[0]));
// request.open('GET', URL.createObjectURL(files[0]), true);

// var audio = new Audio(URL.createObjectURL(files[0]));
// audio.play();

set_msg('a: ' + document.getElementById('audio'));
document.getElementById('audio').src = window.URL.createObjectURL(files[0]);
// document.getElementById('audio').src = 'sound/doll_st_01.ogg';
set_msg('b: ' + document.getElementById('audio').src);

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
set_msg('k2.');
request.onload = function() {
    set_msg('k6.');
    audio_context.decodeAudioData(request.response,
				  function(buffer) {
				      //
				      set_msg('k8.');
				      var source = audio_context.createBufferSource();
				      set_msg('k9 ' + source);
				      source.buffer = buffer;
				      source.connect(audio_context.destination);
				      source.start(0);
				      //
				  },
				  function(e) {
				      set_msg('decode error.');
				  });
    set_msg('k7.');
}
set_msg('k3.');
request.onerror = function() {
    set_msg('error.');
}
set_msg('k4.');
request.send();
set_msg('k5.');
*/

/*
var audio_context = new AudioContext();
var request = storage.get('/sdcard/Music/rusur/hm04.wav');
// var request = storage.get('/sdcard///Music/rusur/hm04.wav');
set_msg('kita1 ' + request);
request.onsuccess = function() {
    set_msg('kita2');
    var file = this.result;
    set_msg('kita3');
    var data = file.getAsBinary();
    set_msg('kita4');
    set_msg('' + data);

    var source = audio_context.createBufferSource();
    source.buffer = data;
    source.connect(audio_context.destination);
    source.start(0);
};
request.onerror = function() {
    set_msg('' + this.error.name);
};
set_msg('kita5');
*/

    }
}
cursor.onerror = function() {
    document.write('error.');
}

function play_next() {
    if (++curidx >= files.length)
	curidx = 0;
    set_msg('' + files[curidx]);
    audio = new Audio(files[curidx]);
    audio.play();
//    audio.addEventListener('ended', play_next);
    
    var ival = setInterval(function() {
	clearInterval(ival);
	play_next();
    }, 5000);
}

function play_this(e) {
    set_msg('play_this');
    set_msg('' + document.getElementById('file').value);
    
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
    set_msg('onload1');
    pt = document.getElementById('play_this')
    set_msg('onload2');
    pt.addEventListener('click', play_this, false);
    set_msg('onload3');
};
