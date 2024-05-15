const battleships = {
    destroyer: {
        size: [
            [true, true]
        ],
        icon: 'N/A'
    },
    submarine: {
        size: [
            [true, true, true]
        ],
        icon: 'N/A'
    },
    cruiser: {
        size: [
            [true, true, true]
        ],
        icon: 'N/A'
    },
    battleship: {
        size: [
            [true, true, true, true]
        ],
        icon: 'N/A'
    },
    aircraftCarrier: {
        size: [
            [true, true, true, true, true]
        ],
        icon: 'N/A'
    },
    oilRig: {
        size: [
            [true, true],
            [true, true]
        ],
        icon: 'N/A'
    },
    oilTanker: {
        size: [
            [true, true, true],
            [true, true, true]
        ],
        icon: 'N/A'
    },
    customShip3: {
        size: [
            [true, false, false],
            [true, true, true],
            [true, false, false]
        ],
        icon: 'N/A'
    }
};

let battleshipShips = {
    plr: {},
    ai: {},
};

let battleshipInventory = {};
let gameStarted;
let gridContainer2;
let gridContainer1;
let enemyGuessMathHelper;
let enemyBoard;
let aiGuess;
let lastHoveredTile;
let selectedShip;
let shipName;
const gameStateElement = document.querySelector('.gameState');
const fixedWindow = document.querySelector('.fixed-window');

function createGrid(containerId) {
    let gridContainer = document.getElementById(containerId);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let cell = document.createElement('div');
        cell.classList.add('grid-item');
        cell.dataset.row = i;
        cell.dataset.column = j;
        cell.dataset.state = 0;

        gridContainer.appendChild(cell);
        }
    }
    if (containerId === 'gridContainer1') {
        gridContainer.addEventListener('click', function(event) {
            if (event.target.classList.contains('grid-item') && gameStarted) {
                let row = parseInt(event.target.dataset.row);
                let col = parseInt(event.target.dataset.column);
                if (enemyBoard[row][col] === 1) {
                    event.target.style.backgroundColor = 'red'; 
                    const position = (row * 10) + col;
                    shipdestroyer(position, event.target.dataset.object, "ai", "plr")
                } else {
                    event.target.style.backgroundColor = 'gray'; 
                }
                enemyAttack()
            }
        });
    }
};

function shipdestroyer(num, name, player, winner) {
    battleshipShips[player][name] = battleshipShips[player][name].filter(number => number !== num);
    if (battleshipShips[player][name].length === 0) {
        delete battleshipShips[player][name]

        if ( Object.keys(battleshipShips[player]).length === 0) {
            if (winner === 'plr') {
                gameStateElement.textContent = "You win!";
            } else {
                gameStateElement.textContent = "You lose.";
            }
            gameStarted = false
        }
    }
};

function enemyAttack() {
    const randomNumber = Math.floor(Math.random() * enemyGuessMathHelper)
    enemyGuessMathHelper--
    let gridItems = gridContainer2.getElementsByClassName("grid-item");

    let targetGridItem = gridItems[aiGuess[randomNumber]];
    if (targetGridItem.dataset.state === '1') {
        targetGridItem.style.backgroundColor = 'red';
        shipdestroyer(aiGuess[randomNumber], targetGridItem.dataset.object, "plr", "ai")
    } else {
        targetGridItem.style.backgroundColor = 'gray';
    }
    aiGuess[randomNumber] = aiGuess[enemyGuessMathHelper]
};


function createFixedBox() {
    let battleshipsArray = Object.keys(battleshipInventory);

    for (var i = 1; i <= battleshipsArray.length; i++) {
        var newItem = document.createElement('div');
        newItem.className = 'box';
        newItem.innerHTML = '<p>' + battleshipsArray[i - 1] + '</p>';
        fixedWindow.appendChild(newItem);
    }

    fixedWindow.addEventListener('click', function(event) {
        let target = event.target;
        if (event.target.parentNode.classList.contains('box')) {
            target = event.target.parentNode;
        }

        if (target.classList.contains('box')) {
            let previousSelection = document.querySelector('.box.selected');
            if (previousSelection) {
                previousSelection.classList.remove('selected');
            }

            target.classList.add('selected');
            selectedShip = battleshipInventory[target.textContent];
            shipName = target.textContent
            gridContainer2.addEventListener('mouseover', previewShip);
            gridContainer2.addEventListener('mouseout', removePreview);
            gridContainer2.addEventListener('click', placeShip);
            }
        }
    );
};

