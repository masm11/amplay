function bg_init() {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', 300);
    canvas.setAttribute('height', 300);
    var ctx = canvas.getContext('2d');
    alert('test2: ' + ctx);
    ctx.fillStyle = '#c00000';
    ctx.fillRect(10, 10, 55, 50);
    alert('test3');
    document.mozSetImageElement('canvasbg', canvas);
}
