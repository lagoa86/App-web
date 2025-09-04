// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const cellSize = 20;

// Cobra e comida
let snake = [{x:10, y:10}];
let direction = 'RIGHT';
let food = {x:15, y:15};
let score = 0;
let playerName = '';
let stage = 1;
let speed = 8;
let frameCount = 0;
let particles = [];

// Sons
const eatSound = new Audio('assets/eat.wav');
const stageSound = new Audio('assets/stageup.wav');
const gameOverSound = new Audio('assets/gameover.wav');
const bgMusic = new Audio('assets/bg_music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;

// Telas
const loadingScreen = document.getElementById('loadingScreen');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const finalScore = document.getElementById('finalScore');

// Start e Restart
startBtn.onclick = () => {
    playerName = document.getElementById('playerName').value || 'Jogador';
    startScreen.classList.add('hidden');
    canvas.style.display = 'block';
    bgMusic.play();
    startGame();
}

restartBtn.onclick = () => {
    gameOverScreen.classList.add('hidden');
    snake = [{x:10, y:10}];
    direction = 'RIGHT';
    score = 0;
    stage = 1;
    speed = 8;
    particles = [];
    startGame();
}

// Controles
document.addEventListener('keydown', e => {
    switch(e.key){
        case 'ArrowUp': if(direction!=='DOWN') direction='UP'; break;
        case 'ArrowDown': if(direction!=='UP') direction='DOWN'; break;
        case 'ArrowLeft': if(direction!=='RIGHT') direction='LEFT'; break;
        case 'ArrowRight': if(direction!=='LEFT') direction='RIGHT'; break;
    }
});

// Game Loop 60fps
function startGame(){
    frameCount = 0;
    requestAnimationFrame(gameLoop);
}

function gameLoop(){
    frameCount++;
    if(frameCount % Math.floor(60/speed) === 0){
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Atualiza jogo
function update(){
    let head = {...snake[0]};
    if(direction==='UP') head.y--;
    if(direction==='DOWN') head.y++;
    if(direction==='LEFT') head.x--;
    if(direction==='RIGHT') head.x++;

    // Colisão
    if(head.x<0 || head.y<0 || head.x>=canvas.width/cellSize || head.y>=canvas.height/cellSize || snake.some(s=>s.x===head.x && s.y===head.y)){
        gameOver();
        return;
    }

    snake.unshift(head);

    // Comer comida
    if(head.x===food.x && head.y===food.y){
        score++;
        eatSound.play();
        spawnFood();
        createParticles(head.x*cellSize+cellSize/2, head.y*cellSize+cellSize/2, 20);
        if(score % 5 === 0){ stageUp(); }
    } else { snake.pop(); }

    updateParticles();
}

// Gera comida aleatória
function spawnFood(){
    food.x = Math.floor(Math.random() * canvas.width/cellSize);
    food.y = Math.floor(Math.random() * canvas.height/cellSize);
}

// Stage Up
function stageUp(){
    stage++;
    speed += 1;
    stageSound.play();
}

// Game Over
function gameOver(){
    gameOverSound.play();
    canvas.style.display = 'none';
    finalScore.innerText = `${playerName}, seu score: ${score}`;
    gameOverScreen.classList.remove('hidden');
}

// Partículas
function createParticles(x,y,count){
    for(let i=0;i<count;i++){
        particles.push({
            x, y,
            vx: (Math.random()-0.5)*2,
            vy: (Math.random()-0.5)*2,
            alpha:1,
            color:`hsl(${Math.random()*360},100%,50%)`
        });
    }
}

function updateParticles(){
    particles.forEach(p=>{
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
    });
    particles = particles.filter(p=>p.alpha>0);
}

// Desenha
function draw(){
    // Fundo stage
    switch(stage){
        case 1: ctx.fillStyle='rgba(20,0,50,0.2)'; break;
        case 2: ctx.fillStyle='rgba(0,20,0,0.2)'; break;
        default: ctx.fillStyle='rgba(0,0,20,0.2)'; break;
    }
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Comida
    ctx.fillStyle = '#f0f';
    ctx.fillRect(food.x*cellSize, food.y*cellSize, cellSize, cellSize);

    // Cobra com rastro neon
    snake.forEach((s,i)=>{
        let alpha = 1 - i*0.05;
        ctx.fillStyle = `rgba(0,255,255,${alpha})`;
        ctx.fillRect(s.x*cellSize, s.y*cellSize, cellSize, cellSize);
    });

    // Partículas
    particles.forEach(p=>{
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, 4,4);
        ctx.globalAlpha =1;
    });

    // Score
    ctx.fillStyle = '#0ff';
    ctx.font='20px Orbitron';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Stage: ${stage}`, 10, 60);
}
