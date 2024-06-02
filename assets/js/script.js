let battleships = {
  destroyer: [[true, true]],
  submarine: [[true, true, true]],
  cruiser: [[true, true, true]],
  battleship: [[true, true, true, true]],
  aircraftCarrier: [[true, true, true, true, true]],
};

let battleshipShips = {
  plr: {},
  ai: {},
};

let debounce = false
let battleshipShips2 = {};
let timer1;
let timer2;
let battleshipInventory = {};
let gameStarted;
let gridContainer2;
let gridContainer1;
let enemyGuessMathHelper = 100;
let enemyBoard;
let aiGuess;
let lastHoveredTile;
let selectedShip;
let shipName;
let gameWin;
let aiDifficulty;
let mediumDifficultyArray = [];
let hardDifficultyObject1 = {};
let hardDifficultyObject2 = {};
let wins = localStorage.getItem("wins")
  ? parseInt(localStorage.getItem("wins"))
  : 0;
let losses = localStorage.getItem("losses")
  ? parseInt(localStorage.getItem("losses"))
  : 0;

const fixedWindow = document.getElementById("fixed-window-id");
const modal = document.querySelector(".modal");

// JavaScript code to fetch GIFs from Tenor API
const tenorApiKey = "AIzaSyDaq_tKOWNEGfkDfFy7kE_zx9vGg2n27TY";
const tenorApiUrl = `https://tenor.googleapis.com/v2/search`;

// fetch data from tenor api
async function fetchGifs(query) {
  const response = await fetch(
    `${tenorApiUrl}?q=${query}&key=${tenorApiKey}&limit=10`
  );
  const data = await response.json();
  return data.results;
}

const weatherApiKey = "4c0f8c4c326f4c32a5754012243105"; // Your WeatherAPI key
const weatherApiUrl = `https://api.weatherapi.com/v1/current.json`;

// fetch data from weather app api
async function getWeather(lat, lon) {
  try {
    const response = await fetch(
      `${weatherApiUrl}?key=${weatherApiKey}&q=${lat},${lon}&aqi=no`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// Pulls data for local time from weather api
function getLocalTime(localTimeStr) {
  return new Date(localTimeStr);
}

// Returns value based on time of day 
function getTimeOfDay(localTime) {
  const hours = localTime.getHours();
  const gridItems = document.querySelectorAll('.grid-item');
  gridItems.forEach(container => {
    container.classList.add('grid-container-invisible');
  });
  if (hours >= 6 && hours < 12) {
    return "morning";
  } else if (hours >= 12 && hours < 21) {
    return "afternoon";
  } else {
    return "night";
  }
}

// links image to time of day value
function getBoardSkins(timeOfDay) {
  const skins = {
    morning: [ // Top is enemy board, bottom is players board.
      'url("./assets/media/morningSkin.png")',
      'url("./assets/media/morningSkin.png")'
    ],
    afternoon: [
      'url("./assets/media/afternoonSkin.png")',
      'url("./assets/media/afternoonSkin.png")'
    ],
    night: [
      'url("./assets/media/nightSkin.png")',
      'url("./assets/media/nightSkin.png")'
    ]
  };

  return skins[timeOfDay];
}

// Displays image on game board based on time of day
async function setBoardSkins(lat, lon, overrideTimeOfDay = null) {
  const weatherData = await getWeather(lat, lon);
  if (!weatherData) {
    console.error("Failed to retrieve weather data.");
    return;
  }

  let localTime;
  let timeOfDay;

  if (overrideTimeOfDay) {
    timeOfDay = overrideTimeOfDay;
  } else {
    localTime = getLocalTime(weatherData.location.localtime);
    timeOfDay = getTimeOfDay(localTime);
  }

  const boardSkin = getBoardSkins(timeOfDay);

  const gridContainer1 = document.getElementById('gridContainer1');
  const gridContainer2 = document.getElementById('gridContainer2');

  if (gridContainer1 && gridContainer2) {
    gridContainer1.style.backgroundImage = boardSkin[0];
    gridContainer2.style.backgroundImage = boardSkin[1];
  }
}

// Passes lat lon data to be used in setBoardSkins function.  Runs after allowing location 
function getLocationAndSetBoardSkins(overrideTimeOfDay = null) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setBoardSkins(lat, lon, overrideTimeOfDay);
    }, error => {
      console.error("Error getting location:", error);
    });
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
}

