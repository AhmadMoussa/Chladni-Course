let cols = 16;
let rows = 16;
let time = 0;
let angle = 0;

// Control parameters
let amplitude = 50;
let n = 5;  // mode number x
let m = 3;  // mode number y
let omega = 1;  // angular frequency
let phase = 0;

// Add these with the other global variables at the top
let labelA, labelN, labelM;

function setup() {
    createCanvas(600, 400, WEBGL);  // Change to WEBGL for main canvas
    
    frameRate(60);  // Add consistent frame rate
    
    // Create sliders with labels
    sliderA = createSlider(10, 100, 50);
    sliderA.position(20, 20);
    labelA = createDiv()
        .position(200, 20)
        .style('color', '#000')
        .style('font-family', 'Arial')
        .style('background-color', 'rgba(255, 255, 255, 0.8)')
        .style('padding', '3px 8px')
        .style('border-radius', '3px')
				.style('width', '180px');
    
    sliderN = createSlider(1, 8, 3, 1);
    sliderN.position(20, 50);
    labelN = createDiv()
        .position(200, 50)
        .style('color', '#000')
        .style('font-family', 'Arial')
        .style('background-color', 'rgba(255, 255, 255, 0.8)')
        .style('padding', '3px 8px')
        .style('border-radius', '3px').style('width', '180px');
    
    sliderM = createSlider(1, 8, 3, 1);
    sliderM.position(20, 80);
    labelM = createDiv()
        .position(200, 80)
        .style('color', '#000')
        .style('font-family', 'Arial')
        .style('background-color', 'rgba(255, 255, 255, 0.8)')
        .style('padding', '3px 8px')
        .style('border-radius', '3px').style('width', '180px');
}

function draw() {
    background(220);
    
    // Update parameters from sliders and update labels
    amplitude = sliderA.value();
    n = sliderN.value();
    m = sliderM.value();
    
    // Update label texts
    labelA.html(`Amplitude: ${amplitude}`);
    labelN.html(`Mode number X (n): ${n}`);
    labelM.html(`Mode number Y (m): ${m}`);
    

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
