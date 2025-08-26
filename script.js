document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.getElementById('game-container');
    const playButton = document.getElementById('play-button');
    const gameBoard = document.getElementById('game-board');
    const message = document.getElementById('message');
    const restartButton = document.getElementById('restart-button');

    const rows = 6;
    const cols = 7;
    let board = [];
    let currentPlayer = 1; // 1 for player, 2 for AI
    let gameOver = false;

    function showMainMenu() {
        gameContainer.classList.add('hidden');
        mainMenu.classList.remove('hidden');
    }

    function createBoard() {
        gameBoard.innerHTML = '';
        board = [];
        for (let row = 0; row < rows; row++) {
            board[row] = [];
            for (let col = 0; col < cols; col++) {
                board[row][col] = 0;
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
            setTimeout(showMainMenu, 2000); // Return to main menu after 2 seconds
        } else if (checkDraw()) {
            endGame("Match nul !");
        } else {
            switchPlayer();
            setTimeout(aiMove, 500); // AI's turn after a short delay
        }
    }

    function aiMove() {
        if (gameOver || currentPlayer !== 2) return;

        let availableCols = [];
        for (let col = 0; col < cols; col++) {
            if (getNextAvailableRow(col) !== -1) {
                availableCols.push(col);
            }
        }

        const randomCol = availableCols[Math.floor(Math.random() * availableCols.length)];
        const row = getNextAvailableRow(randomCol);

        dropPiece(row, randomCol, currentPlayer);

        if (checkWin(currentPlayer)) {
            endGame(`L'IA a gagné !`);
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
        return -1; // No available row in this column
    }

    function dropPiece(row, col, player) {
        board[row][col] = player;
        const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
        cell.classList.add(`player${player}`);
    }

    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        message.textContent = currentPlayer === 1 ? "Votre tour" : "Tour de l'IA";
    }

    function checkWin(player) {
        // Check horizontal
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col <= cols - 4; col++) {
                if (board[row][col] === player &&
                    board[row][col + 1] === player &&
                    board[row][col + 2] === player &&
                    board[row][col + 3] === player) {
                    return true;
                }
            }
        }

        // Check vertical
        for (let row = 0; row <= rows - 4; row++) {
            for (let col = 0; col < cols; col++) {
                if (board[row][col] === player &&
                    board[row + 1][col] === player &&
                    board[row + 2][col] === player &&
                    board[row + 3][col] === player) {
                    return true;
                }
            }
        }

        // Check diagonal (down-right)
        for (let row = 0; row <= rows - 4; row++) {
            for (let col = 0; col <= cols - 4; col++) {
                if (board[row][col] === player &&
                    board[row + 1][col + 1] === player &&
                    board[row + 2][col + 2] === player &&
                    board[row + 3][col + 3] === player) {
                    return true;
                }
            }
        }

        // Check diagonal (up-right)
        for (let row = 3; row < rows; row++) {
            for (let col = 0; col <= cols - 4; col++) {
                if (board[row][col] === player &&
                    board[row - 1][col + 1] === player &&
                    board[row - 2][col + 2] === player &&
                    board[row - 3][col + 3] === player) {
                    return true;
                }
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

    function restartGame() {
        gameOver = false;
        currentPlayer = 1;
        message.textContent = "Votre tour";
        createBoard();
    }

    function startGame() {
        mainMenu.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        restartGame();
    }

    playButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);

});
