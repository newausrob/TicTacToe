const cells = document.querySelectorAll('.cell');
const resetButton = document.getElementById('reset-button');
const toggleBotButton = document.getElementById('toggle-bot-button');
const chooseXButton = document.getElementById('choose-x');
const chooseOButton = document.getElementById('choose-o');
const easyButton = document.getElementById('easy');
const mediumButton = document.getElementById('medium');
const hardButton = document.getElementById('hard');
const currentPlayerDisplay = document.getElementById('current-player');
const botIndicator = document.getElementById('bot-indicator');
let currentPlayer = 'X';
let playerMark = 'X';
let botMark = 'O';
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let botEnabled = false;
let botThinking = false;
let botDifficulty = 'easy';  // Default bot difficulty

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

resetButton.addEventListener('click', resetGame);
toggleBotButton.addEventListener('click', toggleBot);
chooseXButton.addEventListener('click', () => choosePlayerMark('X'));
chooseOButton.addEventListener('click', () => choosePlayerMark('O'));
easyButton.addEventListener('click', () => setBotDifficulty('easy'));
mediumButton.addEventListener('click', () => setBotDifficulty('medium'));
hardButton.addEventListener('click', () => setBotDifficulty('hard'));

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive || botThinking) {
        return;
    }

    updateCell(clickedCell, clickedCellIndex);
    checkResult();

    if (botEnabled && gameActive && currentPlayer === botMark) {
        botThinking = true;
        setTimeout(botMove, 500);  // Adding delay for better UX
    }
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    currentPlayerDisplay.textContent = currentPlayer;
}

function checkResult() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        const a = board[winCondition[0]];
        const b = board[winCondition[1]];
        const c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            highlightWinningCells(winCondition);
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        alert(`Player ${currentPlayer === 'X' ? 'O' : 'X'} wins!`);
        return;
    }

    if (!board.includes('')) {
        gameActive = false;
        alert('Game is a draw!');
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    botThinking = false;
    currentPlayer = playerMark;
    currentPlayerDisplay.textContent = currentPlayer;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('crossed');
    });
    if (botEnabled && currentPlayer === botMark) {
        botThinking = true;
        setTimeout(botMove, 500);  // Adding delay for better UX
    }
}

function toggleBot() {
    botEnabled = !botEnabled;
    botIndicator.textContent = botEnabled ? 'ON' : 'OFF';
    resetGame();
}

function choosePlayerMark(mark) {
    playerMark = mark;
    botMark = mark === 'X' ? 'O' : 'X';
    resetGame();
}

function setBotDifficulty(difficulty) {
    botDifficulty = difficulty;
}

function botMove() {
    if (!gameActive) return;

    switch(botDifficulty) {
        case 'easy':
            easyBotMove();
            break;
        case 'medium':
            mediumBotMove();
            break;
        case 'hard':
            hardBotMove();
            break;
    }

    botThinking = false;
}

function easyBotMove() {
    let availableCells = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            availableCells.push(i);
        }
    }
    const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    const cell = document.querySelector(`.cell[data-index='${randomIndex}']`);
    updateCell(cell, randomIndex);
    checkResult();
}

function mediumBotMove() {
    let moveMade = false;

    // Check if bot can win
    moveMade = tryToWinOrBlock(botMark);

    // Block player's winning move
    if (!moveMade) {
        moveMade = tryToWinOrBlock(playerMark);
    }

    // Pick a random available cell if no winning or blocking move was made
    if (!moveMade) {
        easyBotMove();
    }
}

function hardBotMove() {
    let bestMove = minimax(board, botMark).index;
    if (bestMove !== undefined) {
        const cell = document.querySelector(`.cell[data-index='${bestMove}']`);
        if (cell !== null) {
            updateCell(cell, bestMove);
            checkResult();
        }
    }
}

function tryToWinOrBlock(mark) {
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        const a = board[winCondition[0]];
        const b = board[winCondition[1]];
        const c = board[winCondition[2]];

        if (a === mark && b === mark && c === '') {
            updateCell(document.querySelector(`.cell[data-index='${winCondition[2]}']`), winCondition[2]);
            checkResult();
            return true;
        } else if (a === mark && b === '' && c === mark) {
            updateCell(document.querySelector(`.cell[data-index='${winCondition[1]}']`), winCondition[1]);
            checkResult();
            return true;
        } else if (a === '' && b === mark && c === mark) {
            updateCell(document.querySelector(`.cell[data-index='${winCondition[0]}']`), winCondition[0]);
            checkResult();
            return true;
        }
    }
    return false;
}

function minimax(newBoard, player) {
    let availSpots = emptyIndexes(newBoard);

    if (winning(newBoard, playerMark)) {
        return { score: -10 };
    } else if (winning(newBoard, botMark)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player == botMark) {
            let result = minimax(newBoard, playerMark);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, botMark);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === botMark) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function emptyIndexes(board) {
    return board.reduce((acc, val, idx) => (val === '' ? acc.concat(idx) : acc), []);
}

function winning(board, player) {
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
}

function highlightWinningCells(winCondition) {
    winCondition.forEach(index => {
        document.querySelector(`.cell[data-index='${index}']`).classList.add('crossed');
    });
}
