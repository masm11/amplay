var files = [];
var curidx = -1;

var cur_begtime = 0;
var cur_endtime = 0;
var cur_buf;
var cur_src;
var cur_idx = -1;
var next_begtime = 0;
var next_endtime = 0;
var next_buf;
var next_src;
var next_idx = -1;

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
function screen_change() {
    var div0 = document.getElementById('scanning');
    var div1 = document.getElementById('main');
    var div2 = document.getElementById('list');
    var div3 = document.getElementById('control');
    if (div1.style.display == 'none') {
	div0.style.display = 'none';
	div1.style.display = 'block';
	div2.style.display = 'none';
	div3.style.display = 'block';
    } else {
	div0.style.display = 'none';
	div1.style.display = 'none';
	div2.style.display = 'block';
	div3.style.display = 'block';
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
    localStorage.setItem('cur_idx', '' + cur_idx);
}

/* curidx を local storage から読み出す。
 */
function restore_cur() {
    var idx = localStorage.getItem('cur_idx');
    if (idx)
	cur_idx = idx * 1;	// "*1": 数値に変換
    else
	cur_idx = 0;
}

function switch_play_pause_button(pp) {
    if (pp) {
	document.getElementById('eplay').style.display = 'none';
	document.getElementById('epause').style.display = 'block';
    } else {
	document.getElementById('eplay').style.display = 'block';
	document.getElementById('epause').style.display = 'none';
    }
}


var context = new AudioContext('content');
var xhr;
var decoded_buffer;

function loadSound(url) {
    xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    decoded_buffer = undefined;
    
    // Decode asynchronously
    xhr.onload = function() {
	context.decodeAudioData(xhr.response, function(buffer) {
		decoded_buffer = buffer;
	}, function() {
	    alert('decode error.');
	});
	xhr = undefined;
    };
    xhr.onerror = function() {
	alert('xhr.onerror.');
	xhr = undefined;
    };
    xhr.send();
}

function playSound(buffer, begtime) {
    var src = context.createBufferSource();
    src.buffer = buffer;
    src.connect(context.destination);
    src.start(begtime);
    
    playing = true;
    
    return src;
}

function update_playtime() {
    var max = cur_endtime - cur_begtime;
    var cur = context.currentTime - cur_begtime;
    if (isNaN(max))
	max = 0;
    if (isNaN(cur))
	cur = 0;
    max = Math.floor(max);
    cur = Math.floor(cur);
    var maxmin = Math.floor(max / 60);
    var maxsec = max % 60;
    var maxsec10 = Math.floor(maxsec / 10);
    var maxsec01 = maxsec % 10;
    var curmin = Math.floor(cur / 60);
    var cursec = cur % 60;
    var cursec10 = Math.floor(cursec / 10);
    var cursec01 = cursec % 10;
    document.getElementById('time').firstChild.nodeValue =
	'' + curmin + ':' + cursec10 + cursec01 +
	'/' + maxmin + ':' + maxsec10 + maxsec01;
}

var metadata_last_idx = -1;
function update_metadata() {
    if (metadata_last_idx != cur_idx) {
	metadata_last_idx = cur_idx;
	
	var fname = files[cur_idx].name;
	var audio = new Audio(window.URL.createObjectURL(files[cur_idx]));
	audio.addEventListener('loadedmetadata', function() {
	    var meta = audio.mozGetMetadata();
	    var lastslash = fname.lastIndexOf('/');
	    var notdir;
	    if (lastslash >= 0)
		notdir = fname.substring(lastslash + 1);
	    else
		notdir = fname;
	    
	    document.getElementById('filename').firstChild.nodeValue = notdir;
	    document.getElementById('title').firstChild.nodeValue = (meta.TITLE || '不明なタイトル');
	    document.getElementById('artist').firstChild.nodeValue = (meta.ARTIST || '不明なアーティスト');
	});
    }
}

function update_seekbar() {
    var seekbar = document.getElementById('seekbar');
    var max = cur_endtime - cur_begtime;
    var cur = context.currentTime - cur_begtime;
    if (seekbar.max != max)
	seekbar.max = max;
    seekbar.value = cur;
}

var jump_to = 0;
var jump_pressed = false;
var play_pressed = false;
var back_pressed = false;
var forw_pressed = false;
var pause_pressed = false;
var pause_time = 0;

var step = -1;
function timer() {
    update_playtime();
    update_metadata();
    update_seekbar();
    
    switch (step) {
    case -1:
	// storage.enumerate() が終わるまで待つ。
	if (cur_idx >= 0 && play_pressed) {
	    play_pressed = false;
	    step++;
	}
	break;
	
    case 0:
	// 最初の曲の decode を開始
	if (true) {
	    var url = window.URL.createObjectURL(files[cur_idx]);
	    loadSound(url);
	    
	    step++;
	}
	break;
	
    case 1:
	// decode が完了したら再生開始。
	if (decoded_buffer) {
	    cur_begtime = context.currentTime;
	    cur_endtime = cur_begtime + decoded_buffer.duration;
	    cur_buf = decoded_buffer;
	    cur_src = playSound(cur_buf, cur_begtime);
	    // 次の step で cur_xxx = next_xxx とするので、その対策。
	    next_begtime = cur_begtime;
	    next_endtime = cur_endtime;
	    next_buf = cur_buf;
	    next_src = cur_src;
	    next_idx = cur_idx;
	    
	    decoded_buffer = undefined;
	    
	    step++;
	}
	break;
	
    case 2:	// 通常再生中
	if (pause_pressed) {
	    pause_pressed = false;
	    step = 11;
	    break;
	}
	if (forw_pressed) {
	    forw_pressed = false;
	    step = 21;
	    break;
	}
	if (back_pressed) {
	    back_pressed = false;
	    step = 31;
	    break;
	}
	if (jump_pressed) {
	    jump_pressed = false;
	    step = 41;
	    break;
	}
	
	// 次の曲の再生が始まったら、その次の曲をキューイング。
	if (context.currentTime >= next_begtime) {
	    // 次の曲の再生が始まった。
	    cur_begtime = next_begtime;
	    cur_endtime = next_endtime;
	    cur_buf = next_buf;
	    cur_src = next_src;
	    cur_idx = next_idx;

	    next_begtime = 0;
	    next_endtime = 0;
	    next_buf = undefined;
	    next_src = undefined;
	    
	    // 更に次の曲をキューイング処理開始。
	    next_idx = cur_idx + 1;
	    if (next_idx >= files.length)
		next_idx = 0;
	    var url = window.URL.createObjectURL(files[next_idx]);
	    loadSound(url);
	    
	    save_cur();

	    step++;
	}
	break;
	
    case 3:
	if (pause_pressed) {
	    pause_pressed = false;
	    step = 11;
	    break;
	}
	if (forw_pressed) {
	    forw_pressed = false;
	    step = 21;
	    break;
	}
	if (back_pressed) {
	    back_pressed = false;
	    step = 31;
	    break;
	}
	if (jump_pressed) {
	    jump_pressed = false;
	    step = 41;
	    break;
	}
	
	// decode が完了したら再生準備。
	if (decoded_buffer) {
	    next_begtime = cur_endtime;
	    next_endtime = next_begtime + decoded_buffer.duration;
	    next_buf = decoded_buffer;
	    next_src = playSound(next_buf, next_begtime);
	    
	    decoded_buffer = undefined;
	    
	    step--;
	}
	break;
	
    case 4:
	break;

    case 11:	// 一時停止
	// 再生時刻の保存。
	pause_time = context.currentTime - cur_begtime;

	playing = false;
	
	// 再生を止める。
	if (next_src) {
	    next_src.disconnect();
	    next_src = undefined;
	}
	if (cur_src) {
	    cur_src.disconnect();
	    cur_src = undefined;
	}
	step++;
	break;

    case 12:
	if (forw_pressed) {
	    forw_pressed = false;
	    step = 21;
	    break;
	}
	if (back_pressed) {
	    back_pressed = false;
	    step = 31;
	    break;
	}
	
	if (play_pressed) {
	    play_pressed = false;

	    if (cur_buf) {
		cur_src = context.createBufferSource();
		cur_src.buffer = cur_buf;
		cur_src.connect(context.destination);
		cur_src.start(context.currentTime, pause_time);

		cur_begtime = context.currentTime - pause_time;
		cur_endtime = cur_begtime + cur_buf.duration;;
	    }
	    
	    if (next_buf) {
		next_src = context.createBufferSource();
		next_src.buffer = next_buf;
		next_src.connect(context.destination);
		next_begtime = cur_endtime;
		next_endtime = next_begtime + next_buf.duration;
		next_src.start(next_begtime);
	    }
	    
	    step = 2;
	}
	break;

    case 21:	// 頭出し forward
	if (next_src) {
	    next_src.disconnect();
	    next_src = undefined;
	}
	if (cur_src) {
	    cur_src.disconnect();
	    cur_src = undefined;
	}

	if (next_buf) {
	    cur_begtime = context.currentTime;
	    cur_endtime = cur_begtime + next_buf.duration;
	    cur_buf = next_buf;
	    cur_src = playSound(cur_buf, cur_begtime);
	    cur_idx = next_idx;

	    next_begtime = cur_begtime;
	    next_endtime = cur_endtime;
	    next_buf = cur_buf;
	    next_src = cur_src;
	    next_idx = cur_idx;

	    step = 2;
	} else {
	    if (++cur_idx >= files.length)
		cur_idx = 0;
	    step = 0;
	}
	break;

    case 31:	// 頭出し backward
	if (next_src) {
	    next_src.disconnect();
	    next_src = undefined;
	}
	if (cur_src) {
	    cur_src.disconnect();
	    cur_src = undefined;
	}
	if (context.currentTime - cur_begtime < 3) {
	    if (--cur_idx < 0)
		cur_idx = files.length - 1;
	    step = 0;
	} else {
	    cur_begtime = context.currentTime;
	    cur_endtime = cur_begtime + cur_buf.duration;
	    cur_src = playSound(cur_buf, cur_begtime);

	    if (next_buf) {
		next_begtime = cur_endtime;
		next_endtime = next_begtime + next_buf.duration;
		next_src = playSound(next_buf, next_begtime);
	    }
	    
	    step = 2;
	}
	break;

    case 41:	// jump
	if (next_src) {
	    next_src.disconnect();
	    next_src = undefined;
	}
	if (cur_src) {
	    cur_src.disconnect();
	    cur_src = undefined;
	}
	
	cur_idx = jump_to;
	step = 0;
	break;
    }
}

window.setInterval(timer, 100);

function play() {
    play_pressed = true;
    switch_play_pause_button(true);
}

function play_seek() {
    set_msg('play_seek: 1: ' + this.value);
    audio.currentTime = this.value;
}

function play_prev() {
    back_pressed = true;
}

function play_next() {
    forw_pressed = true;
}

function mrc_play() {
    set_msg('mrc play');
    play();
}

function mrc_pause() {
    set_msg('mrc pause');
    pause();
}

function mrc_playpause() {
    set_msg('mrc playpause');
    if (playing)
	pause();
    else
	play();
}

function mrc_next() {
    play_next();
}

function mrc_prev() {
    play_prev();
}

function mrc_updateplaystatus(e) {
    set_msg('mrc updateplaystatus: ' + e.detail['command']);
}

function mrc_updatemetadata(e) {
    set_msg('mrc updatemetadata: ' + e.detail['command']);
    pause();
}

/* 一時停止
 */
function pause() {
    pause_pressed = true;
    switch_play_pause_button(false);
}

var radio = navigator.mozFMRadio;

/* イヤホン挿抜で再生/停止。
 */
function play_or_stop() {
set_msg('r1');
    if (radio.antennaAvailable) {
set_msg('r2');
	play_pressed = true;
set_msg('r3');
    } else {
set_msg('r4');
	pause();
set_msg('r5');
    }
}

if (radio)
    radio.addEventListener('antennaavailablechange', play_or_stop);

/* 曲リストからファイルを選択すると、再生開始して
 * 画面を main に戻す。…ような関数を返す。
 * closure を使ってるので、ちょっと解りにくい。
 */
function play_on_click(id) {
    var mid = id;
    return function() {
	jump_to = mid;
	jump_pressed = true;
//	screen_change();
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
	setTimeout(make_select_screen_iter_file, 0);
    }
}

/* 何故か metadata が得られなかった場合。
 */
function metadata_timeout()
{
    idx++;
    setTimeout(make_select_screen_iter_file, 0);
}

var parents = [];
var idxs = [];
var fnames = [];
var idx = 0;
var timer = 0;

function make_select_screen_iter_file() {
    if (timer != 0) {
	clearTimeout(timer);
	timer = 0;
    }
    if (idx >= parents.length) {
	document.getElementById('eject').style.display = 'block';
	document.getElementById('spinner').style.display = 'none';
	return;
    }
    
//    set_msg('' + files[idxs[idx]].name);
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
    
    if (!audio.canPlayType(files[idxs[idx]].type)) {
	title.nodeValue = '不明なタイトル';
	artist.nodeValue = '不明なアーティスト';
	
	idx++;
	make_select_screen_iter_file();
    } else if (files[idxs[idx]].name.indexOf('.wav', 0) >= 0) {
	// イベントが飛んでこない...
	title.nodeValue = '不明なタイトル';
	artist.nodeValue = '不明なアーティスト';
	
	idx++;
	make_select_screen_iter_file();
    } else {
	var tempaudio = new Audio(window.URL.createObjectURL(files[idxs[idx]]));
	tempaudio.preload = 'metadata';
	tempaudio.addEventListener('loadedmetadata', got_metadata(tempaudio, title, artist));
	timer = setTimeout(metadata_timeout, 1000);
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
	if (files[idx].name.lastIndexOf(prefix, 0) != 0)	// if !startsWith(prefix)
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
    set_msg('make_select_screen: 3: ' + files.length);
    
    // 作成
    parents = [];
    idxs = [];
    idx = 0;
    ul = document.createElement("ul");
    if (files.length >= 1 && files[0].name.lastIndexOf('/sdcard/Music/') == 0) {
	// 実機
	make_select_screen_iter(ul, '/sdcard/Music/', 0);
    } else {
	// simulator
	make_select_screen_iter(ul, 'Music/', 0);
    }
    document.getElementById("list").appendChild(ul);
    
    make_select_screen_iter_file();
    set_msg('make_select_screen: done.');
}

function select_screen() {
    screen_change();
}

/* 曲選択画面から戻る。
 */
function cancel_select_screen() {
    set_msg('cancel_select_screen: start.');
    screen_change();
    set_msg('cancel_select_screen: done.');
}

window.onload = function() {
    set_msg('onload0');
    var seekbar = document.getElementById('seekbar');
    set_msg('onload1');
    seekbar.addEventListener('change', play_seek, false);
    set_msg('onload2');

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
    mrc.addCommandListener('stop', mrc_pause);
    mrc.addCommandListener('playpause', mrc_playpause);
    mrc.addCommandListener('next', mrc_next);
    mrc.addCommandListener('previous', mrc_prev);
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
		
		restore_cur();
		
		screen_change();

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

    logo_init();
};
