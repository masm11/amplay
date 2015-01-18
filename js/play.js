var files = [];
var curidx = 0;
var audio;

var playing = false;

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

/* 場面に応じた画面を表示する。
 */
function screen_step(step)
{
    var div0 = document.getElementById('scanning');
    var div1 = document.getElementById('main');
    var div2 = document.getElementById('list');
    var div3 = document.getElementById('control');
    switch (step) {
    case 0:
	div0.style.display = 'block';
	div1.style.display = 'none';
	div2.style.display = 'none';
	div3.style.display = 'none';
	break;
    case 1:
	div0.style.display = 'none';
	div1.style.display = 'block';
	div2.style.display = 'none';
	div3.style.display = 'block';
	break;
    case 2:
	div0.style.display = 'none';
	div1.style.display = 'none';
	div2.style.display = 'block';
	div3.style.display = 'block';
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
    audio.play();
    playing = true;
}

/* curidx で示される曲を最初から再生。
 */
function play_cur() {
    if (files.length <= 0) {
	set_msg('No audio files.');
	alert('No audio files.');
	return;
    }
    
    if (curidx < 0 || curidx >= files.length) {
	set_msg('No such idx.' + curidx);
	curidx = 0;
    }
    
    set_msg('' + audio);
    audio.src = window.URL.createObjectURL(files[curidx]);
    set_msg('' + audio.src);
    audio.play();
    playing = true;
    audio.addEventListener('ended', play_next);
    
    save_cur();
}

function play_seek() {
    set_msg('play_seek: 0');
    
    set_msg('play_seek: 1: ' + this.value);
    audio.currentTime = this.value;
}

/* 前の曲を再生。
 */
function play_prev() {
    if (audio.currentTime < 3) {
	if (--curidx < 0)
	    curidx = files.length - 1;
	play_cur();
    } else {
	audio.currentTime = 0;
    }
}

/* 次の曲を再生。
 */
function play_next() {
    if (++curidx >= files.length)
	curidx = 0;
    play_cur();
}

function mrc_play() {
    set_msg('mrc play');
}

function mrc_pause() {
    set_msg('mrc pause');
}

function mrc_playpause() {
    set_msg('mrc playpause');
}

function mrc_updateplaystatus(e) {
    set_msg('mrc updateplaystatus: ' + e.detail['command']);
    if (playing)
	pause();
    else
	play();
}

function mrc_updatemetadata(e) {
    set_msg('mrc updatemetadata: ' + e.detail['command']);
    if (playing)
	pause();
}

/* 一時停止
 */
function pause() {
set_msg('stop1');
set_msg('stop2');
    audio.pause();
    playing = false;
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
 * 画面を main に戻す。…ような関数を返す。
 * closure を使ってるので、ちょっと解りにくい。
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

function got_metadata(audio, title_node, artist_node)
{
    var a = audio;
    var title = title_node;
    var artist = artist_node;
    return function() {
	var meta = a.mozGetMetadata();
	title.nodeValue = (meta.TITLE || '不明なタイトル');
	artist.nodeValue = (meta.ARTIST || '不明なアーティスト');
	
	idx++;
	setTimeout(make_select_screen_iter_file, 1);
    }
}

var parents = [];
var idxs = [];
var fnames = [];
var idx = 0;

function make_select_screen_iter_file() {
    if (idx >= parents.length) {
	document.getElementById('eject').style.display = 'block';
	document.getElementById('spinner').style.display = 'none';
	return;
    }
    
    var li = document.createElement("li");
    parents[idx].appendChild(li);
    
    var a = document.createElement("a");
    li.appendChild(a);
    a.addEventListener('click', play_on_click(idxs[idx]));
    
    var fname_span = document.createElement('span');
    fname_span.style.fontSize = '1rem';
    fname_span.style.color = '#000080';
    a.appendChild(fname_span);
    var fname = document.createTextNode(fnames[idx]);
    fname_span.appendChild(fname);
    
    var br1 = document.createElement("br");
    a.appendChild(br1);
    
    var title = document.createTextNode('title');
    a.appendChild(title);
    
    var br2 = document.createElement("br");
    a.appendChild(br2);
    
    var artist_span = document.createElement('span');
    artist_span.style.fontSize = '1rem';
    artist_span.style.color = '#808080';
    a.appendChild(artist_span);
    var artist = document.createTextNode('artist');
    artist_span.appendChild(artist);
    
    if (files[idxs[idx]].name.indexOf('.wav', 0) >= 0) {
	// イベントが飛んでこない...
	title.nodeValue = '不明なタイトル';
	artist.nodeValue = '不明なアーティスト';
	
	idx++;
	make_select_screen_iter_file();
    } else {
	var tempaudio = new Audio(window.URL.createObjectURL(files[idxs[idx]]));
	tempaudio.preload = 'metadata';
	tempaudio.addEventListener('loadedmetadata', got_metadata(tempaudio, title, artist));
    }
}

/*
 * parent: <div>ノード or <ul> ノード
 * prefix: /.../ の文字列
 * idx: files[idx]
 */
function make_select_screen_iter(parent, prefix, idx)
{
    while (idx < files.length) {
	if (files[idx].name.lastIndexOf(prefix, 0) != 0)	// if startsWith(prefix)
	    return idx;
	
	var slash = files[idx].name.indexOf('/', prefix.length);
	if (slash == -1) {
	    // これ以上 '/' がない。
	    
	    parents.push(parent);
	    idxs.push(idx);
	    fnames.push(files[idx].name.substring(prefix.length));
	    
	    idx++;
	} else {
	    // '/' を発見。
	    
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
	}
    }
}

/* 曲選択画面を作る。
 */
function make_select_screen() {
    set_msg('make_select_screen: start.');
    set_msg('make_select_screen: 0.');
    
    // 削除
    var list = document.getElementById('list');
    set_msg('make_select_screen: 1.');
    var ul = list.getElementsByTagName('ul');
    set_msg('make_select_screen: 2.');
    if (ul && ul[0])
	list.removeChild(ul[0]);
    set_msg('make_select_screen: 3.');
    
    // 作成
    parents = [];
    idxs = [];
    idx = 0;
    ul = document.createElement("ul");
    make_select_screen_iter(ul, '/sdcard/Music/', 0);
    document.getElementById("list").appendChild(ul);
    
//    screen_step(2);
    
    make_select_screen_iter_file();
    set_msg('make_select_screen: done.');
}

function select_screen() {
    screen_step(2);
}

/* 曲選択画面から戻る。
 */
function cancel_select_screen() {
    set_msg('cancel_select_screen: start.');
    screen_step(1);
    set_msg('cancel_select_screen: done.');
}

window.onload = function() {
    set_msg('onload0');
    var seekbar = document.getElementById('seekbar');
    set_msg('onload1');
    seekbar.addEventListener('change', play_seek, false);
    set_msg('onload2');

    audio = new Audio();
    audio.mozAudioChannelType = 'content';
    audio.addEventListener('timeupdate', function() {
	seekbar.value = audio.currentTime;
    });
    audio.addEventListener('loadedmetadata', function() {
	seekbar.max = audio.duration;
	set_msg('metadata loaded.');
	var meta = audio.mozGetMetadata();
	set_msg('metadata.' + meta);
	set_msg('metadata.keys=' + Object.keys(meta));
	document.getElementById('title').firstChild.nodeValue = (meta.TITLE || '不明なタイトル');
	document.getElementById('artist').firstChild.nodeValue = (meta.ARTIST || '不明なアーティスト');
    });
    
    set_msg('onload0');
    var sel = document.getElementById('prev')
    set_msg('onload1');
    sel.addEventListener('click', play_prev, false);
    set_msg('onload2');
    
    set_msg('onload0');
    var sel = document.getElementById('play')
    set_msg('onload1');
    sel.addEventListener('click', play, false);
    set_msg('onload2');
    
    set_msg('onload0');
    var sel = document.getElementById('pause')
    set_msg('onload1');
    sel.addEventListener('click', pause, false);
    set_msg('onload2');
    
    set_msg('onload3');
    var sel = document.getElementById('next')
    set_msg('onload4');
    sel.addEventListener('click', play_next, false);
    set_msg('onload5');
    
    set_msg('onload6');
    var sel = document.getElementById('select')
    set_msg('onload7');
    sel.addEventListener('click', select_screen, false);
    set_msg('onload8');
    
    set_msg('onload9');
    var sel = document.getElementById('select_cancel')
    set_msg('onload10');
    sel.addEventListener('click', cancel_select_screen, false);
    set_msg('onload11');
    
    var mrc = new MediaRemoteControls();
    set_msg('onload12');
    mrc.addCommandListener('play', mrc_play);
    mrc.addCommandListener('pause', mrc_pause);
    mrc.addCommandListener('playpause', mrc_playpause);
    mrc.addCommandListener('updateplaystatus', mrc_updateplaystatus);
    mrc.addCommandListener('updatemetadata', mrc_updatemetadata);
    mrc.start();
    set_msg('onload13');

    if (storage) {
	var cursor = storage.enumerate();
	cursor.onsuccess = function() {
	    if (this.result) {
		var file = this.result;
		files.push(file);
		this.continue();
	    } else {
		set_msg('sort');
		files.sort(cmp_files);
		set_msg('done.');
		
		// audio の src をセット
		play_cur();
		pause();
		
		screen_step(1);

		make_select_screen();
	    }
	}
	cursor.onerror = function() {
	    set_msg('enumerate error.');
	    alert('enumerate error.');
	}
    } else {
	set_msg('No music storage.');
	alert('No music storage.');
    }
};
