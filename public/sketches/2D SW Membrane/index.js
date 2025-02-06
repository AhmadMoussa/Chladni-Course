
function setup() {
    
    cols = 16;
    rows = 16;
    time = 0;
    angle = 0;

    omega = 1;  // angular frequency
    phase = 0;

    createCanvas(600, 400, WEBGL);  // Change to WEBGL for main canvas
    
    frameRate(60);  // Add consistent frame rate
}

function draw() {
    background(220);
    
    // Update parameters from sliders and update labels
    amplitude = fx.amplitude;
    n = fx.n;
    m = fx.m;    

    push();
    camera(0, -600, 400, 0, 0, 0, 0, 1, 0);
    scale(1.2);
    rotateX(-PI/2.8);

		
    
    translate(-width/6, -height/4);
		
    	orbitControl()
    
    // Create triangular mesh
    let w = width/2;
    let h = height/2;
    let dx = h / cols;
    let dy = h / rows;
    
    noStroke();
    stroke(0)
    let cosOmegaTimePhase = cos(omega * time + phase);

    for (let i = 0; i < cols; i++) {
        let sinNPiICols = sin(n * PI * i / cols);
        let sinNPiIPlus1Cols = sin(n * PI * (i + 1) / cols);

        for (let j = 0; j < rows; j++) {
            let sinMPiJRows = sin(m * PI * j / rows);
            let sinMPiJPlus1Rows = sin(m * PI * (j + 1) / rows);

            let x1 = i * dx;
            let y1 = j * dy;
            let x2 = (i + 1) * dx;
            let y2 = (j + 1) * dy;
            
            // Calculate wave displacement using precomputed values
            let a = amplitude * sinNPiICols * sinMPiJRows * cosOmegaTimePhase;
            let b = amplitude * sinNPiIPlus1Cols * sinMPiJRows * cosOmegaTimePhase;
            let c = amplitude * sinNPiICols * sinMPiJPlus1Rows * cosOmegaTimePhase;
            let d = amplitude * sinNPiIPlus1Cols * sinMPiJPlus1Rows * cosOmegaTimePhase;
            
            // Color based on height
            let colorIntensity = map(a, -amplitude, amplitude, .9, 1.3);
            fill(255 * colorIntensity, 110 * colorIntensity, 20 * colorIntensity);
            
            beginShape();
            vertex(x1, y1, a);
            vertex(x2, y1, b);
            vertex(x1, y2, c);
            endShape(CLOSE);
            
            beginShape();
            vertex(x2, y1, b);
            vertex(x2, y2, d);
            vertex(x1, y2, c);
            endShape(CLOSE);
        }
    }
    
    pop();
    
    // Update time with consistent speed
    time += TWO_PI / 120;  // Complete cycle every 120 frames, matching circular example
}

// Add GIF export function
function keyPressed() {
    if (key === 's') {
        saveGif('rectangular_membrane_interactive ' + n + " " + m, 2);
    }
}
