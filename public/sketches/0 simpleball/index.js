// simple ball bouncing in a box



function setup() {
  
  x = 100;
  y = 100;
  xspeed = 5;
  yspeed = 5;

  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  
  // Use fx.ballSize directly
  let size = fx.ballSize || 50;
  // Use fx.ballSpeed directly
  let speedMultiplier = fx.ballSpeed || 1;
  
  // Draw the circle with the configurable size
  circle(x, y, size);
  
  // Move the ball with configurable speed
  x += xspeed * speedMultiplier;
  y += yspeed * speedMultiplier;
  
  // Bounce off walls
  if (x > width - size/2 || x < size/2) {
    xspeed = -xspeed;
  }
  if (y > height - size/2 || y < size/2) {
    yspeed = -yspeed;
  }
}
