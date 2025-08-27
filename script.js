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

    function updateTrophyDisplay() {
        trophyCounter.textContent = `🏆 ${trophyCount}`;
    }

    function showMainMenu() {
        gameOver = true; // Ensure no more moves can be made
        updateTrophyDisplay();
        gameContainer.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    }

    function redrawBoard() {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
                cell.classList.remove('player1', 'player2');
                if (board[row][col] === HUMAN_PLAYER) {
                    cell.classList.add('player1');
                } else if (board[row][col] === AI_PLAYER) {
                    cell.classList.add('player2');
                }
            }
        }
    }

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

    function handleCellClick(col) {
        if (gameOver || currentPlayer !== HUMAN_PLAYER) return;
        const row = getNextAvailableRow(col);
        if (row === -1) return;
        dropPiece(row, col, currentPlayer);
        if (checkWin(currentPlayer)) {
            endGame(`Vous avez gagné !`);
            trophyCount++;
            setTimeout(showMainMenu, 2000);
        } else if (checkDraw()) {
            endGame("Match nul !");
        } else {
            switchPlayer();
            setTimeout(aiMove, 100);
        }
    }

    function aiMove() {
        if (gameOver || currentPlayer !== AI_PLAYER) return;
        const depth = 4;
        const moveCol = findBestMoveWithMinimax(depth);
        const row = getNextAvailableRow(moveCol);
        dropPiece(row, moveCol, currentPlayer);

        if (checkWin(currentPlayer)) {
            endGame(`L'IA a gagné !`);
            trophyCount = Math.max(0, trophyCount - 1);
            setTimeout(showMainMenu, 2000);
        } else if (checkDraw()) {
            endGame("Match nul !");
        } else {
            switchPlayer();
        }
    }

    function findBestMoveWithMinimax(depth) {
        let bestScore = -Infinity;
        let bestCol = -1;
        const validLocations = getValidLocations();
        for (const col of validLocations) {
            const row = getNextAvailableRow(col);
            const tempBoard = board.map(r => r.slice());
            tempBoard[row][col] = AI_PLAYER;
            const score = minimax(tempBoard, depth - 1, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestCol = col;
            }
        }
        if (bestCol === -1) {
            bestCol = validLocations[Math.floor(Math.random() * validLocations.length)];
        }
        return bestCol;
    }

    function minimax(currentBoard, depth, alpha, beta, isMaximizing) {
        if (depth === 0 || isTerminalNode(currentBoard)) {
            return scorePosition(currentBoard, AI_PLAYER);
        }
        const validLocations = getValidLocations(currentBoard);
        if (isMaximizing) {
            let value = -Infinity;
            for (const col of validLocations) {
                const row = getNextAvailableRowInBoard(col, currentBoard);
                let b_copy = currentBoard.map(r => r.slice());
                b_copy[row][col] = AI_PLAYER;
                let new_score = minimax(b_copy, depth - 1, alpha, beta, false);
                value = Math.max(value, new_score);
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break;
            }
            return value;
        } else {
            let value = Infinity;
            for (const col of validLocations) {
                const row = getNextAvailableRowInBoard(col, currentBoard);
                let b_copy = currentBoard.map(r => r.slice());
                b_copy[row][col] = HUMAN_PLAYER;
                let new_score = minimax(b_copy, depth - 1, alpha, beta, true);
                value = Math.min(value, new_score);
                beta = Math.min(beta, value);
                if (alpha >= beta) break;
            }
            return value;
        }
    }

    function scorePosition(b, player) {
        let score = 0;
        let center_count = 0;
        for(let r = 0; r < rows; r++){
            if(b[r][Math.floor(cols/2)] == player) center_count++;
        }
        score += center_count * 3;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                score += evaluateWindow(b[r].slice(c, c+4), player);
            }
        }
        for (let c = 0; c < cols; c++) {
            let window = [];
            for (let r=0; r<rows; r++) window.push(b[r][c]);
            for (let r = 0; r <= rows - 4; r++) {
                score += evaluateWindow(window.slice(r, r+4), player);
            }
        }
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                let window = [b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3]];
                score += evaluateWindow(window, player);
            }
        }
        for (let r = 3; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                let window = [b[r][c], b[r-1][c+1], b[r-2][c+2], b[r-3][c+3]];
                score += evaluateWindow(window, player);
            }
        }
        return score;
    }

    function evaluateWindow(window, player) {
        let score = 0;
        const opp_player = player == HUMAN_PLAYER ? AI_PLAYER : HUMAN_PLAYER;
        const playerCount = window.filter(p => p === player).length;
        const oppPlayerCount = window.filter(p => p === opp_player).length;
        const emptyCount = window.filter(p => p === 0).length;

        if (playerCount === 4) {
            score += 1000;
        } else if (playerCount === 3 && emptyCount === 1) {
            score += 10;
        } else if (playerCount === 2 && emptyCount === 2) {
            score += 2;
        }

        if (oppPlayerCount === 3 && emptyCount === 1) {
            score -= 500;
        } else if (oppPlayerCount === 2 && emptyCount === 2) {
            score -= 5;
        }

        return score;
    }

    function isTerminalNode(b) {
        return checkWinInBoard(b, HUMAN_PLAYER) || checkWinInBoard(b, AI_PLAYER) || getValidLocations(b).length === 0;
    }

    function getValidLocations(b = board) {
        const valid = [];
        for (let col = 0; col < cols; col++) {
            if (getNextAvailableRowInBoard(col, b) !== -1) valid.push(col);
        }
        return valid;
    }

    function getNextAvailableRowInBoard(col, b) {
        for (let r = rows - 1; r >= 0; r--) {
            if (b[r][col] === 0) return r;
        }
        return -1;
    }

    function checkWinInBoard(b, player) {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (b[r][c] === player && b[r][c+1] === player && b[r][c+2] === player && b[r][c+3] === player) return true;
            }
        }
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c < cols; c++) {
                if (b[r][c] === player && b[r+1][c] === player && b[r+2][c] === player && b[r+3][c] === player) return true;
            }
        }
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (b[r][c] === player && b[r+1][c+1] === player && b[r+2][c+2] === player && b[r+3][c+3] === player) return true;
            }
        }
        for (let r = 3; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (b[r][c] === player && b[r-1][c+1] === player && b[r-2][c+2] === player && b[r-3][c+3] === player) return true;
            }
        }
        return false;
    }

    function getNextAvailableRow(col) { return getNextAvailableRowInBoard(col, board); }
    function dropPiece(row, col, player) { board[row][col] = player; redrawBoard(); }
    function switchPlayer() { currentPlayer = (currentPlayer === HUMAN_PLAYER) ? AI_PLAYER : HUMAN_PLAYER; message.textContent = currentPlayer === 1 ? "Votre tour" : "Tour de l'IA"; }
    function checkWin(player) { return checkWinInBoard(board, player); }
    function checkDraw() { return getValidLocations().length === 0; }
    function endGame(msg) { gameOver = true; message.textContent = msg; }
    function resetBoard() { board = Array(rows).fill(null).map(() => Array(cols).fill(0)); }

    function restartGame() {
        gameOver = false;
        currentPlayer = HUMAN_PLAYER;
        message.textContent = "Votre tour";
        resetBoard();
        redrawBoard();
    }

    function startGame() {
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        restartGame();
    }

    createBoard();
    updateTrophyDisplay();
    playButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    backToMenuButton.addEventListener('click', showMainMenu);
});
