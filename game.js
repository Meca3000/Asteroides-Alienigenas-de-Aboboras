const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameOverEl = document.getElementById('gameOver');

let gameState = {
    score: 0,
    lives: 3,
    isGameOver: false,
    keys: {},
    lastShot: 0
};

class Ship {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.width = 40;
        this.height = 40;
        this.speed = 8;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Corpo da nave
        ctx.fillStyle = '#0ff';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-15, 20);
        ctx.lineTo(15, 20);
        ctx.closePath();
        ctx.fill();
        
        // Cockpit
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Asas
        ctx.fillStyle = '#0aa';
        ctx.fillRect(-20, 10, 8, 15);
        ctx.fillRect(12, 10, 8, 15);
        
        ctx.restore();
    }

    move() {
        if (gameState.keys['ArrowLeft'] && this.x > 30) {
            this.x -= this.speed;
        }
        if (gameState.keys['ArrowRight'] && this.x < canvas.width - 30) {
            this.x += this.speed;
        }
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 15;
        this.speed = 8;
        this.active = true;
    }

    draw() {
        ctx.fillStyle = '#ff0';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0';
        ctx.fillRect(this.x - 2, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    update() {
        this.y -= this.speed;
        if (this.y < -this.height) {
            this.active = false;
        }
    }
}

class Asteroid {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.size = 20 + Math.random() * 30;
        this.speed = 1 + Math.random() * 3;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.active = true;
        this.type = Math.floor(Math.random() * 3);
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Corpo da abóbora
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, '#ff8c00');
        gradient.addColorStop(1, '#ff4500');
        ctx.fillStyle = gradient;
        
        // Desenha a abóbora
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Linhas verticais da abóbora
        ctx.strokeStyle = '#d2691e';
        ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.size * 0.3, -this.size * 0.9);
            ctx.quadraticCurveTo(i * this.size * 0.15, 0, i * this.size * 0.3, this.size * 0.9);
            ctx.stroke();
        }
        
        // Cabinho da abóbora
        ctx.strokeStyle = '#228b22';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 0.9);
        ctx.quadraticCurveTo(-5, -this.size * 1.1, 0, -this.size * 1.2);
        ctx.stroke();
        
        // Folha
        ctx.fillStyle = '#228b22';
        ctx.beginPath();
        ctx.ellipse(-3, -this.size * 1.15, 8, 4, -0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Olhos assustadores
        ctx.fillStyle = '#000';
        ctx.beginPath();
        // Olho esquerdo (triangular)
        ctx.moveTo(-this.size * 0.35, -this.size * 0.3);
        ctx.lineTo(-this.size * 0.15, -this.size * 0.3);
        ctx.lineTo(-this.size * 0.25, -this.size * 0.1);
        ctx.closePath();
        ctx.fill();
        
        // Olho direito (triangular)
        ctx.beginPath();
        ctx.moveTo(this.size * 0.15, -this.size * 0.3);
        ctx.lineTo(this.size * 0.35, -this.size * 0.3);
        ctx.lineTo(this.size * 0.25, -this.size * 0.1);
        ctx.closePath();
        ctx.fill();
        
        // Nariz triangular
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.08, 0);
        ctx.lineTo(this.size * 0.08, 0);
        ctx.lineTo(0, this.size * 0.15);
        ctx.closePath();
        ctx.fill();
        
        // Boca assustadora com dentes
        ctx.beginPath();
        ctx.arc(0, this.size * 0.4, this.size * 0.4, 0, Math.PI);
        ctx.fill();
        
        // Dentes
        ctx.fillStyle = '#ff8c00';
        for (let i = -2; i <= 2; i++) {
            ctx.fillRect(i * this.size * 0.15, this.size * 0.4, this.size * 0.12, this.size * 0.15);
        }
        
        // Brilho assustador nos olhos
        if (this.type > 0) {
            ctx.fillStyle = this.type === 1 ? '#0f0' : '#f0f';
            ctx.shadowBlur = 10;
            ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(-this.size * 0.25, -this.size * 0.22, 2, 0, Math.PI * 2);
            ctx.arc(this.size * 0.25, -this.size * 0.22, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        ctx.restore();
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        
        if (this.y > canvas.height + this.size) {
            this.active = false;
        }
    }

    checkCollision(bullet) {
        const dx = this.x - bullet.x;
        const dy = this.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size;
    }

    checkShipCollision(ship) {
        const dx = this.x - ship.x;
        const dy = this.y - ship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.size + 15;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1;
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
    }
}

const ship = new Ship();
const bullets = [];
const asteroids = [];
const particles = [];

function createExplosion(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function spawnAsteroid() {
    if (!gameState.isGameOver && Math.random() < 0.02) {
        asteroids.push(new Asteroid());
    }
}

function shoot() {
    const now = Date.now();
    if (now - gameState.lastShot > 250) {
        bullets.push(new Bullet(ship.x, ship.y - 20));
        gameState.lastShot = now;
    }
}

function drawStars() {
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
        const x = (i * 123) % canvas.width;
        const y = (i * 456 + Date.now() * 0.02) % canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
}

function update() {
    if (gameState.isGameOver) return;

    ship.move();
    
    bullets.forEach(bullet => bullet.update());
    asteroids.forEach(asteroid => asteroid.update());
    particles.forEach(particle => particle.update());

    bullets.forEach(bullet => {
        asteroids.forEach(asteroid => {
            if (bullet.active && asteroid.active && asteroid.checkCollision(bullet)) {
                bullet.active = false;
                asteroid.active = false;
                gameState.score += 10;
                scoreEl.textContent = gameState.score;
                
                const color = '#ff8c00';
                createExplosion(asteroid.x, asteroid.y, color);
            }
        });
    });

    asteroids.forEach(asteroid => {
        if (asteroid.active && asteroid.checkShipCollision(ship)) {
            asteroid.active = false;
            gameState.lives--;
            livesEl.textContent = gameState.lives;
            createExplosion(ship.x, ship.y, '#0ff');
            
            if (gameState.lives <= 0) {
                gameState.isGameOver = true;
                gameOverEl.style.display = 'block';
            }
        }
    });

    bullets.forEach((bullet, i) => {
        if (!bullet.active) bullets.splice(i, 1);
    });
    
    asteroids.forEach((asteroid, i) => {
        if (!asteroid.active) asteroids.splice(i, 1);
    });
    
    particles.forEach((particle, i) => {
        if (particle.life <= 0) particles.splice(i, 1);
    });

    spawnAsteroid();
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawStars();
    
    ship.draw();
    bullets.forEach(bullet => bullet.draw());
    asteroids.forEach(asteroid => asteroid.draw());
    particles.forEach(particle => particle.draw());
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.isGameOver = false;
    bullets.length = 0;
    asteroids.length = 0;
    particles.length = 0;
    ship.x = canvas.width / 2;
    ship.y = canvas.height - 80;
    scoreEl.textContent = 0;
    livesEl.textContent = 3;
    gameOverEl.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        if (gameState.isGameOver) {
            resetGame();
        } else {
            shoot();
        }
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

gameLoop();