// Creates game board grid
function createGrid(containerId) {
  let gridContainer = document.getElementById(containerId);

  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      let cell = document.createElement("div");
      cell.classList.add("grid-item");
      cell.dataset.row = i;
      cell.dataset.column = j;
      cell.dataset.state = 0;

      gridContainer.appendChild(cell);
    }
  }

  // Handles player attack
  if (containerId === "gridContainer1") {
    gridContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("grid-item") && gameStarted) {
        if (debounce) {
          return;
        }
        let row = parseInt(event.target.dataset.row);
        let col = parseInt(event.target.dataset.column);
        // Checks if shot already 
        if (event.target.dataset.state === "0") {
          debounce = true;
          event.target.dataset.state = 1;
          // Checks if ship is hit and registers accordingly 
          if (enemyBoard[row][col] === 1) {
            event.target.style.backgroundColor = "red";
            const position = row * 10 + col;
            shipDestroyer(position, event.target.dataset.object, "ai", "plr");
          } else {
            event.target.style.backgroundColor = "gray";
          }
          const timer = Math.floor(Math.random() * 100) + 100;
          // Timer between player shooting and enemy shooting
          setTimeout(function () {
            enemyAttack();
            debounce = false;
          }, timer);
        }
      }
    });
  }
}

// Saves win/loss to local storage
function updateScore() {
    document.getElementById('winsCount').textContent = wins;
    document.getElementById('lossesCount').textContent = losses;
    localStorage.setItem('wins', wins);
    localStorage.setItem('losses', losses);
}

// Removes data about ships and determines winner
function shipDestroyer(num, name, player, winner) {
  battleshipShips[player][name] = battleshipShips[player][name].filter(
    (number) => number !== num
  );

  // Checks length of ship and deletes if empty 
  if (battleshipShips[player][name].length === 0) {
    delete battleshipShips[player][name];
    // Checks to see if targeting player and difficulty is hard
    if (player === "plr" && aiDifficulty === "hard") {
      // Loops through the length of current ship being attacked 
      for (let i = 0; i < battleshipShips2[name].length; i++) {
        // Stores position of ship grid
        const currentItem = battleshipShips2[name][i];
        // Checks to see if ship piece is in variable hardDifficultyObject2 (If ai has shot this area)
        const exists = currentItem in hardDifficultyObject2;
        if (exists) {
          // Removes each ship piece and adjacent tiles from both objects
          for (let j = 0; j < hardDifficultyObject2[currentItem].length; j++) {
            hardDifficultyObject1[hardDifficultyObject2[currentItem][j]] =
              hardDifficultyObject1[
                hardDifficultyObject2[currentItem][j]
              ].filter((item) => item !== currentItem);
              // If adjacent tile is empty delete object
            if (
              hardDifficultyObject1[hardDifficultyObject2[currentItem][j]]
                .length === 0
            ) {
              delete hardDifficultyObject1[
                hardDifficultyObject2[currentItem][j]
              ];
            }
          }
          // Delete shot tile
          delete hardDifficultyObject2[currentItem];
        }
      }
    }
    // Checks if all ships destroyed 
    if (Object.keys(battleshipShips[player]).length === 0) {
      // Determines winner
      if (winner === "plr") {
        wins++;
      } else {
        losses++;
      }
      gameStarted = false;
      gameWin = true;
      updateScore();
      modal.classList.add("is-active");
    }
  }
}

// Check to see if value of neighboring tile is within bounds of game board 
function getNeighboringTiles(row, col) {
  let neighbors = [];
  const directions = [
    [-1, 0], // Up
    [1, 0], // Down
    [0, -1], // Left
    [0, 1], // Right
  ];

  directions.forEach((direction) => {
    let newRow = row + direction[0];
    let newCol = col + direction[1];
    if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
      neighbors.push(newRow * 10 + newCol);
    }
  });

  return neighbors;
}

