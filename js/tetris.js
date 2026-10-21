const canvas = document.getElementById('tetris-canvas');
const context = canvas.getContext('2d');
context.scale(20, 20); // Escala cada bloco para 20x20px (Grid 12x20)

// Cores da sua paleta para as peças
const COLORS = [
  null,
  '#d65a62', // Coral (I)
  '#fce18a', // Amarelo Creme (L)
  '#88c9a1', // Menta (J)
  '#417a7a', // Verde Petróleo Claro (O)
  '#275252', // Verde Petróleo Escuro (T)
  '#e77f86', // Coral Claro (S)
  '#fbe9b1'  // Amarelo Suave (Z)
];

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function createPiece(type) {
  if (type === 'I') return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
  if (type === 'L') return [[0,2,0],[0,2,0],[0,2,2]];
  if (type === 'J') return [[0,3,0],[0,3,0],[3,3,0]];
  if (type === 'O') return [[4,4],[4,4]];
  if (type === 'T') return [[0,5,0],[5,5,5],[0,0,0]];
  if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
  if (type === 'Z') return [[7,7,0],[0,7,7],[0,0,0]];
}

const arena = createMatrix(12, 20);
const player = { pos: {x: 0, y: 0}, matrix: null, score: 0, lines: 0 };

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = COLORS[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
        context.lineWidth = 0.05;
        context.strokeStyle = '#122829';
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#122829';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  if (player.matrix) drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
    });
  });
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
    }
  }
  return false;
}

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += rowCount * 100;
    player.lines += 1;
    rowCount *= 2;
  }
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}

function playerRotate() {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -1);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir = 1) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    player.lines = 0;
    updateScore();
  }
}

function updateScore() {
  document.getElementById('tetris-score').innerText = String(player.score).padStart(4, '0');
  document.getElementById('tetris-lines').innerText = player.lines;
}

let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;
let gameRunning = false;

function update(time = 0) {
  if (!gameRunning) return;
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) playerDrop();
  draw();
  requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
  if (!gameRunning) return;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault(); // Evita rolar a página enquanto joga
  }
  if (event.key === 'ArrowLeft' || event.key === 'a') playerMove(-1);
  else if (event.key === 'ArrowRight' || event.key === 'd') playerMove(1);
  else if (event.key === 'ArrowDown' || event.key === 's') playerDrop();
  else if (event.key === 'ArrowUp' || event.key === 'w') playerRotate();
});

document.getElementById('tetris-start-btn').addEventListener('click', () => {
  if (!gameRunning) {
    gameRunning = true;
    playerReset();
    updateScore();
    update();
    startTetrisMusic(); // <-- Toca a música soviética
    document.getElementById('tetris-start-btn').innerText = "PAUSAR";
  } else {
    gameRunning = false;
    stopTetrisMusic();   // <-- Pausa a música
    document.getElementById('tetris-start-btn').innerText = "► JOGAR";
  }

});

draw(); // Renderiza estado inicial

// --- CARREGAR E TOCAR O ÁUDIO MP3 DO TETRIS ---
const tetrisAudio = new Audio('audio/tetris-theme.mp3');
tetrisAudio.loop = true; // Faz a música repetir sozinha quando acabar
tetrisAudio.volume = 0.4; // Ajusta o volume para não estourar (de 0.0 a 1.0)

function startTetrisMusic() {
  tetrisAudio.currentTime = 0; // Reinicia a música do começo
  tetrisAudio.play().catch(error => {
    console.log("Reprodução de áudio bloqueada pelo navegador até haver interação:", error);
  });
}

function stopTetrisMusic() {
  tetrisAudio.pause();
}