function newGame(difficulty) {
    battleshipShips.plr = {};
    battleshipShips.ai = {};
    gameStarted = false
    gameStateElement.textContent = 'Placement';
    let previousSelection = document.querySelector('.box.selected');
    if (previousSelection) {
        previousSelection.classList.remove('selected');
    }

    enemyBoard = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    


      function enemyAIFunction() {
        if (difficulty) {
            
            switch (difficulty) { // Still a W.I.P.
                case "easy":
                    aiGuess = [
                        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
                        10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
                        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
                        30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
                        40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
                        50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
                        60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
                        70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
                        80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
                        90, 91, 92, 93, 94, 95, 96, 97, 98, 99
                    ];
                    enemyGuessMathHelper = 100
                    break;
                    
                case "medium":
    
    
    
    
                    break;
    
                case "hard":
    
    
    
                    break;
            }

        } else { // this should never happen, if it does the world will end
            return false;
        }
    }
    enemyAIFunction()
    
    fixedWindow.innerHTML = '<h2>Fixed Window</h2>';
    createFixedBox();
    

    gridContainer1.querySelectorAll('.grid-item').forEach(cell => {
        cell.dataset.state = 0;
        cell.style.backgroundColor = '';
    });
 
    let gridContainer2 = document.getElementById('gridContainer2');
    gridContainer2.querySelectorAll('.grid-item').forEach(cell => {
        cell.dataset.state = 0;
        cell.style.backgroundColor = '';
    });


    gridContainer2.removeEventListener('mouseover', previewShip);
    gridContainer2.removeEventListener('mouseout', removePreview);
    gridContainer2.removeEventListener('click', placeShip);
    removePreview();
    lastHoveredTile = null 
};

window.onload = function() {
    // This runs instantly, do NOT make another window.onload, everything will burn.
    createGrid('gridContainer1');
    createGrid('gridContainer2');
    newGame('easy')
    let count = 0;
    for (let ship in battleships) {
        if (count >= 5) break;
        battleshipInventory[ship] = battleships[ship];
        count++;
    };
    createFixedBox();
    gridContainer1 = document.getElementById("gridContainer1");
    gridContainer2 = document.getElementById("gridContainer2");
    gridContainer2.addEventListener('mouseover', previewShip);
    gridContainer2.addEventListener('mouseout', removePreview);
};

function placeShip(event) {
    let target = event.target;
    if (event.type === 'click' && target.classList.contains('grid-item') && target.parentNode.id === 'gridContainer2') {
        let row = parseInt(target.dataset.row);
        let column = parseInt(target.dataset.column);
        let canPlace = true;
        for (let i = 0; i < selectedShip.size.length; i++) {
            for (let j = 0; j < selectedShip.size[i].length; j++) {
                if (selectedShip.size[i][j]) {
                    if (row + i < 0 || row + i >= 10 || column + j < 0 || column + j >= 10) {
                        canPlace = false;
                        break;
                    }
                    let cell = document.querySelector(`#gridContainer2 [data-row="${row + i}"][data-column="${column + j}"]`);
                    if (cell && cell.dataset.state === '1') {
                        canPlace = false;
                        break;
                    }
                }
            }
            if (!canPlace) break;
        }
        

        if (canPlace) {

            for (let i = 0; i < selectedShip.size.length; i++) {
                for (let j = 0; j < selectedShip.size[i].length; j++) {
                    if (selectedShip.size[i][j]) {
                        let cell = document.querySelector(`#gridContainer2 [data-row="${row + i}"][data-column="${column + j}"]`);
                        if (!battleshipShips.plr[shipName]) {
                            battleshipShips.plr[shipName] = [];
                        }

                        const position = parseInt(cell.dataset.row) * 10 + parseInt(cell.dataset.column);
                        battleshipShips.plr[shipName].push(position)
                        
                        if (cell) {
                            cell.dataset.state = 1;
                            cell.dataset.object = shipName;
                            cell.style.backgroundColor = 'green';
                        let previousSelection = document.querySelector('.box.selected');
                        if (previousSelection) {
                            previousSelection.parentNode.removeChild(previousSelection);
                            }
                        }
                    }
                }   
            }

            if (!gameStarted && fixedWindow.childNodes.length === 1) {
                gameStarted = true;
                enemyShipPlacer()
                gameStateElement.textContent = 'Game started';
                }
            gridContainer2.removeEventListener('mouseover', previewShip);
            gridContainer2.removeEventListener('mouseout', removePreview);
            gridContainer2.removeEventListener('click', placeShip);
            lastHoveredTile = null
        }
    }
};