// Handles enemy attacks
function enemyAttack() {
  // Checks to see if game has started
  if (!gameStarted) {
    return;
  }
  let gridItems = gridContainer2.getElementsByClassName("grid-item");
  let targetGridItem;
  let randomNumber;
  let selecting;
  // Shoots around previously hit ships
  if (aiDifficulty === "medium" && mediumDifficultyArray.length > 0) {
    randomNumber = Math.floor(Math.random() * mediumDifficultyArray.length);
    targetGridItem = gridItems[mediumDifficultyArray[randomNumber]];
    selecting = mediumDifficultyArray[randomNumber];
    mediumDifficultyArray.splice(randomNumber, 1);
    randomNumber = aiGuess.indexOf(selecting);
    // Attacks for hard 
  } else if (aiDifficulty === "hard") {
    // Check for leads if no leads run if statement
    if (Object.keys(hardDifficultyObject1).length === 0) {
      // Ai guess has 0 for every cell on game board
      aiGuess = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0,
      ];
      const shipSizes = [2, 3, 3, 4, 5];
      const shipNames = [
        "destroyer",
        "submarine",
        "cruiser",
        "battleship",
        "aircraftCarrier",
      ];

      // Checks every possible location a ship can be in and increments in ai guess 
      function shootPlayer(shipSize) {
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 10; col++) {
            let canShoot = true;

            // Check right
            if (col + shipSize <= 10) {
              for (let i = 0; i < shipSize; i++) {
                if (
                  document.querySelector(
                    `#gridContainer2 [data-row="${row}"][data-column="${
                      col + i
                    }"]`
                  ).style.backgroundColor === "gray" ||
                  document.querySelector(
                    `#gridContainer2 [data-row="${row}"][data-column="${
                      col + i
                    }"]`
                  ).style.backgroundColor === "red"
                ) {
                  canShoot = false;
                  break;
                }
              }
              if (canShoot) {
                for (let i = 0; i < shipSize; i++) {
                  const position = row * 10 + (col + i);
                  aiGuess[position]++;
                }
              }
              canShoot = true;
            }

            // Check down
            if (row + shipSize <= 10) {
              for (let i = 0; i < shipSize; i++) {
                if (
                  document.querySelector(
                    `#gridContainer2 [data-row="${
                      row + i
                    }"][data-column="${col}"]`
                  ).style.backgroundColor === "gray" ||
                  document.querySelector(
                    `#gridContainer2 [data-row="${
                      row + i
                    }"][data-column="${col}"]`
                  ).style.backgroundColor === "red"
                ) {
                  canShoot = false;
                  break;
                }
              }
              if (canShoot) {
                for (let i = 0; i < shipSize; i++) {
                  const position = (row + i) * 10 + col;
                  aiGuess[position]++;
                }
              }
              canShoot = true;
            }
          }
        }
      }

      // If ship not sunk add to list of possible board locations (aiGuess)
      for (let i = 0; i <= 4; i++) {
        if (battleshipShips["plr"][shipNames[i]]) {
          shootPlayer(shipSizes[i]);
        }
      }

      let maxNumber = Math.max(...aiGuess);
      let positions = [];
      for (let i = 0; i < 100; i++) {
        // Finds largest number in aiGuess 
        if (aiGuess[i] === maxNumber) {
          positions.push(i);
        }
      }

      // Selects area to shoot 
      randomNumber = Math.floor(Math.random() * positions.length);
      targetGridItem = gridItems[positions[randomNumber]];
      selecting = positions[randomNumber];
      // Hard ai if there is a lead
    } else {
      const keys = Object.keys(hardDifficultyObject1);
      // Picks random adjacent tile of previous shoot ship tiles 
      const randomIndex = Math.floor(Math.random() * keys.length);
      selecting = keys[randomIndex];
      targetGridItem = gridItems[selecting];
      let shotTiles = hardDifficultyObject1[selecting];
      if (shotTiles) {
        shotTiles.forEach((shotTile) => {
          let index = hardDifficultyObject2[shotTile].indexOf(
            parseInt(selecting)
          );
          if (index !== -1) {
            hardDifficultyObject2[shotTile].splice(index, 1);
          }
          if (hardDifficultyObject2[shotTile].length === 0) {
            delete hardDifficultyObject2[shotTile];
          }
        });
        delete hardDifficultyObject1[selecting];
        selecting = parseInt(selecting);
      }
    }
  // Attack for easy or if medium ai does not have a lead
  } else {
    randomNumber = Math.floor(Math.random() * enemyGuessMathHelper);
    selecting = aiGuess[randomNumber];
    targetGridItem = gridItems[selecting];
  }
  enemyGuessMathHelper--;
  let row = parseInt(targetGridItem.dataset.row);
  let col = parseInt(targetGridItem.dataset.column);

  if (targetGridItem.dataset.state === "1") {
    if (aiDifficulty === "medium") {
      let neighbors = getNeighboringTiles(row, col);
      neighbors.forEach((tile) => {
        if (
          !mediumDifficultyArray.includes(tile) &&
          (gridItems[tile].style.backgroundColor === "" ||
            gridItems[tile].style.backgroundColor === "green")
        ) {
          mediumDifficultyArray.push(tile);
        }
      });
    } else if (aiDifficulty === "hard") {
      let neighbors = getNeighboringTiles(row, col);
      neighbors.forEach((tile) => {
        if (
          gridItems[tile].style.backgroundColor === "" ||
          gridItems[tile].style.backgroundColor === "green"
        ) {
          if (!hardDifficultyObject1[tile]) {
            hardDifficultyObject1[tile] = [];
          }
          if (!hardDifficultyObject2[selecting]) {
            hardDifficultyObject2[selecting] = [];
          }
          hardDifficultyObject1[tile].push(selecting);
          hardDifficultyObject2[selecting].push(tile);
        }
      });
    }
    targetGridItem.style.backgroundColor = "red";
    shipDestroyer(selecting, targetGridItem.dataset.object, "plr", "ai");
  } else {
    targetGridItem.style.backgroundColor = "gray";
  }
  aiGuess[randomNumber] = aiGuess[enemyGuessMathHelper];
}

