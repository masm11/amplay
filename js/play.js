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
	// set_msg(file.name);
	files.push(file);
	this.continue();
    } else {
	set_msg('done.');
	curidx = 0;
	play_cur();
    }
}
cursor.onerror = function() {
    document.write('error.');
}

function play_cur() {
    var audio = document.getElementById('audio');
    set_msg('' + audio);
    audio.src = window.URL.createObjectURL(files[curidx]);
    set_msg('' + audio.src);
    audio.play();
    audio.addEventListener('ended', play_next);
}

function play_next() {
    if (++curidx >= files.length)
	curidx = 0;
    play_cur();
}

function play_this(e) {
    set_msg('play_this');
    curidx++;
    
    filelist = document.getElementById('file').files;
    set_msg('' + filelist[0].name);
    
    for (var i = 0; i < files.length; i++) {
	var fn = files[i].name.substring(files[i].name.lastIndexOf('/') + 1);
	if (fn == filelist[0].name) {
	    curidx = i;
	    break;
	}
    }
    
    play_cur();
    
    e.preventDefault();
}

function pause() {
set_msg('stop1');
    var audio = document.getElementById('audio');
set_msg('stop2');
    audio.pause();
set_msg('stop3');
}

var radio = navigator.mozFMRadio;

function play_or_stop() {
set_msg('r1');
    if (radio.antennaAvailable) {
set_msg('r2');
	play_cur();
set_msg('r3');
    } else {
set_msg('r4');
	pause();
set_msg('r5');
    }
}

radio.addEventListener('antennaavailablechange', play_or_stop);

window.onload = function() {
    set_msg('onload1');
    pt = document.getElementById('play_this')
    set_msg('onload2');
    pt.addEventListener('click', play_this, false);
    set_msg('onload3');
};