function enemyShipPlacer() {
    const shipSizes = [2, 3, 3, 4, 5];
    const shipNames = ["destroyer", "submarine", "cruiser", "battleship", "aircraftCarrier"]
    
    function placeEnemyShip(shipSize) {
        const isHorizontal = Math.random() < 0.5;
    
        let row, col;
        if (isHorizontal) {
            row = Math.floor(Math.random() * 10);
            col = Math.floor(Math.random() * (10 - shipSize + 1));
        } else {
            row = Math.floor(Math.random() * (10 - shipSize + 1));
            col = Math.floor(Math.random() * 10);
        }
    
        let isValid = true;
        for (let i = 0; i < shipSize; i++) {
            if (isHorizontal) {
                if (enemyBoard[row][col + i] !== 0) {
                    isValid = false;
                    break;
                }
            } else {
                if (enemyBoard[row + i][col] !== 0) {
                    isValid = false;
                    break;
                }
            }
        }
    
        if (isValid) {

            if (!battleshipShips.ai[shipNames]) {
                battleshipShips.ai[shipNames] = [];
            }

            let position

            for (let i = 0; i < shipSize; i++) {
                if (isHorizontal) {
                    let square = gridContainer1.querySelector(`.grid-item[data-row="${row}"][data-column="${col + i}"]`);
                    enemyBoard[row][col + i] = 1;
                    square.dataset.object = shipNames;
                    
                    square
                    position = parseInt(row) * 10 + parseInt(col + i);
                    battleshipShips.ai[shipNames].push(position)
                } else {
                    let square = gridContainer1.querySelector(`.grid-item[data-row="${row + i}"][data-column="${col}"]`);
                    enemyBoard[row + i][col] = 1;
                    square.dataset.object = shipNames;

                    position = parseInt(row + i) * 10 + parseInt(col);
                    battleshipShips.ai[shipNames].push(position)
                }
            }
        } else {
            placeEnemyShip(shipSize);
        }
    }    
    // Loop through each ship size, unoptimal but I am too lazy to make a perfect ai ship placer
    shipSizes.forEach(shipSize => {
        placeEnemyShip(shipSize)
    });
};

function previewShip(event) {
    let target = event.target;
    if (typeof selectedShip !== 'undefined') {
        if (selectedShip && target.classList.contains('grid-item') && target.parentNode.id === 'gridContainer2') {
            lastHoveredTile = event;
            let row = parseInt(target.dataset.row);
            let column = parseInt(target.dataset.column);
            let overlaps = false;
            let offBoard = false;
            
            for (let i = 0; i < selectedShip.size.length; i++) {
                for (let j = 0; j < selectedShip.size[i].length; j++) {
                    if (selectedShip.size[i][j]) {
                        let cell = document.querySelector(`#gridContainer2 [data-row="${row + i}"][data-column="${column + j}"]`);
                        if (cell) {
                            if (cell.dataset.state === '1') {
                                overlaps = true;
                                cell.style.backgroundColor = 'red';
                            } else if (cell.style.backgroundColor !== 'red') {
                                cell.style.backgroundColor = 'lightgray';
                            }
                        } else {
                            offBoard = true;
                        }
                    }
                }
            }
            
            if (offBoard) {
                let cells = document.querySelectorAll('#gridContainer2 .grid-item');
                cells.forEach(cell => {
                    if (cell.style.backgroundColor === 'lightgray') {
                        cell.style.backgroundColor = 'red';
                    }
                });
            }
        }
    }
};


document.addEventListener('keydown', function(event) {
    if (event.key === 'r' || event.key === 'R') {
        removePreview();
        rotateShip();
        if (lastHoveredTile) {
            previewShip(lastHoveredTile);
        }
    }
});




function rotateShip() {
    if (selectedShip) {
        selectedShip.size = selectedShip.size[0].map((_, colIndex) =>
            selectedShip.size.map(row => row[colIndex]).reverse()
        );
    }
};


function removePreview() {
    let cells = document.querySelectorAll('#gridContainer2 .grid-item');
    cells.forEach(cell => {
        cell.style.backgroundColor = '';
    });
};

document.getElementById('btnNewGame').addEventListener('click', function() {
    newGame("easy"); // Forced to start new game on easy as its the only difficulty to exist
});