// Creates window for stored ships awaiting placement
function createFixedBox() {
  let battleshipsArray = Object.keys(battleships);

  for (var i = 1; i <= 5; i++) {
    var newItem = document.createElement("div");
    newItem.className = "box";
    newItem.innerHTML = "<p>" + battleshipsArray[i - 1] + "</p>";
    fixedWindow.appendChild(newItem);
  }

  // Checks if ship is selected
  fixedWindow.addEventListener("click", function (event) {
    let target = event.target;
    if (event.target.parentNode.classList.contains("box")) {
      target = event.target.parentNode;
    }

    // Ensures click event contains a ship value
    if (target.classList.contains("box")) {
      let previousSelection = document.querySelector(".box.selected");
      if (previousSelection) {
        previousSelection.classList.remove("selected");
      }

      // Applies selected css per event 
      target.classList.add("selected");
      selectedShip = battleships[target.textContent];
      shipName = target.textContent;
      // When hovering over game board cells shows ship preview.  If mouse out of bounds remove preview. Clicking attempts to place ship.
      gridContainer2.addEventListener("mouseover", previewShip);
      gridContainer2.addEventListener("mouseout", removePreview);
      gridContainer2.addEventListener("click", placeShip);
    }
  });
}

// Resets majority of game data upon clicking new game
function newGame(difficulty) {
  document.getElementById("fixed-window-id").classList.add("fixed-window");

  battleshipShips.plr = {};
  battleshipShips.ai = {};
  battleshipShips2 = {};
  hardDifficultyObject1 = {};
  hardDifficultyObject2 = {};
  gameStarted = false;
  if (gameWin) {
    modal.classList.remove("is-active");
  }
  gameWin = false;
  let previousSelection = document.querySelector(".box.selected");
  if (previousSelection) {
    previousSelection.classList.remove("selected");
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
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  aiGuess = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58,
    59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77,
    78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96,
    97, 98, 99,
  ];
  enemyGuessMathHelper = 100;

  fixedWindow.innerHTML = "<h2>Battleships</h2>";
  createFixedBox();

  gridContainer1.querySelectorAll(".grid-item").forEach((cell) => {
    cell.dataset.state = 0;
    cell.style.backgroundColor = "";
  });

  gridContainer2.querySelectorAll(".grid-item").forEach((cell) => {
    cell.dataset.state = 0;
    cell.style.backgroundColor = "";
  });

  gridContainer2.removeEventListener("mouseover", previewShip);
  gridContainer2.removeEventListener("mouseout", removePreview);
  gridContainer2.removeEventListener("click", placeShip);
  removePreview();
  lastHoveredTile = null;
}

// This runs instantly, do NOT make another window.onload
window.onload = function () {
  // Creates ai game board
  createGrid("gridContainer1");
  // Creates player game board
  createGrid("gridContainer2");
  gridContainer1 = document.getElementById("gridContainer1");
  gridContainer2 = document.getElementById("gridContainer2");
  // Sets ai difficulty based on user input for difficulty 
  aiDifficulty = localStorage.getItem("difficultyInput");
  // Starts new game
  newGame();
  // Use this for actual geolocation based time of day
  getLocationAndSetBoardSkins();
};

