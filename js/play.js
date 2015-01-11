var files = [];
var curidx = 0;
var count = 0;
var count2 = 0;

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

function set_scanning_msg() {
    if ((++count & 127) == 0) {
	var msg = '';
	switch (++count2 & 3) {
	case 0:	msg = 'scanning.';	break;
	case 1:	msg = 'scanning..';	break;
	case 2:	msg = 'scanning...';	break;
	case 3:	msg = 'scanning....';	break;
	}
	document.getElementById('scanmsg').firstChild.nodeValue = msg;
    }
}

function screen_step(step)
{
    var div0 = document.getElementById('scanning');
    var div1 = document.getElementById('main');
    var div2 = document.getElementById('list');
    switch (step) {
    case 0:
	div0.style.display = 'block';
	div1.style.display = 'none';
	div2.style.display = 'none';
	break;
    case 1:
	div0.style.display = 'none';
	div1.style.display = 'block';
	div2.style.display = 'none';
	break;
    case 2:
	div0.style.display = 'none';
	div1.style.display = 'none';
	div2.style.display = 'block';
	break;
    }
}

function cmp_files(f1, f2) {
    if (f1.name < f2.name)
	return -1;
    if (f1.name > f2.name)
	return 1;
    return 0;
}

var storage = navigator.getDeviceStorage('music');
var cursor = storage.enumerate();
cursor.onsuccess = function() {
    if (this.result) {
	var file = this.result;
	set_scanning_msg();
	files.push(file);
	this.continue();
    } else {
	set_msg('sort');
	files.sort(cmp_files);
	set_msg('done.');
//	play_cur();
	
	screen_step(1);
    }
}
cursor.onerror = function() {
    document.write('error.');
}

/* curidx を local storage に保存。
 */
function save_cur() {
    localStorage.setItem('curidx', '' + curidx);
}

/* curidx を local storage から読み出す。
 */
function restore_cur() {
    var idx = localStorage.getItem('curidx');
    if (idx)
	curidx = idx * 1;	// "*1": 数値に変換
}

restore_cur();

/* そのまま再生。
 */
function play() {
    var audio = document.getElementById('audio');
    audio.play();
}

/* curidx で示される曲を最初から再生。
 */
function play_cur() {
    var audio = document.getElementById('audio');
    set_msg('' + audio);
    audio.src = window.URL.createObjectURL(files[curidx]);
    set_msg('' + audio.src);
    audio.play();
    audio.addEventListener('ended', play_next);
    
    save_cur();
}

/* 前の曲を再生。
 */
function play_prev() {
    if (--curidx < 0)
	curidx = files.length - 1;
    play_cur();
}

/* 次の曲を再生。
 */
function play_next() {
    if (++curidx >= files.length)
	curidx = 0;
    play_cur();
}

/* 一時停止
 */
function pause() {
set_msg('stop1');
    var audio = document.getElementById('audio');
set_msg('stop2');
    audio.pause();
set_msg('stop3');
}

var radio = navigator.mozFMRadio;

/* イヤホン挿抜で再生/停止。
 */
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

/* 曲リストからファイルを選択すると、再生開始して
 * 画面を main に戻す。
 */
function play_on_click(id) {
    var mid = id;
    return function() {
	curidx = mid;
	play_cur();
	screen_step(1);
    }
}

/* 曲リストからディレクトリを選択すると、
 * そのディレクトリを展開/省略する。
 */
function expand_or_coarse_on_click(div) {
    var this_div = div;
    return function() {
	if (this_div.style.display == 'none') {
	    this_div.style.display = 'block';
	} else {
	    this_div.style.display = 'none';
	}
    }
}

/*
 * parent: <div>ノード or <ul> ノード
 * prefix: /.../ の文字列
 * idx: files[idx]
 */

function make_select_screen_iter(parent, prefix, idx)
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
	    parent.appendChild(li);
	    
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
	    
	    /* 以下のような感じに作る。
	     * <li> <a onclick="expand_or_coarse_on_click('new_div')"> directory name </a>
	     * <ul>
	     *   <div id="new_div" style="display: none">
	     *   </div>
	     * </ul>
	     */
	    
	    var new_pfx = files[idx].name.substring(0, slash + 1);
	    
	    var li = document.createElement("li");
	    parent.appendChild(li);
	    
	    var a = document.createElement("a");
	    li.appendChild(a);
	    
	    var txt = document.createTextNode(files[idx].name.slice(prefix.length, new_pfx.length - 1));
	    a.appendChild(txt);
	    
	    var new_ul = document.createElement("ul");
	    parent.appendChild(new_ul);
	    
	    var new_div = document.createElement("div");
	    new_ul.appendChild(new_div);
	    new_div.style.display = 'none';
	    a.addEventListener('click',
			       expand_or_coarse_on_click(new_div));
	    
	    idx = make_select_screen_iter(new_div, new_pfx, idx);
	    set_msg('make_select_screen_iter: 4');
	}
	set_msg('make_select_screen_iter: 5');
    }
}

/* 曲選択画面を作る。
 */
function make_select_screen() {
    set_msg('make_select_screen: start.');
    var ul = document.getElementsByTagName("ul")[0];
    make_select_screen_iter(ul, '/sdcard/Music/', 0);
    screen_step(2);
    set_msg('make_select_screen: done.');
}

window.onload = function() {
    set_msg('onload0');
    var sel = document.getElementById('prev')
    set_msg('onload1');
    sel.addEventListener('click', play_prev, false);
    set_msg('onload2');
    
    set_msg('onload3');
    var sel = document.getElementById('next')
    set_msg('onload4');
    sel.addEventListener('click', play_next, false);
    set_msg('onload5');
    
    set_msg('onload6');
    var sel = document.getElementById('select')
    set_msg('onload7');
    sel.addEventListener('click', make_select_screen, false);
    set_msg('onload8');
};
