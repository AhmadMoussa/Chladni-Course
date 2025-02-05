p5.disableFriendlyErrors = true

let buffer;
const BUFFER_SIZE = 600; // Fixed size for the actual visualization

let slider1N, slider1M, slider2N, slider2M;
let label1N, label1M, label2N, label2M;
let amplitudeSlider;
let amplitudeDiv;
let center1, center2;
let draggingCenter1 = false;
let draggingCenter2 = false;
let centerRadius = 20;  // Radius to detect dragging
let N, M;
let needsUpdate = true;
let lastN, lastM, lastAmplitude;

function setup(){
  // Calculate initial canvas size based on window dimensions
  canvasSize = min(windowWidth , windowHeight);
  
  // Ensure minimum size
  canvasSize = max(canvasSize, 300); // Set a minimum size if needed
  
  padding = 0;

  cols = 300;
  rows = 300;

  rW = (BUFFER_SIZE - padding*2) / cols;
  rH = (BUFFER_SIZE - padding*2) / rows;

  // Create main canvas
  createCanvas(canvasSize, canvasSize);
  
  // Create fixed-size buffer
  buffer = createGraphics(BUFFER_SIZE, BUFFER_SIZE);
  buffer.stroke(255);
  
  // Style the canvas container
  let s = `
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  `;
  document.querySelector('canvas').style = s;
  
  slider1N = createSlider(1, 10, 5, 1);
  slider1N.position(10, 10);
  slider1N.size(80);
  label1N = createDiv()
      .position(100, 10)
      .style('color', '#000')
      .style('font-family', 'Arial')
      .style('background-color', 'rgba(255, 255, 255, 0.8)')
      .style('padding', '3px 8px')
      .style('border-radius', '3px')
      .style('width', '180px');

  slider1M = createSlider(1, 10, 5, 1);
  slider1M.position(10, 40);
  slider1M.size(80);
  label1M = createDiv()
      .position(100, 40)
      .style('color', '#000')
      .style('font-family', 'Arial')
      .style('background-color', 'rgba(255, 255, 255, 0.8)')
      .style('padding', '3px 8px')
      .style('border-radius', '3px')
      .style('width', '180px');

  slider2N = createSlider(1, 10, 5, 1);
  slider2N.position(10, 70);
  slider2N.size(80);
  label2N = createDiv()
      .position(100, 70)
      .style('color', '#000')
      .style('font-family', 'Arial')
      .style('background-color', 'rgba(255, 255, 255, 0.8)')
      .style('padding', '3px 8px')
      .style('border-radius', '3px')
      .style('width', '180px');

  slider2M = createSlider(1, 10, 5, 1);
  slider2M.position(10, 100);
  slider2M.size(80);
  label2M = createDiv()
      .position(100, 100)
      .style('color', '#000')
      .style('font-family', 'Arial')
      .style('background-color', 'rgba(255, 255, 255, 0.8)')
      .style('padding', '3px 8px')
      .style('border-radius', '3px')
      .style('width', '180px');

  amplitudeSlider = createSlider(1, 100, 20, 1);
  amplitudeSlider.position(10, 130);
  amplitudeSlider.size(80);
  amplitudeDiv = createDiv()
      .position(100, 130)
      .style('color', '#000')
      .style('font-family', 'Arial')
      .style('background-color', 'rgba(255, 255, 255, 0.8)')
      .style('padding', '3px 8px')
      .style('border-radius', '3px')
      .style('width', '180px');

  // Initialize centers based on buffer size
  center1 = createVector(BUFFER_SIZE / 3, BUFFER_SIZE / 3);
  center2 = createVector(2 * BUFFER_SIZE / 3, 2 * BUFFER_SIZE / 3);
	
  // Store initial values
  lastN = slider1N.value();
  lastM = slider1M.value();
  lastAmplitude = amplitudeSlider.value();
  
  // Add input listeners to sliders
  slider1N.input(() => needsUpdate = true);
  slider1M.input(() => needsUpdate = true);
  slider2N.input(() => needsUpdate = true);
  slider2M.input(() => needsUpdate = true);
  amplitudeSlider.input(() => needsUpdate = true);
}

