// Link data models
// 1. General ROS topics
var ros = new ROSLIB.Ros();
var ros_ip = JData.server_ip;

// Connect to rosbridge_server
ros.on('connection', function() {
  console.log('Connection made!');
});

ros.on('close', function() {
  console.log('Connection closed.');
});

ros.connect("ws://" + ros_ip + ":9090");

// 2. UI component sizes
var CanvasConfig = {
  "minWidth": 640, // Kinect original image width
  "minHeight": 480, // Kinect original image height
  "width": 0,
  "height": 0,
  "position": {
    "x": 0,
    "y": 0
  },
  "scale": 1
};

function updateCanvasConfig(w, h) {
  var nw = w * 10 / CanvasConfig.minWidth;
  var nh = h * 10 / CanvasConfig.minHeight;
  var n = nw > nh ? nh : nw;
  CanvasConfig.scale = parseInt(n)/10.0;
  var mw = CanvasConfig.minWidth * CanvasConfig.scale;
  var mh = CanvasConfig.minHeight * CanvasConfig.scale;
  CanvasConfig.width = mw > CanvasConfig.minWidth? mw : CanvasConfig.minWidth;
  CanvasConfig.height = mh > CanvasConfig.minHeight? mh : CanvasConfig.minHeight;
  CanvasConfig.scale = CanvasConfig.height/CanvasConfig.minHeight;
  CanvasConfig.position.x = (w - CanvasConfig.width)/2;
  CanvasConfig.position.y = (h - CanvasConfig.height)/2;
}

// 2. Kinect image streams
var Kinect = {
  "rgbPixels": [],
  "depthPixels": []
};

var kBuffer = document.createElement('canvas');
kBuffer.width = CanvasConfig.minWidth;
kBuffer.height = CanvasConfig.minHeight;
var kbContext = kBuffer.getContext('2d');
var kbData = kbContext.createImageData(CanvasConfig.minWidth, CanvasConfig.minHeight);

var rgbImage = new Image();
var rgbTexture = new THREE.Texture( rgbImage );
rgbTexture.minFilter = rgbTexture.magFilter = THREE.LinearFilter;
rgbImage.onload = function() {
  kbContext.drawImage(rgbImage, 0, 0);
  Kinect.rgbPixels = kbContext.getImageData(0, 0, CanvasConfig.minWidth, CanvasConfig.minHeight).data;

  rgbTexture.needsUpdate = true;
}

var depthImage = new Image();
var depthTexture = new THREE.Texture( depthImage );
depthTexture.minFilter = THREE.NearestFilter;
depthImage.onload = function() {
  kbContext.drawImage(depthImage, 0, 0);
  Kinect.depthPixels = kbContext.getImageData(0, 0, CanvasConfig.minWidth, CanvasConfig.minHeight).data;

  depthTexture.needsUpdate = true;

  if (typeof(rgbdCanvas) != "undefined") {
    rgbdCanvas.redraw();
  }

  if (typeof(kpointView) != "undefined") {
    kpointView.render();
  }
}

var kinectSource = new EventSource('/kinect_images');
kinectSource.addEventListener('rgbupdate', function(event) {
  rgbImage.src = event.data;
});
kinectSource.addEventListener('depthupdate', function(event) {
  depthImage.src = event.data;
});

// create all canvas components
// Main canvas for background
var bgCanvas;
function setup() {
  bgCanvas = createCanvas(windowWidth, windowHeight);
  bgCanvas.id("bgCanvas");
  bgCanvas.parent("hideView");
  bgCanvas.position(0, 0);

  background(0);
  noLoop();
};

updateCanvasConfig(window.innerWidth, window.innerHeight);

// Create other canvas from bottom to top
// RGB-D & AR mix canvas for kinect view display
var rgbdCanvas = new p5(createRGBDCanvas, "showView");

// AR Overlay for creative AR components dsiplay
var arCanvas = new p5(createARCanvas, "uiView");

// Auxiliary UI canvas for UI components display
var auiCanvas = new p5(createAUICanvas, "uiView");

// Three.js class for kinect point view display
var kpointView = new KinectPoint("threeView");
