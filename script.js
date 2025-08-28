document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const playButton = document.getElementById('play-button');
    const gameBoard = document.getElementById('game-board');
    const message = document.getElementById('message');
    const restartButton = document.getElementById('restart-button');
    const backToMenuButton = document.getElementById('back-to-menu-button');
    const trophyCounter = document.getElementById('trophy-counter');

    const rows = 6;
    const cols = 7;
    let board = [];
    let currentPlayer = 1;
    const AI_PLAYER = 2;
    const HUMAN_PLAYER = 1;
    let gameOver = false;
    let trophyCount = 0;

    // --- Utility Functions ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- UI Update Functions ---
    function updateTrophyDisplay() {
        trophyCounter.textContent = `🏆 ${trophyCount}`;
    }

    function showMainMenu() {
        gameOver = true;
        updateTrophyDisplay();
        gameContainer.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    }

    function redrawBoard(winningLine = []) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
                cell.classList.remove('player1', 'player2', 'winning-piece');
                if (board[row][col] === HUMAN_PLAYER) {
                    cell.classList.add('player1');
                } else if (board[row][col] === AI_PLAYER) {
                    cell.classList.add('player2');
                }
                if (winningLine.some(p => p.r === row && p.c === col)) {
                    cell.classList.add('winning-piece');
                }
            }
        }
    }

    // --- Game Setup ---
    function createBoard() {
        gameBoard.innerHTML = '';
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => handleCellClick(col));
                gameBoard.appendChild(cell);
            }
        }
    }

    function startGame() {
        board = Array(rows).fill(null).map(() => Array(cols).fill(0));
        currentPlayer = HUMAN_PLAYER;
        gameOver = false;
        message.textContent = '';
        createBoard();
        redrawBoard();
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
    }

    // --- Game Logic ---
    function getNextAvailableRow(col) {
        for (let row = rows - 1; row >= 0; row--) {
            if (board[row][col] === 0) {
                return row;
            }
        }
        return -1; // Column is full
    }

    function dropPiece(row, col, player) {
        board[row][col] = player;
        redrawBoard();
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === HUMAN_PLAYER) ? AI_PLAYER : HUMAN_PLAYER;
    }

    function endGame(endMessage, winningLine = []) {
        message.textContent = endMessage;
        gameOver = true;
        redrawBoard(winningLine);
        setTimeout(showMainMenu, 2000);
    }

    function checkDraw() {
        return board[0].every(cell => cell !== 0);
    }

    function checkWin(player) {
        // Horizontal
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (board[r][c] === player && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) {
                    return [{r,c},{r,c:c+1},{r,c:c+2},{r,c:c+3}];
                }
            }
        }
        // Vertical
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c] === player && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) {
                    return [{r,c},{r:r+1,c},{r:r+2,c},{r:r+3,c}];
                }
            }
        }
        // Diagonal Down-Right
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (board[r][c] === player && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) {
                    return [{r,c},{r:r+1,c:c+1},{r:r+2,c:c+2},{r:r+3,c:c+3}];
                }
            }
        }
        // Diagonal Up-Right
        for (let r = 3; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (board[r][c] === player && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) {
                    return [{r,c},{r:r-1,c:c+1},{r:r-2,c:c+2},{r:r-3,c:c+3}];
                }
            }
        }
        return null;
    }

    // --- Player and AI Moves ---
    function handleCellClick(col) {
        if (gameOver || currentPlayer !== HUMAN_PLAYER) return;
        const row = getNextAvailableRow(col);
        if (row === -1) return;
        dropPiece(row, col, currentPlayer);

        const winningLine = checkWin(currentPlayer);
        if (winningLine) {
            trophyCount++;
            endGame(`Vous avez gagné !`, winningLine);
        } else if (checkDraw()) {
            endGame("Match nul !");
        } else {
            switchPlayer();
            setTimeout(aiMove, 100);
        }
    }

    function aiMove() {
        if (gameOver || currentPlayer !== AI_PLAYER) return;

        let moveCol;
        if (trophyCount <= 4) { // Niveau 0: Aléatoire
            moveCol = findRandomMove();
        } else if (trophyCount <= 9) { // Niveau 1: Offensif simple
            moveCol = findBestMove_Lvl1();
        } else if (trophyCount <= 14) { // Niveau 2: Offensif & Défensif
            moveCol = findBestMove_Lvl2();
        } else if (trophyCount <= 20) { // Niveau 3: Minimax (depth 1)
            moveCol = findBestMoveWithMinimax(1);
        } else if (trophyCount <= 28) { // Niveau 4: Minimax (depth 2)
            moveCol = findBestMoveWithMinimax(2);
        } else { // Niveau 5 (29+ trophées): Minimax (depth 3)
            moveCol = findBestMoveWithMinimax(3);
        }

        const row = getNextAvailableRow(moveCol);
        if (row !== -1) {
            dropPiece(row, moveCol, currentPlayer);
            const winningLine = checkWin(currentPlayer);
            if (winningLine) {
                trophyCount = Math.max(0, trophyCount - 1);
                endGame(`L'IA a gagné !`, winningLine);
            } else if (checkDraw()) {
                endGame("Match nul !");
            } else {
                switchPlayer();
            }
        }
    }

    // --- AI Brains ---
    function findRandomMove() {
        let validMoves = [];
        for (let c = 0; c < cols; c++) {
            if (board[0][c] === 0) {
                validMoves.push(c);
            }
        }
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    function findBestMove_Lvl1() {
        // 1. Check for winning move
        for (let c = 0; c < cols; c++) {
            const r = getNextAvailableRow(c);
            if (r !== -1) {
                board[r][c] = AI_PLAYER;
                if (checkWin(AI_PLAYER)) {
                    board[r][c] = 0; // backtrack
                    return c;
                }
                board[r][c] = 0; // backtrack
            }
        }
        // 2. Fallback to random
        return findRandomMove();
    }

    function findBestMove_Lvl2() {
        // 1. Check for winning move
        for (let c = 0; c < cols; c++) {
            const r = getNextAvailableRow(c);
            if (r !== -1) {
                board[r][c] = AI_PLAYER;
                if (checkWin(AI_PLAYER)) {
                    board[r][c] = 0; // backtrack
                    return c;
                }
                board[r][c] = 0; // backtrack
            }
        }
        // 2. Check for blocking move
        for (let c = 0; c < cols; c++) {
            const r = getNextAvailableRow(c);
            if (r !== -1) {
                board[r][c] = HUMAN_PLAYER;
                if (checkWin(HUMAN_PLAYER)) {
                    board[r][c] = 0; // backtrack
                    return c;
                }
                board[r][c] = 0; // backtrack
            }
        }
        // 3. Prefer center
        const preferredCols = shuffleArray([3, 4, 2, 5, 1, 6, 0]);
        for (const c of preferredCols) {
            if (getNextAvailableRow(c) !== -1) {
                return c;
            }
        }
        return findRandomMove(); // Fallback
    }

    function findBestMoveWithMinimax(depth) {
        let bestScore = -Infinity;
        let bestMoves = [];
        const validMoves = shuffleArray([...Array(cols).keys()].filter(c => getNextAvailableRow(c) !== -1));

        for (const col of validMoves) {
            const row = getNextAvailableRow(col);
            board[row][col] = AI_PLAYER;
            let score = minimax(depth - 1, false, -Infinity, Infinity);
            board[row][col] = 0; // backtrack

            if (score > bestScore) {
                bestScore = score;
                bestMoves = [col]; // New best score, start a new list of moves
            } else if (score === bestScore) {
                bestMoves.push(col); // Same best score, add to list
            }
        }

        if (bestMoves.length > 0) {
            // Choose a random move from the best options
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }

        return findRandomMove(); // Fallback if no moves found
    }

    function minimax(depth, isMaximizing, alpha, beta) {
        if (depth === 0 || checkWin(HUMAN_PLAYER) || checkWin(AI_PLAYER) || checkDraw()) {
            return scorePosition(depth);
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            const validMoves = shuffleArray([...Array(cols).keys()].filter(c => getNextAvailableRow(c) !== -1));
            for (const col of validMoves) {
                const row = getNextAvailableRow(col);
                board[row][col] = AI_PLAYER;
                let score = minimax(depth - 1, false, alpha, beta);
                board[row][col] = 0;
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else { // Minimizing
            let minScore = Infinity;
            const validMoves = shuffleArray([...Array(cols).keys()].filter(c => getNextAvailableRow(c) !== -1));
            for (const col of validMoves) {
                const row = getNextAvailableRow(col);
                board[row][col] = HUMAN_PLAYER;
                let score = minimax(depth - 1, true, alpha, beta);
                board[row][col] = 0;
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }

    function scorePosition(depth) {
        let score = 0;
        // Center column preference
        for(let r=0; r<rows; r++){
            if(board[r][Math.floor(cols/2)] === AI_PLAYER) score += 3;
        }
        // Score windows
        score += scoreWindow(4, AI_PLAYER, 10000 + depth * 100);
        score += scoreWindow(3, AI_PLAYER, 5 + depth * 2);
        score += scoreWindow(2, AI_PLAYER, 2);
        score -= scoreWindow(4, HUMAN_PLAYER, 10000 + depth * 100);
        score -= scoreWindow(3, HUMAN_PLAYER, 50 + depth * 5); // Block more aggressively
        return score;
    }

    function scoreWindow(length, player, points) {
        let score = 0;
        // Horizontal
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - length; c++) {
                const window = board[r].slice(c, c + length);
                if (window.filter(p => p === player).length === length) score += points;
            }
        }
        // Vertical
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r <= rows - length; r++) {
                const window = [];
                for(let i=0; i<length; i++) window.push(board[r+i][c]);
                if (window.filter(p => p === player).length === length) score += points;
            }
        }
        // Diagonals
        for (let r = 0; r <= rows - length; r++) {
            for (let c = 0; c <= cols - length; c++) {
                const window = [];
                for(let i=0; i<length; i++) window.push(board[r+i][c+i]);
                if (window.filter(p => p === player).length === length) score += points;
            }
        }
        for (let r = length - 1; r < rows; r++) {
            for (let c = 0; c <= cols - length; c++) {
                const window = [];
                for(let i=0; i<length; i++) window.push(board[r-i][c+i]);
                if (window.filter(p => p === player).length === length) score += points;
            }
        }
        return score;
    }

    // --- Event Listeners ---
    playButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    backToMenuButton.addEventListener('click', showMainMenu);

    // --- Initial Call ---
    showMainMenu();
});
