// All the paths
let paths = [];
// Are we painting?
let painting = false;
// How long until the next circle
let next = 0;
// Where are we now and where were we?
let current;
let previous;

function setup() {
    // 720, 400 Default
  createCanvas(800, 600);
  current = createVector(0,0);
  previous = createVector(0,0);
};

// Define an array to store points
let points = [];

function draw() {
  background(200);
  
  // If it's time for a new point
  if (millis() > next && painting) {
    // Grab mouse position      
    let current = createVector(mouseX, mouseY);

    // New point's force is based on mouse movement
    let force = p5.Vector.sub(current, previous);
    force.mult(0.05);

    // Add new point to the array
    points.push({ x: current.x, y: current.y });

    // Schedule next point
    next = millis() + random(100);

    // Store current mouse values
    previous.x = current.x;
    previous.y = current.y;
  }

  // Draw all points
  for(let i = 0; i < points.length - 1; i++) {
    stroke(0);
    strokeWeight(3);
    line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
  }
}

function sendDataToPython(points) {
    // Send points data to Flask backend using AJAX
    fetch('/process_points', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ points: points }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response from Flask backend:', data);
        // Handle response from Flask if needed
    })
    .catch(error => {
        console.error('Error sending data to Flask backend:', error);
    });
}

// Start it up
function mousePressed() {
  next = 0;
  painting = true;
  previous.x = mouseX;
  previous.y = mouseY;
  paths.push(new Path());
}

// Stop
function mouseReleased() {
  painting = false;
}

// A Path is a list of particles
class Path {
  constructor() {
    this.particles = [];
    this.hue = random(100);
  }

  add(position, force) {
    // Add a new particle with a position, force, and hue
    this.particles.push(new Particle(position, force, this.hue));
  }
  
  // Display plath
  update() {  
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
    }
  }  
  
  // Display plath
  display() {    
    // Loop through backwards
    for (let i = this.particles.length - 1; i >= 0; i--) {
      // If we shold remove it
      if (this.particles[i].lifespan <= 0) {
        this.particles.splice(i, 1);
      // Otherwise, display it
      } else {
        this.particles[i].display(this.particles[i+1]);
      }
    }
  
  }  
}

// Particles along the path
class Particle {
  constructor(position, force, hue) {
    this.position = createVector(position.x, position.y);
    this.velocity = createVector(force.x, force.y);
    this.drag = 0.95;
    this.lifespan = 255;
  }

  update() {
    // Move it
    this.position.add(this.velocity);
    // Slow it down
    this.velocity.mult(this.drag);
    // Fade it out
    this.lifespan--;
  }

  // Draw particle and connect it with a line
  // Draw a line to another
  display(other) {
    stroke(0, this.lifespan);
    fill(0, this.lifespan/2);    
    ellipse(this.position.x,this.position.y, 8, 8);    
    // If we need to draw a line
    if (other) {
      line(this.position.x, this.position.y, other.position.x, other.position.y);
    }
  }
}