// Checks to see if ship can be placed and places ship
function placeShip(event) {
  let target = event.target;
  // Checks for left click event in player game board
  if (
    event.type === "click" &&
    target.classList.contains("grid-item") &&
    target.parentNode.id === "gridContainer2"
  ) {
    let row = parseInt(target.dataset.row);
    let column = parseInt(target.dataset.column);
    let canPlace = true;
    // Checks to see if attempt to place ship is out of bounds
    for (let i = 0; i < selectedShip.length; i++) {
      for (let j = 0; j < selectedShip[i].length; j++) {
        if (selectedShip[i][j]) {
          if (
            row + i < 0 ||
            row + i >= 10 ||
            column + j < 0 ||
            column + j >= 10
          ) {
            canPlace = false;
            break;
          }
          let cell = document.querySelector(
            `#gridContainer2 [data-row="${row + i}"][data-column="${
              column + j
            }"]`
          );
          // Checks if a ship has been placed already in desired cell 
          if (cell && cell.dataset.state === "1") {
            canPlace = false;
            break;
          }
        }
      }
      if (!canPlace) break;
    }

    // If ship is placeable then place ship
    if (canPlace) {
      for (let i = 0; i < selectedShip.length; i++) {
        for (let j = 0; j < selectedShip[i].length; j++) {
          if (selectedShip[i][j]) {
            let cell = document.querySelector(
              `#gridContainer2 [data-row="${row + i}"][data-column="${
                column + j
              }"]`
            );
            // Creates array to store specific ship tiles 
            if (!battleshipShips.plr[shipName]) {
              battleshipShips.plr[shipName] = [];
            }
            // Creates array to store specific ship tiles
            if (!battleshipShips2[shipName]) {
              battleshipShips2[shipName] = [];
            }

            const position =
              parseInt(cell.dataset.row) * 10 + parseInt(cell.dataset.column);
            battleshipShips.plr[shipName].push(position);
            battleshipShips2[shipName].push(position);
            // Displays placed ship 
            if (cell) {
              cell.dataset.state = 1;
              cell.dataset.object = shipName;
              cell.style.backgroundColor = "green";
              let previousSelection = document.querySelector(".box.selected");
              if (previousSelection) {
                previousSelection.parentNode.removeChild(previousSelection);
              }
            }
          }
        }
      }

      // Starts game when all ships have been placed
      if (!gameStarted && fixedWindow.childNodes.length === 1) {
        gameStarted = true;
        // Places enemy ships
        enemyShipPlacer();
        // Removes text in fixed window
        fixedWindow.innerHTML = "<h2></h2>";
        // Makes fixed window invisible 
        document.getElementById("fixed-window-id").classList.remove("fixed-window");
      }
      // Removes event listener
      gridContainer2.removeEventListener("mouseover", previewShip);
      gridContainer2.removeEventListener("mouseout", removePreview);
      gridContainer2.removeEventListener("click", placeShip);
      lastHoveredTile = null;
    }
  }
}

// Places enemy ship 
function enemyShipPlacer() {
  const shipSizes = [2, 3, 3, 4, 5];
  const shipNames = [
    "destroyer",
    "submarine",
    "cruiser",
    "battleship",
    "aircraftCarrier",
  ];
  let numb = 0;

  // Loops through ships and places each ship
  function placeEnemyShip(shipSize) {
    let listOfPossibleShips = [];

    // Checks all grid locations 
    for (let row = 0; row < enemyBoard.length; row++) {
      for (let col = 0; col < enemyBoard[row].length; col++) {
        let canPlace = true;

        // Check right
        if (col + shipSize <= 10) {
          for (let i = 0; i < shipSize; i++) {
            if (enemyBoard[row][col + i] !== 0) {
              canPlace = false;
              break;
            }
          }
          // If it can be place adds to list of possible ship locations
          if (canPlace) {
            let temp = [];
            for (let i = 0; i < shipSize; i++) {
              temp.push([row, col + i]);
            }
            listOfPossibleShips.push(temp);
          }

          canPlace = true;
        }

        // Check left
        if (col - shipSize >= -1) {
          for (let i = 0; i < shipSize; i++) {
            if (col - i < 0 || enemyBoard[row][col - i] !== 0) {
              canPlace = false;
              break;
            }
          }
          // If it can be place adds to list of possible ship locations
          if (canPlace) {
            let temp = [];
            for (let i = 0; i < shipSize; i++) {
              temp.push([row, col - i]);
            }
            listOfPossibleShips.push(temp);
          }

          canPlace = true;
        }

        // Check down
        if (row + shipSize <= 10) {
          for (let i = 0; i < shipSize; i++) {
            if (enemyBoard[row + i][col] !== 0) {
              canPlace = false;
              break;
            }
          }
          // If it can be place adds to list of possible ship locations
          if (canPlace) {
            let temp = [];
            for (let i = 0; i < shipSize; i++) {
              temp.push([row + i, col]);
            }
            listOfPossibleShips.push(temp);
          }

          canPlace = true;
        }

        // Check up
        if (row - shipSize >= -1) {
          for (let i = 0; i < shipSize; i++) {
            if (row - i < 0 || enemyBoard[row - i][col] !== 0) {
              canPlace = false;
              break;
            }
          }
          // If it can be place adds to list of possible ship locations
          if (canPlace) {
            let temp = [];
            for (let i = 0; i < shipSize; i++) {
              temp.push([row - i, col]);
            }
            listOfPossibleShips.push(temp);
          }
        }
      }
    }

    // Creates object with array if object does not exist
    if (!battleshipShips.ai[shipNames[numb]]) {
      battleshipShips.ai[shipNames[numb]] = [];
    }

    let position;
    // Picks ship location from list of possible locations
    const ship =
      listOfPossibleShips[
        Math.floor(Math.random() * listOfPossibleShips.length)
      ];
    // Places ship
    for (let i = 0; i < shipSize; i++) {
      let square = gridContainer1.querySelector(
        `.grid-item[data-row="${ship[i][0]}"][data-column="${ship[i][1]}"]`
      );
      enemyBoard[ship[i][0]][ship[i][1]] = 1;
      square.dataset.object = shipNames[numb];
      position = parseInt(ship[i][0]) * 10 + parseInt(ship[i][1]);
      battleshipShips.ai[shipNames[numb]].push(position);
    }
    numb++;
  }

  // Loops through each ship to place it
  shipSizes.forEach((shipSize) => {
    placeEnemyShip(shipSize);
  });
}

