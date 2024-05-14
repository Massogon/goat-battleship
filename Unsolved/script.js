// Make sure to minimize these
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
}
let aiGuess

let enemyGuessMathHelper

let gridContainer2



let battleshipShips = {
    plr1: {},
    plr2: {},
}

let selectedShip

function newGame(difficulty) {
    
    battleshipShips = {
        plr1: {},
        plr2: {},
    }
    
    function enemyAIFunction() {
        if (difficulty) {
            
            switch (difficulty) {
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

        } else { // if no ai, return false
            return false;
        }
    }
    enemyAIFunction()
}

/*
0 = Empty
1 = Ship
2 = Hit
*/


function enemyAttack() {
    console.log('ATTACKKKK')
    const randomNumber = Math.floor(Math.random() * enemyGuessMathHelper)
    enemyGuessMathHelper--
    playerGrid(aiGuess[randomNumber])
    aiGuess[randomNumber] = aiGuess[enemyGuessMathHelper]
}


// Function to create the grid and add event listener to grid
function createGrid(containerId) {
    let gridContainer = document.getElementById(containerId);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        let cell = document.createElement('div');
        cell.classList.add('grid-item');
        cell.dataset.row = i; // Store the row index as a data attribute
        cell.dataset.column = j; // Store the column index as a data attribute
        cell.dataset.state = 0;
        gridContainer.appendChild(cell);
        }
    }
  
    // Add click event listener to gridContainer1 only
    if (containerId === 'gridContainer1') {
        gridContainer.addEventListener('click', function(event) {
            // Check if the clicked element is a grid item
            if (event.target.classList.contains('grid-item')) {
                // Replace with function to shot handler
                event.target.style.backgroundColor = 'gray';
                enemyAttack()
            }
        });
    }
}


function playerGrid(i) {
    gridContainer2 = document.getElementById("gridContainer2");
    console.log(gridContainer2)
    let gridItems = gridContainer2.getElementsByClassName("grid-item");
    gridItems[i].style.backgroundColor = "gray";
}

/* This creates the window on the right containing all the ships that can be placed */
 function createFixedBox() {
    // Select the container
    let fixedWindow = document.querySelector('.fixed-window');
    
    // Define the number of new items (you can replace this with any variable or calculation)
    let battleshipsArray = Object.keys(battleships);
    
    // Loop to create and append new elements
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
            selectedShip = battleships[target.textContent]
        }
    });
};
  
// Call the function to create the grids when the page loads
window.onload = function() {
    createGrid('gridContainer1');
    createGrid('gridContainer2');
    createFixedBox()
    newGame("easy")
};

document.getElementById('btnNewGame').addEventListener('click', function() {
    newGame("easy");
});

document.getElementById('btnStart').addEventListener('click', function() {
    alert('Button 2 clicked!');
});