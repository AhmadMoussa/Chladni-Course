p5.disableFriendlyErrors = true

let canvasSize = 400;
let center;
let draggingCenter = false;
let centerRadius = 20;  // Radius to detect dragging

function setup(){
	 padding = 0;

	 cols = 200;
	 rows = 200;

	 rW = (canvasSize - padding*2) / cols;
	 rH = (canvasSize - padding*2) / rows;

	createCanvas(canvasSize, canvasSize);

  // Initialize center based on canvas size
  center = createVector(canvasSize/2, canvasSize/2);
}


function draw(){
  background(220);

  L = canvasSize
  n = window.slider
  m = window.slider2
  let amplitude = window.sliderAmp
	
  stroke(0)
	strokeWeight(2)
	for (x = 0; x <= cols; x ++) {
		for (y = 0; y <= rows; y ++) {
				let posX = x * rW + padding
				let posY = y * rH + padding
                
        // Update to use the draggable center
				let r = dist(posX, posY, center.x, center.y);
				let theta = atan2(posY - center.y, posX - center.x);

        // compute the radial wave formula for the point
        // the output of the formula is in a range of -1 and 1
        let wave = amplitude*cos(n * r * PI / L) * cos(m * theta);

				if(wave>-.1 && wave<.1){
					point(posX, posY)
				}	
		}
	}

  // Draw the draggable center point
  noStroke();
  fill(255, 0, 0);
  ellipse(center.x, center.y, centerRadius, centerRadius);
  

}

// Add these new mouse interaction functions
function mousePressed() {
    if (dist(mouseX, mouseY, center.x, center.y) < centerRadius / 2) {
        draggingCenter = true;
    }
}

function mouseReleased() {
    draggingCenter = false;
}

function mouseDragged() {
    if (draggingCenter) {
        center.x = mouseX;
        center.y = mouseY;
    }
}
