let amplitude, wavelength, angularFrequency; // Wave parameters
let sliderA, sliderW, sliderF; // Sliders for control
let time = 0;
let showTravelingWaves = false;  // Add this with other global variables
let toggleButton;  // Add this with other global variables
let labelA, labelW, labelF; // Add these with other global variables
let legendDiv;

function setup() {
  createCanvas(800, 400);
  
  // Add toggle button
  toggleButton = createButton('Show Traveling Waves');
  toggleButton.position(20, 110);
  toggleButton.mousePressed(() => {
    showTravelingWaves = !showTravelingWaves;
    toggleButton.html(showTravelingWaves ? 'Hide Traveling Waves' : 'Show Traveling Waves');
  });
  
  // Add legend div after other UI elements
  legendDiv = createDiv()
    .position(20, 140)
    .style('color', '#000')
    .style('font-family', 'Arial')
    .style('background-color', 'rgba(255, 255, 255, 0.8)')
    .style('padding', '8px')
    .style('border-radius', '3px')
    .style('width', '400px')
    .style('margin-top', '10px')
    .html('<span style="color: red">■</span> Nodes: Points of no movement<br>' +
          '<span style="color: #00ff00">■</span> Antinodes: Points of maximum movement');
}

function draw() {
  // Update parameters from sliders
  amplitude = fx.amplitude;
  let numberOfWaves = fx.wavelength;
  let k = (numberOfWaves * TWO_PI) / width;
  angularFrequency = fx.frequency;
  
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
  
  // Update legend for traveling waves
  if (showTravelingWaves) {
    legendDiv.html('<span style="color: black">■</span> Nodes: Points of no movement<br>' +
                  '<span style="color: black">↑↓</span> Antinodes: Points of maximum movement<br>' +
                  '<span style="color: blue">■</span> Right-traveling wave<br>' +
                  '<span style="color: red">■</span> Left-traveling wave');
  } else {
    legendDiv.html('<span style="color: black">■</span> Nodes: Points of no movement<br>' +
                  '<span style="color: black">↑↓</span> Antinodes: Points of maximum movement');
  }
  
  // Add time update at the end of draw()
  time += 0.016; // Approximately 60fps
}