// Displays preview of ship location prior to placement
function previewShip(event) {
  let target = event.target;
  // Checks to see if ship exist
  if (typeof selectedShip !== "undefined") {
    // Checks to see if mouse is in player grid 
    if (
      selectedShip &&
      target.classList.contains("grid-item") &&
      target.parentNode.id === "gridContainer2"
    ) {
      lastHoveredTile = event;
      let row = parseInt(target.dataset.row);
      let column = parseInt(target.dataset.column);

      let offBoard = false;
      // // Checks to see if selected ship is placeable in desired cells
      for (let i = 0; i < selectedShip.length; i++) {
        for (let j = 0; j < selectedShip[i].length; j++) {
          if (selectedShip[i][j]) {
            let cell = document.querySelector(
              `#gridContainer2 [data-row="${row + i}"][data-column="${
                column + j
              }"]`
            );
          
            if (cell) {
              // Checks to see if there are overlaps 
              if (cell.dataset.state === "1") {
                cell.style.backgroundColor = "red";
              } else if (cell.style.backgroundColor !== "red") {
                cell.style.backgroundColor = "lightgray";
              }
            } else {
              offBoard = true;
            }
          }
        }
      }

      // Changes color if ship is off game board
      if (offBoard) {
        let cells = document.querySelectorAll("#gridContainer2 .grid-item");
        cells.forEach((cell) => {
          if (cell.style.backgroundColor === "lightgray") {
            cell.style.backgroundColor = "red";
          }
        });
      }
    }
  }
}

// Rotates ship when pressing r key
document.addEventListener("keydown", function (event) {
  if ((event.key === "r" || event.key === "R") && !gameStarted && !gameWin) {
    removePreview();
    rotateShip();
    if (lastHoveredTile) {
      previewShip(lastHoveredTile);
    }
  }
});

// Rotates ship data 
function rotateShip() {
  if (selectedShip) {
    selectedShip = selectedShip[0].map((_, colIndex) =>
      selectedShip.map((row) => row[colIndex]).reverse()
    );
  }
}

// Removes preview 
function removePreview() {
  let cells = document.querySelectorAll("#gridContainer2 .grid-item");
  cells.forEach((cell) => {
    cell.style.backgroundColor = "";
  });
}

// when click event on button is present newGame resets all states and allows new user input for difficulty
document.getElementById("btnNewGame").addEventListener("click", function () {
  newGame(aiDifficulty); 
});

// when click event on button is present newGame resets all states and allows new user input for difficulty
document.getElementById("btnNewGame2").addEventListener("click", function () {
  newGame(aiDifficulty);
});

// when click event on button is present Returns to main menu
document.getElementById("btnMainMenu").addEventListener("click", function () {
  window.location.href = "index.html";
});