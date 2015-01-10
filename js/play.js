var files = [];
var curidx = 0;

var msgs = ['', '', '', '', ''];

function set_msg(str) {
    msgs[0] = msgs[1];
    msgs[1] = msgs[2];
    msgs[2] = msgs[3];
    msgs[3] = msgs[4];
    msgs[4] = str;
    document.getElementById('msg1').firstChild.nodeValue = msgs[0];
    document.getElementById('msg2').firstChild.nodeValue = msgs[1];
    document.getElementById('msg3').firstChild.nodeValue = msgs[2];
    document.getElementById('msg4').firstChild.nodeValue = msgs[3];
    document.getElementById('msg5').firstChild.nodeValue = msgs[4];
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

function play() {
    var audio = document.getElementById('audio');
    audio.play();
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

/*
function a(obj)
{
    set_msg('a: ' + obj);
}

// navigator.mozSetMessageHandler('bluetooth-pairedstatuschanged', a);
// navigator.mozSetMessageHandler('headset-button', a);
// navigator.mozSetMessageHandler('notification', a);
*/

function play_on_click(id) {
    var mid = id;
    return function() {
	curidx = mid;
	play_cur();
    }
}

/*
 * ul: <ul>ノード
 * prefix: /.../ の文字列
 * idx: files[idx]
 */

function make_select_screen_iter(ul, prefix, idx)
{
    set_msg('make_select_screen_iter: 0');
    while (idx < files.length) {
	set_msg('make_select_screen_iter: idx=' + idx);
	
	if (files[idx].name.lastIndexOf(prefix, 0) != 0)	// if startsWith(prefix)
	    return idx;
	set_msg('make_select_screen_iter: prefix matches.');
	
	var slash = files[idx].name.indexOf('/', prefix.length);
	set_msg('make_select_screen_iter: slash=' + slash);
	if (slash == -1) {
	    // これ以上 '/' がない。
	    set_msg('make_select_screen_iter: 1');
	    
	    var li = document.createElement("li");
	    ul.appendChild(li);
	    
	    var a = document.createElement("a");
	    li.appendChild(a);
	    a.addEventListener('click', play_on_click(idx));
	    
	    var fname = document.createTextNode(files[idx].name.substring(prefix.length));
	    a.appendChild(fname);
	    
	    var br1 = document.createElement("br");
	    a.appendChild(br1);
	    
	    var title = document.createTextNode('title');
	    a.appendChild(title);
	    
	    var br2 = document.createElement("br");
	    a.appendChild(br2);
	    
	    var artist = document.createTextNode('artist');
	    a.appendChild(artist);
	    
	    idx++;
	    set_msg('make_select_screen_iter: 2');
	} else {
	    // '/' を発見。
	    set_msg('make_select_screen_iter: 3');
	    
	    var new_pfx = files[idx].name.substring(0, slash + 1);
	    
	    var li = document.createElement("li");
	    ul.appendChild(li);
	    
	    var txt = document.createTextNode(files[idx].name.slice(prefix.length, new_pfx.length - 1));
	    li.appendChild(txt);
	    
	    var new_ul = document.createElement("ul");
	    ul.appendChild(new_ul);
	    idx = make_select_screen_iter(new_ul, new_pfx, idx);
	    set_msg('make_select_screen_iter: 4');
	}
	set_msg('make_select_screen_iter: 5');
    }
}

function make_select_screen() {
    set_msg('make_select_screen: start.');
    var ul = document.getElementsByTagName("ul")[0];
    make_select_screen_iter(ul, '/sdcard/Music/', 0);
    set_msg('make_select_screen: done.');
}

window.onload = function() {
    set_msg('a2dp set 1');
    var bt = window.navigator.mozBluetooth;
    set_msg('a2dp set 2 ' + bt);
    var r = bt.getDefaultAdapter();
    set_msg('a2dp set 3');
    r.onsuccess = function() {
	set_msg('a2dp. success.1');
	// 反応する時としない時がある。条件不明。
	this.result.addEventListener('a2dpstatuschanged', function(ev) {
	    set_msg('a2dp: ' + ev.address + ', ' + ev.status);
	    if (ev.status) {
		play();
	    } else {
		pause();
	    }
	    return true;
	});
	this.result.addEventListener('devicefound', function(o) {
	    set_msg('dev found: ' + o);
	    return true;
	});
	this.result.addEventListener('hfpstatuschanged', function(o) {
	    set_msg('hfp: ' + o);
	    return true;
	});
	this.result.addEventListener('pairedstatuschanged', function(o) {
	    set_msg('pair: ' + o);
	    return true;
	});
	this.result.addEventListener('requestmediaplaystatus', function(o) {
	    set_msg('media: ' + o);
	    return true;
	});
	this.result.addEventListener('scostatuschanged', function(o) {
	    set_msg('sco: ' + o);
	    return true;
	});
	set_msg('a2dp. success.4');
    };
    set_msg('a2dp set 4');
    r.onerror = function() {
	set_msg('a2dp. error');
    };
    set_msg('a2dp set 5');

    set_msg('onload4');
    var sel = document.getElementById('select')
    set_msg('onload5');
    sel.addEventListener('click', make_select_screen, false);
    set_msg('onload6');
};
