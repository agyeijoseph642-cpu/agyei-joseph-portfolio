// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const gameStatusDisplay = document.getElementById('gameStatus');

// Game variables
let gameRunning = false;
let gamePaused = false;

// Paddle properties
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

// Player paddle (left side)
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

// Computer paddle (right side)
const computerPaddle = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 6,
    dx: 5,
    dy: 5
};

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

// Keyboard events
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Space bar to pause/resume
    if (e.key === ' ') {
        e.preventDefault();
        if (gameRunning) {
            gamePaused = !gamePaused;
            updateGameStatus();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Click to start
canvas.addEventListener('click', () => {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        updateGameStatus();
        gameLoop();
    }
});

// Update game status display
function updateGameStatus() {
    if (!gameRunning) {
        gameStatusDisplay.textContent = 'Click to Start';
        gameStatusDisplay.classList.remove('paused', 'playing');
    } else if (gamePaused) {
        gameStatusDisplay.textContent = '⏸️ PAUSED - Press SPACE to Resume';
        gameStatusDisplay.classList.add('paused');
        gameStatusDisplay.classList.remove('playing');
    } else {
        gameStatusDisplay.textContent = '▶️ PLAYING - Press SPACE to Pause';
        gameStatusDisplay.classList.add('playing');
        gameStatusDisplay.classList.remove('paused');
    }
}

// Move player paddle
function movePlayerPaddle() {
    // Arrow keys movement
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        playerPaddle.y = Math.max(0, playerPaddle.y - paddleSpeed);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        playerPaddle.y = Math.min(canvas.height - playerPaddle.height, playerPaddle.y + paddleSpeed);
    }
    
    // Mouse movement
    const mouseMargin = 40; // Distance from center to move paddle
    const targetY = mouseY - playerPaddle.height / 2;
    if (targetY < playerPaddle.y - mouseMargin) {
        playerPaddle.y = Math.max(0, playerPaddle.y - paddleSpeed);
    } else if (targetY > playerPaddle.y + mouseMargin) {
        playerPaddle.y = Math.min(canvas.height - playerPaddle.height, playerPaddle.y + paddleSpeed);
    }
}

// Move computer paddle (AI)
function moveComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const difficulty = 4; // Adjust for difficulty (higher = harder)
    
    if (computerCenter < ball.y - difficulty) {
        computerPaddle.y = Math.min(canvas.height - computerPaddle.height, computerPaddle.y + paddleSpeed);
    } else if (computerCenter > ball.y + difficulty) {
        computerPaddle.y = Math.max(0, computerPaddle.y - paddleSpeed);
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy *= -1;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Player paddle collision
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx *= -1;
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2);
        ball.dy += hitPos * 4;
        
        // Increase speed slightly
        ball.dx *= 1.05;
    }
    
    // Computer paddle collision
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx *= -1;
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computerPaddle.y + computerPaddle.height / 2)) / (computerPaddle.height / 2);
        ball.dy += hitPos * 4;
        
        // Increase speed slightly
        ball.dx *= 1.05;
    }
    
    // Score points
    if (ball.x - ball.radius < 0) {
        computerPaddle.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        playerPaddle.score++;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() * 6 - 3);
    
    // Update scores
    playerScoreDisplay.textContent = playerPaddle.score;
    computerScoreDisplay.textContent = computerPaddle.score;
}

// Draw rectangle
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Draw circle
function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw center line (dashed)
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Render game
function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#1a1a2e');
    
    // Draw center line
    drawCenterLine();
    
    // Draw paddles
    drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#00d4ff');
    drawRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#ff006e');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#ffd700');
    
    // Draw borders
    drawRect(0, 0, canvas.width, 2, 'white');
    drawRect(0, canvas.height - 2, canvas.width, 2, 'white');
}

// Main game loop
function gameLoop() {
    if (!gamePaused) {
        movePlayerPaddle();
        moveComputerPaddle();
        updateBall();
    }
    
    render();
    
    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Initialize
updateGameStatus();
render();
