const path = require('path');
const gatherFiles = require('./scripts/gather-files');
const iconSvgPath = path.join(__dirname, './icons');

module.exports = {
  layouts: {
    all: require('./layouts/all.json')
  },
  svgArray: gatherFiles(iconSvgPath)
};
console.clear();

let sources = [
    { name: 'jason', url: 'https://s.gravatar.com/avatar/ed18530532560e244aa34faa73b1b389?s=150' },
 { name: 'phillip', url: 'https://s.gravatar.com/avatar/ed18530532560e244aa34faa73b1b389?s=150' },
   { name: 'schneider', url: 'https://s.gravatar.com/avatar/ed18530532560e244aa34faa73b1b389?s=150' },
];

let c = document.getElementById('c');
let ctx = c.getContext('2d');
let size = { x: c.width, y: c.height };
let definition = 100;
let partSize = size.y / definition;
let picData = [];
let points = [];

async function load(data) {
    if (data instanceof File) {
        return new Promise((res, rej) => {
            let reader = new FileReader();
            reader.onload = () => res(load(reader.result));
            reader.onerror = rej;
            reader.readAsDataURL(data);
        });
    }
    return new Promise((res, rej) => {
        let img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.crossOrigin = 'anonymous';
        img.src = data;
    });
}
function getLightData(image, size) {
    if (!size) {
        size = { x: img.width, y: img.height };
    }
    let c = document.createElement('canvas');
    let ctx = c.getContext('2d');
    c.width = size.x;
    c.height = size.y;
    ctx.fillRect(0, 0, c.width, c.height);
    let w = size.x;
    let h = size.y;
    let imgRatio = image.width / image.height;
    let finalRatio = w / h;
    if (imgRatio > finalRatio) {
        w = h * imgRatio;
    } else {
        h = w / imgRatio;
    }
    ctx.drawImage(image, (size.x - w) * .5, (size.y - h) * .5, w, h);
    let data = ctx.getImageData(0, 0, size.x, size.y).data;
    let ret = [];
    for (let i = 0, n = data.length; i < n; i += 4) {
        ret.push((.2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2]) / 255);
    }
    return ret;
}
let currentImage = null;
async function prepare(source) {
    if (source === currentImage) {
        return;
    }
    currentImage = source;
    picData = [];
    let image = await load(source);
    if (currentImage !== source) {
        return;
    }
    picData = getLightData(image, size);
}

function at(x, y) {
    return picData[~~x + ~~y * size.x] || 0;
}
function addLine() {
    points.push(...[...Array(definition)].map((e, i) => ({ x:0, y: i * partSize })));
}

let spawner = (() => {
    let last = 0;
    // interval in seconds
    let interval = .3;
    return {
        setInterval: v => interval = v || 1,
        tick: dt => {
            last += dt || 0;
            if (last >= interval) {
                addLine();
                last = last % interval;
            }
        }
    };
})();

let speed = 100;
let minSpeed = .15;

// Under 30fps, prefer lagging than time accuracy
let maxDT = 1 / 30;
let previous;
function loop(timestamp) {
    if (!previous) {
        previous = timestamp;
    }
    let dt = (timestamp - previous) * .001;
    if (dt > maxDT) {
        dt = maxDT;
    }
    previous = timestamp;
    spawner.tick(dt);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, size.x, size.y);
    ctx.fillStyle = '#fff';
    for (let i = points.length; i--;) {
        let point = points[i];
        let val = 1 - at(point.x, point.y);
        let factor = minSpeed + (1 - minSpeed) * (val * val);
        point.x += speed * dt * factor;
        if (point.x >= size.x || point.x < 0 || point.y >= size.y || point.y < 0) {
            points.splice(i, 1);
            continue;
        }
        ctx.fillRect(point.x, point.y, 1, partSize);
    }
    requestAnimationFrame(loop);
}

document.getElementById('interval').addEventListener('input', e => {
    spawner.setInterval(e.target.value / 1000);
});
document.getElementById('speed').addEventListener('input', e => {
    speed = +e.target.value;
});
document.getElementById('sf').addEventListener('input', e => {
    minSpeed = e.target.value / 100;
});

function checkSize() {
    let size = Math.min(window.innerWidth, window.innerHeight, c.width);
    c.style.width = size + 'px';
    c.style.height = size + 'px';
}
window.addEventListener('resize', checkSize);

c.addEventListener('click', () => {
    c.style.zIndex = c.style.zIndex ? '' : 5;
});

let $selection = document.querySelector('.selection');
sources.forEach(source => {
    let button = document.createElement('button');
    button.textContent = source.name;
    button.addEventListener('click', () => prepare(source.url));
    $selection.insertBefore(button, $selection.lastElementChild);
});
document.getElementById('custom').addEventListener('change', e => {
    let files = e.target.files;
    let file = files && files[0];
    if (!file) {
        return;
    }
    prepare(file);
});
document.body.addEventListener('dragover', e => e.preventDefault());
document.body.addEventListener('drop', e => {
    e.preventDefault();
    let dt = e.dataTransfer;
    if (dt.items) {
        let file = [...dt.items].find(e => e.kind === 'file');
        if (file) {
            prepare(file.getAsFile());
        }
    } else {
        let file = dt.files[0];
        if (file) {
            prepare(file);
        }
    }
});

checkSize();
prepare(sources[0].url).then(() => requestAnimationFrame(loop));
window.requestAnimFrame = (function(){   return  window.requestAnimationFrame})();
var canvas = document.getElementById("space");
var c = canvas.getContext("2d");

var numStars = 1900;
var radius = '0.'+Math.floor(Math.random() * 9) + 1  ;
var focalLength = canvas.width *2;
var warp = 0;
var centerX, centerY;

var stars = [], star;
var i;

var animate = true;

initializeStars();

function executeFrame(){

  if(animate)
    requestAnimFrame(executeFrame);
  moveStars();
  drawStars();
}

function initializeStars(){
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;

  stars = [];
  for(i = 0; i < numStars; i++){
    star = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
      o: '0.'+Math.floor(Math.random() * 99) + 1
    };
    stars.push(star);
  }
}

function moveStars(){
  for(i = 0; i < numStars; i++){
    star = stars[i];
    star.z--;

    if(star.z <= 0){
      star.z = canvas.width;
    }
  }
}

function drawStars(){
  var pixelX, pixelY, pixelRadius;

  // Resize to the screen
  if(canvas.width != window.innerWidth || canvas.width != window.innerWidth){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeStars();
  }
  if(warp==0)
  {c.fillStyle = "rgba(0,10,20,1)";
  c.fillRect(0,0, canvas.width, canvas.height);}
  c.fillStyle = "rgba(209, 255, 255, "+radius+")";
  for(i = 0; i < numStars; i++){
    star = stars[i];

    pixelX = (star.x - centerX) * (focalLength / star.z);
    pixelX += centerX;
    pixelY = (star.y - centerY) * (focalLength / star.z);
    pixelY += centerY;
    pixelRadius = 1 * (focalLength / star.z);

    c.fillRect(pixelX, pixelY, pixelRadius, pixelRadius);
    c.fillStyle = "rgba(209, 255, 255, "+star.o+")";
    //c.fill();
  }
}

document.getElementById('warp').addEventListener("click",function(e){
 window.warp = window.warp==1 ? 0 : 1;
window.c.clearRect(0, 0, window.canvas.width, window.canvas.height);
executeFrame();
});

executeFrame();
