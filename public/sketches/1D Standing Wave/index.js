function setup() {
  createCanvas(800, 400);
  
  time = 0;
}

function draw() {
  // Update parameters from sliders
  amplitude = fx.amplitude;
  numberOfWaves = fx.wavelength;
  k = (numberOfWaves * TWO_PI) / width;
  angularFrequency = fx.frequency;
  
  showTravelingWaves = fx.showTravelingWaves;
  
  background(220);
  translate(0, height/2);
  
  // Draw axis lines
  stroke(150);
  line(0, 0, width, 0); // x-axis
  line(0, -height/2, 0, height/2); // y-axis
  
  // Draw the standing wave
  beginShape();
  noFill();
  stroke(0);
  
  wavelength = TWO_PI / k;
  
  // Modified wave drawing loop
  for (let x = 0; x < width; x += 2) {
    // Standing wave equation: y = 2A sin(kx) cos(ωt)
    let y = 2 * amplitude * sin(k * x) * cos(angularFrequency * time);
    vertex(x, -y);
  }
  endShape();
  
  // Modified nodes and antinodes drawing
  for (let x = 0; x <= width; x += wavelength/2) {
    if (sin(k * x) < 0.01 && sin(k * x) > -0.01) {
      // Nodes - draw a small black circle
      fill(0);
      noStroke();
      ellipse(x, 0, 5, 5); // Small black circle at node

      // Draw antinode halfway to the next node
      if (x + wavelength/4 <= width) {
        let antinodeX = x + wavelength/4;
        let currentAmplitude = 2 * amplitude * cos(angularFrequency * time);
        
        // Antinodes - draw a black arrow
        stroke(0);
        line(antinodeX, 0, antinodeX, -currentAmplitude); // Upward arrow
        line(antinodeX, 0, antinodeX, currentAmplitude);  // Downward arrow
        line(antinodeX - 3, -currentAmplitude + 5, antinodeX, -currentAmplitude); // Arrowhead up
        line(antinodeX + 3, -currentAmplitude + 5, antinodeX, -currentAmplitude); // Arrowhead up
        line(antinodeX - 3, currentAmplitude - 5, antinodeX, currentAmplitude); // Arrowhead down
        line(antinodeX + 3, currentAmplitude - 5, antinodeX, currentAmplitude); // Arrowhead down
      }
    }
  }
  
  // Add traveling waves visualization
  if (showTravelingWaves) {
    // Right-traveling wave
    beginShape();
    noFill();
    stroke(0, 0, 255, 128);  // Blue with transparency
    for (let x = 0; x < width; x += 2) {
      let y = amplitude * sin(k * x - angularFrequency * time);
      vertex(x, -y);
    }
    endShape();
    
    // Left-traveling wave
    beginShape();
    stroke(255, 0, 0, 128);  // Red with transparency
    for (let x = 0; x < width; x += 2) {
      let y = amplitude * sin(k * x + angularFrequency * time);
      vertex(x, -y);
    }
    endShape();
  }
  
  // Add time update at the end of draw()
  time += 0.016; // Approximately 60fps
}
