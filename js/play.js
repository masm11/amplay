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
    set_msg('a: ' + document.getElementById('audio'));
    document.getElementById('audio').src = window.URL.createObjectURL(files[curidx]);
    // document.getElementById('audio').src = 'sound/doll_st_01.ogg';
    set_msg('b: ' + document.getElementById('audio').src);
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

window.onload = function() {
    set_msg('onload1');
    pt = document.getElementById('play_this')
    set_msg('onload2');
    pt.addEventListener('click', play_this, false);
    set_msg('onload3');
};
