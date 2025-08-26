document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const playButton = document.getElementById('play-button');
    const gameBoard = document.getElementById('game-board');
    const message = document.getElementById('message');
    const restartButton = document.getElementById('restart-button');
    const trophyCounter = document.getElementById('trophy-counter');

    const rows = 6;
    const cols = 7;
    let board = [];
    let currentPlayer = 1; // 1 for player, 2 for AI
    let gameOver = false;
    let trophyCount = 0;

    function updateTrophyDisplay() {
        trophyCounter.textContent = `🏆 ${trophyCount}`;
    }

    function showMainMenu() {
        updateTrophyDisplay();
        gameContainer.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    }

    function redrawBoard() {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
                cell.classList.remove('player1', 'player2');
                if (board[row][col] === 1) {
                    cell.classList.add('player1');
                } else if (board[row][col] === 2) {
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
        if (gameOver || currentPlayer !== 1) return;

        const row = getNextAvailableRow(col);
        if (row === -1) return; // Column is full

        dropPiece(row, col, currentPlayer);

        if (checkWin(currentPlayer)) {
            endGame(`Vous avez gagné !`);
            trophyCount++;
            setTimeout(showMainMenu, 2000);
        } else if (checkDraw()) {
            endGame("Match nul !");
        } else {
            switchPlayer();
            setTimeout(aiMove, 500);
        }
    }

    function findBestMove(player) {
        for (let col = 0; col < cols; col++) {
            const row = getNextAvailableRow(col);
            if (row !== -1) {
                board[row][col] = player;
                if (checkWin(player)) {
                    board[row][col] = 0;
                    return col;
                }
                board[row][col] = 0;
            }
        }
        return -1;
    }

    function aiMove() {
        if (gameOver || currentPlayer !== 2) return;

        let moveCol;
        const aiLevel = trophyCount;

        if (aiLevel >= 1) {
            const winningMove = findBestMove(2);
            if (winningMove !== -1) {
                moveCol = winningMove;
            }
        }

        if (moveCol === undefined && aiLevel >= 2) {
            const blockingMove = findBestMove(1);
            if (blockingMove !== -1) {
                moveCol = blockingMove;
            }
        }

        if (moveCol === undefined) {
            let availableCols = [];
            for (let col = 0; col < cols; col++) {
                if (getNextAvailableRow(col) !== -1) {
                    availableCols.push(col);
                }
            }
            moveCol = availableCols[Math.floor(Math.random() * availableCols.length)];
        }

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

    function getNextAvailableRow(col) {
        for (let row = rows - 1; row >= 0; row--) {
            if (board[row][col] === 0) {
                return row;
            }
        }
        return -1;
    }

    function dropPiece(row, col, player) {
        board[row][col] = player;
        redrawBoard();
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        message.textContent = currentPlayer === 1 ? "Votre tour" : "Tour de l'IA";
    }

    function checkWin(player) {
        // Horizontal
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (board[r][c] === player && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) return true;
            }
        }
        // Vertical
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c] === player && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) return true;
            }
        }
        // Diagonal Down-Right
        for (let r = 0; r <= rows - 4; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (board[r][c] === player && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) return true;
            }
        }
        // Diagonal Up-Right
        for (let r = 3; r < rows; r++) {
            for (let c = 0; c <= cols - 4; c++) {
                if (board[r][c] === player && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) return true;
            }
        }
        return false;
    }

    function checkDraw() {
        return board.every(row => row.every(cell => cell !== 0));
    }

    function endGame(msg) {
        gameOver = true;
        message.textContent = msg;
    }

    function resetBoard() {
        board = Array(rows).fill(null).map(() => Array(cols).fill(0));
    }

    function restartGame() {
        gameOver = false;
        currentPlayer = 1;
        message.textContent = "Votre tour";
        resetBoard();
        redrawBoard();
    }

    function startGame() {
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        restartGame();
    }

    // Initial load
    createBoard();
    updateTrophyDisplay();
    playButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
});
