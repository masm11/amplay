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
	curidx = 0;
	play_cur();
    }
}
cursor.onerror = function() {
    document.write('error.');
}

function play_cur() {
    var audio = document.getElementById('audio');
    set_msg('a: ' + audio);
    audio.src = window.URL.createObjectURL(files[curidx]);
    // audio.src = 'sound/doll_st_01.ogg';
    set_msg('b: ' + audio.src);
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
    set_msg('' + document.getElementById('file').value);
    
    e.preventDefault();
}

window.onload = function() {
    set_msg('onload1');
    pt = document.getElementById('play_this')
    set_msg('onload2');
    pt.addEventListener('click', play_this, false);
    set_msg('onload3');
};
