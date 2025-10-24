// --- Configuración general ---
let particles = [];
let explosions = [];
let speedFactor = 1; // per defecte 1x

const NUM_PER_TYPE = 50;
const TYPES = ["roca", "papel", "tijera"];
let winner = null;

// Botón reinicio
const button = { x: 10, y: 550, w: 100, h: 30 };

// Radio del círculo de explosión
let explosionRadius = 30;

let noteOsc;
let env;
let audioStarted = false;

let currentMode = "explosion"; // "explosion", "roca", "papel", "tijera"

const currentModeText = document.getElementById("currentMode");
const modeButtons = document.querySelectorAll(".mode-btn");

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const modeName = btn.textContent.trim();
    currentModeText.textContent = `Modo actual: ${modeName}`;
  });
});

function setup() {
  const s = min(windowWidth, windowHeight) * 0.9;
  let cnv = createCanvas(s * 1.6, s);

  cnv.mousePressed(() => {
    if (!audioStarted) {
      userStartAudio();
      audioStarted = true;
    }
    mousePressedXXX();
  });

  cnv.parent("sketch-holder"); // opcional, per col·locar el canvas dins del div

  // --- Configurar botones de modo ---
  setupModeButtons();

  // Oscilador musical
  noteOsc = new p5.Oscillator("triangle");
  noteOsc.start();
  noteOsc.amp(0);

  // Envolvente para hacer las notas más suaves
  env = new p5.Envelope();
  env.setADSR(0.01, 0.2, 0.1, 0.3);
  env.setRange(0.3, 0);

  textFont("Segoe UI Emoji");
  restartGame();

  // enganxar el botó HTML a la funció restartGame
  let btn = select("#restartBtn"); // p5.js té select() per agafar elements del DOM
  btn.mousePressed(restartGame);

  // Slider HTML
  let slider = select("#speedSlider");
  let speedLabel = select("#speedValue");

  slider.input(() => {
    speedFactor = slider.value();
    speedLabel.html(speedFactor + "x");
  });
}
function windowResized() {
  const s = min(windowWidth, windowHeight) * 0.9;

  if (windowWidth > windowHeight) resizeCanvas(s * 1.67, s);
  else resizeCanvas(s, s * 1.67);

  // Regenerate art with same seed for consistency
  redraw();
}

function draw() {
  background(25);

  if (!winner) {
    // Actualizar partículas solo si aún no hay ganador
    for (let p of particles) p.update();

    // Colisiones e interacciones
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let a = particles[i];
        let b = particles[j];
        if (a.isColliding(b)) {
          a.resolveCollision(b);
          a.interact(b);
        }
      }
    }
  }

  // Dibujar particulas
  for (let p of particles) p.display();
  // Actualitzar i dibuixar explosions
  for (let e of explosions) {
    e.update();
    e.display();
  }
  // Eliminar explosions acabades
  explosions = explosions.filter((e) => !e.isFinished());

  // Mostrar estadísticas y ganador
  showStats();

  // Actualizar sonido dinámico
  // updateSound();

  // --- Dibujar círculo azul que sigue al ratón ---
  noFill();
  stroke(0, 150, 255, 200); // azul semitransparente
  strokeWeight(2);
  ellipse(mouseX, mouseY, explosionRadius * 2);
}

//Sonido
function playNote(freq) {
  noteOsc.freq(freq);
  env.play(noteOsc);
}

// Notas musicales agradables (escala pentatónica)
const noteMap = {
  roca: 261.63, // C4
  papel: 329.63, // E4
  tijera: 392.0, // G4
};

let mySound;
function preload() {
  mySound = loadSound("winners_sound.mp3");
}

function setupModeButtons() {
  const modes = ["explosion", "roca", "papel", "tijera"];
  for (let mode of modes) {
    let btn = select("#btn" + capitalize(mode));
    btn.mousePressed(() => setMode(mode));
  }
}