function draw(){
  // Only redraw if there are changes
  if (!needsUpdate && !draggingCenter1 && !draggingCenter2) return;
  
  // Clear both canvas and buffer
  background(220);
  buffer.background(220);
  buffer.stroke(0);
  buffer.strokeWeight(2);
  
  let L = BUFFER_SIZE - padding * 2;
  let n1 = slider1N.value();
  let m1 = slider1M.value();
  let n2 = slider2N.value();
  let m2 = slider2M.value();

  // Update labels
  label1N.html(`N1: ${n1}`);
  label1M.html(`M1: ${m1}`);
  label2N.html(`N2: ${n2}`);
  label2M.html(`M2: ${m2}`);

  // Draw pattern on buffer
  for (let x = -cols/2; x < cols/2; x++) {
    for (let y = -rows/2; y < rows/2; y++) {
      let posX = x * rW + BUFFER_SIZE / 2;
      let posY = y * rH + BUFFER_SIZE / 2;

      let r1 = dist(posX, posY, center1.x, center1.y);
      let r2 = dist(posX, posY, center2.x, center2.y);

      let theta1 = atan2(posY - center1.y, posX - center1.x);
      let theta2 = atan2(posY - center2.y, posX - center2.x);
      
      let chladni1 = cos(m1 * r1 * PI / L) * cos(n1 * theta1);
      let chladni2 = cos(m2 * r2 * PI / L) * cos(n2 * theta2);
      let chladni = chladni1 + chladni2;
      
      let thresh = amplitudeSlider.value() / 1000;
      if (chladni < thresh && chladni > -thresh) {
          buffer.point(posX, posY);
      }
    }
  }

  // Draw centers on buffer
  buffer.noStroke();
  buffer.fill(255, 0, 0);
  buffer.ellipse(center1.x, center1.y, centerRadius, centerRadius);
  buffer.fill(0, 0, 255);
  buffer.ellipse(center2.x, center2.y, centerRadius, centerRadius);

  // Draw buffer to main canvas
  image(buffer, 0, 0, width, height);
	windowResized()

  // Update amplitude label
  amplitudeDiv.html(`Line Width: ${amplitudeSlider.value()}`);
  
  // After drawing, mark as updated
  needsUpdate = false;
  lastN = slider1N.value();
  lastM = slider1M.value();
  lastAmplitude = amplitudeSlider.value();
}

function mousePressed() {
  // Convert mouse coordinates to buffer coordinates
  let bufferX = (mouseX / width) * BUFFER_SIZE;
  let bufferY = (mouseY / height) * BUFFER_SIZE;
  
  if (dist(bufferX, bufferY, center1.x, center1.y) < centerRadius / 2) {
    draggingCenter1 = true;
  } else if (dist(bufferX, bufferY, center2.x, center2.y) < centerRadius / 2) {
    draggingCenter2 = true;
  }
}

function mouseReleased() {
  // Stop dragging
  draggingCenter1 = false;
  draggingCenter2 = false;
}

function mouseDragged() {
  // Convert mouse coordinates to buffer coordinates
  let bufferX = (mouseX / width) * BUFFER_SIZE;
  let bufferY = (mouseY / height) * BUFFER_SIZE;
  
  if (draggingCenter1) {
    center1.x = bufferX;
    center1.y = bufferY;
    needsUpdate = true;
  } else if (draggingCenter2) {
    center2.x = bufferX;
    center2.y = bufferY;
    needsUpdate = true;
  }
}

// Add window resize handler
function windowResized() {
  // Calculate new size
  let newSize = min(windowWidth, windowHeight);
  newSize = max(newSize, 300); // Ensure minimum size
  
  if (newSize !== width) {
    canvasSize = newSize;
    resizeCanvas(canvasSize, canvasSize);
  }
  
  // Update slider positions
  slider1N.position(10, 10);
  slider1M.position(10, 40);
  slider2N.position(10, 70);
  slider2M.position(10, 100);
  amplitudeSlider.position(10, 130);
  needsUpdate = true;
}