function setMode(mode) {
  currentMode = mode;
  // Actualiza el estado visual de los botones
  selectAll(".mode-btn").forEach((btn) => btn.removeClass("active"));
  select("#btn" + capitalize(mode)).addClass("active");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Clase Particle ---
class Particle {
  constructor(x, y, tipo) {
    this.x = x;
    this.y = y;
    this.r = 10;
    this.tipo = tipo;

    let angle = random(TWO_PI);
    let speed = random(1, 2.5);
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
  }

  update() {
    this.x += this.vx * speedFactor;
    this.y += this.vy * speedFactor;

    // Rebote en bordes
    if (this.x - this.r < 0) {
      this.x = this.r;
      this.vx *= -1;
    } else if (this.x + this.r > width) {
      this.x = width - this.r;
      this.vx *= -1;
    }
    if (this.y - this.r < 0) {
      this.y = this.r;
      this.vy *= -1;
    } else if (this.y + this.r > height) {
      this.y = height - this.r;
      this.vy *= -1;
    }
  }

  display() {
    textSize(this.r * 2.2);
    textAlign(CENTER, CENTER);

    let emoji = "❔";
    if (this.tipo === "roca") emoji = "🪨";
    if (this.tipo === "papel") emoji = "📄";
    if (this.tipo === "tijera") emoji = "✂️";

    text(emoji, this.x, this.y);
  }

  isColliding(other) {
    let dx = this.x - other.x;
    let dy = this.y - other.y;
    let distSq = dx * dx + dy * dy;
    let radii = this.r + other.r;
    return distSq < radii * radii;
  }

  resolveCollision(other) {
    let dx = other.x - this.x;
    let dy = other.y - this.y;
    let dist = sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    let overlap = this.r + other.r - dist;
    if (overlap > 0) {
      let nx = dx / dist;
      let ny = dy / dist;

      this.x -= (nx * overlap) / 2;
      this.y -= (ny * overlap) / 2;
      other.x += (nx * overlap) / 2;
      other.y += (ny * overlap) / 2;

      // intercambio de velocidades
      let tempVx = this.vx;
      let tempVy = this.vy;
      this.vx = other.vx;
      this.vy = other.vy;
      other.vx = tempVx;
      other.vy = tempVy;
    }
  }

  interact(other) {
    // --- Determinar color de explosión y ganador ---
    let col = Particle.getExplosionColor(this.tipo, other.tipo);
    let winner = Particle.determineWinner(this, other);

    // 🎵 hacer que suene siempre (incluso si no hay cambio de tipo)
    Particle.playCollisionNote(this.tipo, other.tipo);

    if (!winner) return; // no cambia tipos ni crea explosión si son iguales

    // --- Si hay un ganador, transformar el perdedor y crear explosión ---
    if (winner === this) {
      if (other.tipo !== this.tipo) {
        other.tipo = this.tipo;
        explosions.push(new Explosion(other.x, other.y, 30, col, 20, 30, 1, 3));
      }
    } else {
      if (this.tipo !== other.tipo) {
        this.tipo = other.tipo;
        explosions.push(new Explosion(other.x, other.y, 30, col, 20, 30, 1, 3));
      }
    }
  }

  static getExplosionColor(tipoA, tipoB) {
    if (
      (tipoA === "roca" && tipoB === "papel") ||
      (tipoA === "papel" && tipoB === "roca")
    ) {
      return [255, 0, 0, 180]; // rojo
    }
    if (
      (tipoA === "roca" && tipoB === "tijera") ||
      (tipoA === "tijera" && tipoB === "roca")
    ) {
      return [0, 255, 0, 180]; // verde
    }
    if (
      (tipoA === "tijera" && tipoB === "papel") ||
      (tipoA === "papel" && tipoB === "tijera")
    ) {
      return [255, 255, 0, 180]; // amarillo
    }
    return [255, 200, 0, 180]; // color por defecto (naranja)
  }

  static determineWinner(pA, pB) {
    let a = pA.tipo;
    let b = pB.tipo;
    if (a === b) return null;
    if (
      (a === "roca" && b === "tijera") ||
      (a === "tijera" && b === "papel") ||
      (a === "papel" && b === "roca")
    ) {
      return pA;
    } else {
      return pB;
    }
  }
  static playCollisionNote(tipoA, tipoB) {
    const pair = [tipoA, tipoB].sort().join("-");

    const noteMap = {
      "roca-roca": 261.63, // C4
      "roca-papel": 293.66, // D4
      "roca-tijera": 329.63, // E4
      "papel-papel": 349.23, // F4
      "papel-tijera": 392.0, // G4
      "tijera-tijera": 440.0, // A4
    };

    if (noteMap[pair]) {
      playNote(noteMap[pair]);
    }
  }
}

// --- Mostrar estadísticas y ganador ---
function showStats() {
  let counts = { roca: 0, papel: 0, tijera: 0 };
  for (let p of particles) counts[p.tipo]++;

  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(
    `🪨 Piedra: ${counts.roca}    📄 Papel: ${counts.papel}    ✂️ Tijera: ${counts.tijera}`,
    10,
    10
  );

  // Determinar ganador dinámicamente
  let currentWinner = null;

  if (counts.roca === 0 && counts.papel === 0 && counts.tijera > 0) {
    currentWinner = "tijera";
  } else if (counts.tijera === 0 && counts.papel === 0 && counts.roca > 0) {
    currentWinner = "roca";
  } else if (counts.roca === 0 && counts.tijera === 0 && counts.papel > 0) {
    currentWinner = "papel";
  } else if (counts.roca === 0 && counts.tijera === 0 && counts.papel === 0) {
    currentWinner = "USTED";
  }

  if (currentWinner) {
    showWinner(currentWinner);
  }
}

let lastWinner = null;

function showWinner(ganador) {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  text(`🏆 ¡Ha ganado ${ganador.toUpperCase()}!`, width / 2, height / 2);
  textSize(24);
  text(`Haz clic para reiniciar 🔁`, width / 2, height / 2 + 50);

  if (lastWinner !== ganador) {
    mySound.play();
    setTimeout(() => {
      mySound.stop();
    }, 1000);
    lastWinner = ganador;
  }
}

// --- Función para reiniciar todo ---
function restartGame() {
  particles = [];
  lastWinner = null;
  winner = null;
  for (let tipo of TYPES) {
    for (let i = 0; i < NUM_PER_TYPE; i++) {
      particles.push(new Particle(random(width), random(height), tipo));
    }
  }
}
// --- Click ---
function mousePressedXXX() {
  if (currentMode === "explosion") {
    explosions.push(
      new Explosion(
        mouseX,
        mouseY,
        explosionRadius,
        [0, 150, 255, 180],
        explosionRadius * 2,
        explosionRadius / 2,
        1,
        explosionRadius / 16
      )
    );

    // Eliminar partículas dentro del radio
    particles = particles.filter((p) => {
      let d = dist(mouseX, mouseY, p.x, p.y);
      return d > explosionRadius;
    });
  } else if (["roca", "papel", "tijera"].includes(currentMode)) {
    particles.push(new Particle(mouseX, mouseY, currentMode));
  }
}

// --- Controlar tamaño con la rueda ---
function mouseWheel(event) {
  // event.delta > 0 → rueda hacia abajo
  explosionRadius += event.delta > 0 ? -5 : 5;
  explosionRadius = constrain(explosionRadius, 10, 200);
  return false; // evita scroll de la página
}

class Explosion {
  constructor(
    x,
    y,
    radius = 30,
    col = [255, 200, 0, 180],
    numOfParticles,
    lifeSpan,
    speedMin,
    speedMax
  ) {
    this.particles = [];
    this.color = col; // guardamos el color
    this.radius = radius;
    this.numOfParticles = numOfParticles;

    for (let i = 0; i < numOfParticles; i++) {
      let angle = random(TWO_PI);
      let speed = random(speedMin, speedMax);
      this.particles.push({
        x: x,
        y: y,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        life: lifeSpan,
      });
    }
  }

  update() {
    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life--;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  display() {
    noStroke();
    fill(this.color); // usamos el color que se pasó
    for (let p of this.particles) {
      ellipse(p.x, p.y, 5);
    }
  }

  isFinished() {
    return this.particles.length === 0;
  }
}
