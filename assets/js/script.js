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
let timer1
let timer2
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

async function fetchGifs(query) {
  const response = await fetch(
    `${tenorApiUrl}?q=${query}&key=${tenorApiKey}&limit=10`
  );
  const data = await response.json();
  return data.results;
}

const weatherApiKey = "4c0f8c4c326f4c32a5754012243105"; // Your WeatherAPI key
const weatherApiUrl = `http://api.weatherapi.com/v1/current.json`;

async function getWeather(lat, lon) {
  try {
    const response = await fetch(
      `${weatherApiUrl}?key=${weatherApiKey}&q=${lat},${lon}&aqi=no`
    );
    const data = await response.json();
    console.log("Weather API response:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

function getLocalTime(localTimeStr) {
  return new Date(localTimeStr);
}

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

function getBoardSkins(timeOfDay) {
  const skins = {
    morning: [ // Top is enemy board, bottom is players board.
      'url("https://cdn.discordapp.com/attachments/1237247690560110732/1245998790012309565/DALLE_2024-05-31_00.14.10_-_A_serene_morning_ocean_view_with_the_sun_rising_calm_waves_and_a_warm_glow_reflecting_on_the_water.webp?ex=665b730d&is=665a218d&hm=c9273f1c54d9a3590dc9e6a9b8446da29f278fedd701de5a9c78c6944bc075ad&")',
      'url("https://cdn.discordapp.com/attachments/1237247690560110732/1245998790012309565/DALLE_2024-05-31_00.14.10_-_A_serene_morning_ocean_view_with_the_sun_rising_calm_waves_and_a_warm_glow_reflecting_on_the_water.webp?ex=665b730d&is=665a218d&hm=c9273f1c54d9a3590dc9e6a9b8446da29f278fedd701de5a9c78c6944bc075ad&")'
    ],
    afternoon: [
      'url("https://cdn.discordapp.com/attachments/1237247690560110732/1246213055289884693/DALLE_2024-05-31_14.25.30_-_A_bright_mid-day_ocean_view_with_the_sun_high_in_the_sky_clear_blue_water_and_gentle_waves.webp?ex=665b91d9&is=665a4059&hm=2954ca445bd260d1fea69c19b8e3f658df0237eb7ec4522596b6558dcb2ce940&")',
      'url("https://cdn.discordapp.com/attachments/1237247690560110732/1246213055289884693/DALLE_2024-05-31_14.25.30_-_A_bright_mid-day_ocean_view_with_the_sun_high_in_the_sky_clear_blue_water_and_gentle_waves.webp?ex=665b91d9&is=665a4059&hm=2954ca445bd260d1fea69c19b8e3f658df0237eb7ec4522596b6558dcb2ce940&")'
    ],
    night: [
      'url("https://cdn.discordapp.com/attachments/1237247690560110732/1245999332650516542/DALLE_2024-05-31_00.16.20_-_A_tranquil_night_ocean_view_with_a_clear_starry_sky_a_full_moon_reflecting_on_the_water_and_gentle_waves.webp?ex=665b738e&is=665a220e&hm=cd6bea483eac75d47ac4c67eb9b9a769a18ebfcd48408f5565cc0a22f8087623&")',
      'url("https://cdn.discordapp.com/attachments/1237247690560110732/1245999332650516542/DALLE_2024-05-31_00.16.20_-_A_tranquil_night_ocean_view_with_a_clear_starry_sky_a_full_moon_reflecting_on_the_water_and_gentle_waves.webp?ex=665b738e&is=665a220e&hm=cd6bea483eac75d47ac4c67eb9b9a769a18ebfcd48408f5565cc0a22f8087623&")'
    ]
  };

  return skins[timeOfDay];
}

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

// getLocationAndSetBoardSkins("morning"); // For testing morning skin
// getLocationAndSetBoardSkins("afternoon"); // For testing afternoon skin
// getLocationAndSetBoardSkins("night"); // For testing night skin

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

  if (containerId === "gridContainer1") {
    gridContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("grid-item") && gameStarted) {
        if (debounce) {
          return;
        }
        let row = parseInt(event.target.dataset.row);
        let col = parseInt(event.target.dataset.column);
        if (event.target.dataset.state === "0") {
          debounce = true;
          event.target.dataset.state = 1;
          if (enemyBoard[row][col] === 1) {
            event.target.style.backgroundColor = "red";
            const position = row * 10 + col;
            shipDestroyer(position, event.target.dataset.object, "ai", "plr");
          } else {
            event.target.style.backgroundColor = "gray";
          }
          const timer = Math.floor(Math.random() * 100) + 100;
          setTimeout(function () {
            enemyAttack();
            debounce = false;
          }, timer);
        }
      }
    });
  }
}

function updateScore() {
    document.getElementById('winsCount').textContent = wins;
    document.getElementById('lossesCount').textContent = losses;
    localStorage.setItem('wins', wins);
    localStorage.setItem('losses', losses);
}

function shipDestroyer(num, name, player, winner) {
  battleshipShips[player][name] = battleshipShips[player][name].filter(
    (number) => number !== num
  );
  if (battleshipShips[player][name].length === 0) {
    delete battleshipShips[player][name];
    if (player === "plr" && aiDifficulty === "hard") {
      for (let i = 0; i < battleshipShips2[name].length; i++) {
        const currentItem = battleshipShips2[name][i];
        const exists = currentItem in hardDifficultyObject2;
        if (exists) {
          for (let j = 0; j < hardDifficultyObject2[currentItem].length; j++) {
            hardDifficultyObject1[hardDifficultyObject2[currentItem][j]] =
              hardDifficultyObject1[
                hardDifficultyObject2[currentItem][j]
              ].filter((item) => item !== currentItem);
            if (
              hardDifficultyObject1[hardDifficultyObject2[currentItem][j]]
                .length === 0
            ) {
              delete hardDifficultyObject1[
                hardDifficultyObject2[currentItem][j]
              ];
            }
          }
          delete hardDifficultyObject2[currentItem];
        }
      }
    }
    if (Object.keys(battleshipShips[player]).length === 0) {
      if (winner === "plr") {
        gameStateElement.textContent = "You win!";
        wins++;
      } else {
        gameStateElement.textContent = "You lose.";
        losses++;
      }
      gameStarted = false;
      gameWin = true;
      updateScore();
      modal.classList.add("is-active");
    }
  }
}

function getNeighboringTiles(row, col) {
  let neighbors = [];
  const directions = [
    [-1, 0],
    [1, 0], // Up, Down
    [0, -1],
    [0, 1], // Left, Right
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

function enemyAttack() {
  if (!gameStarted) {
    return;
  }
  let gridItems = gridContainer2.getElementsByClassName("grid-item");
  let targetGridItem;
  let randomNumber;
  let selecting;
  if (aiDifficulty === "medium" && mediumDifficultyArray.length > 0) {
    randomNumber = Math.floor(Math.random() * mediumDifficultyArray.length);
    targetGridItem = gridItems[mediumDifficultyArray[randomNumber]];
    selecting = mediumDifficultyArray[randomNumber];
    mediumDifficultyArray.splice(randomNumber, 1);
    randomNumber = aiGuess.indexOf(selecting);
  } else if (aiDifficulty === "hard") {
    if (Object.keys(hardDifficultyObject1).length === 0) {
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

      function shootPlayer(shipSize) {
        let listOfPossibleShips = [];
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
      randomNumber = Math.floor(Math.random() * positions.length);
      targetGridItem = gridItems[positions[randomNumber]];
      selecting = positions[randomNumber];
    } else {
      const keys = Object.keys(hardDifficultyObject1);
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

function createFixedBox() {
  let battleshipsArray = Object.keys(battleships);

  for (var i = 1; i <= 5; i++) {
    var newItem = document.createElement("div");
    newItem.className = "box";
    newItem.innerHTML = "<p>" + battleshipsArray[i - 1] + "</p>";
    fixedWindow.appendChild(newItem);
  }

  fixedWindow.addEventListener("click", function (event) {
    let target = event.target;
    if (event.target.parentNode.classList.contains("box")) {
      target = event.target.parentNode;
    }

    if (target.classList.contains("box")) {
      let previousSelection = document.querySelector(".box.selected");
      if (previousSelection) {
        previousSelection.classList.remove("selected");
      }

      target.classList.add("selected");
      selectedShip = battleships[target.textContent];
      shipName = target.textContent;
      gridContainer2.addEventListener("mouseover", previewShip);
      gridContainer2.addEventListener("mouseout", removePreview);
      gridContainer2.addEventListener("click", placeShip);
    }
  });
}

function newGame(difficulty) {
  clearTimeout(timer1)
  clearTimeout(timer2)
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
  gameStateElement.textContent = "Placement";
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

window.onload = function () {
  // This runs instantly, do NOT make another window.onload
  gameStateElement = document.querySelector(".gameState");
  createGrid("gridContainer1");
  createGrid("gridContainer2");
  gridContainer1 = document.getElementById("gridContainer1");
  gridContainer2 = document.getElementById("gridContainer2");
  aiDifficulty = localStorage.getItem("difficultyInput");
  newGame();
  getLocationAndSetBoardSkins(); // Use this for actual geolocation based time of day
  gridContainer2.addEventListener("mouseover", previewShip);
  gridContainer2.addEventListener("mouseout", removePreview);
};

function placeShip(event) {
  let target = event.target;
  if (
    event.type === "click" &&
    target.classList.contains("grid-item") &&
    target.parentNode.id === "gridContainer2"
  ) {
    let row = parseInt(target.dataset.row);
    let column = parseInt(target.dataset.column);
    let canPlace = true;
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
          if (cell && cell.dataset.state === "1") {
            canPlace = false;
            break;
          }
        }
      }
      if (!canPlace) break;
    }

    if (canPlace) {
      for (let i = 0; i < selectedShip.length; i++) {
        for (let j = 0; j < selectedShip[i].length; j++) {
          if (selectedShip[i][j]) {
            let cell = document.querySelector(
              `#gridContainer2 [data-row="${row + i}"][data-column="${
                column + j
              }"]`
            );
            if (!battleshipShips.plr[shipName]) {
              battleshipShips.plr[shipName] = [];
            }
            if (!battleshipShips2[shipName]) {
              battleshipShips2[shipName] = [];
            }

            const position =
              parseInt(cell.dataset.row) * 10 + parseInt(cell.dataset.column);
            battleshipShips.plr[shipName].push(position);
            battleshipShips2[shipName].push(position);
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

      if (!gameStarted && fixedWindow.childNodes.length === 1) {
        gameStarted = true;
        enemyShipPlacer();
        gameStateElement.textContent = "Game started";
        fixedWindow.innerHTML = "<h2></h2>";
        document.getElementById("fixed-window-id").classList.remove("fixed-window");
      }
      gridContainer2.removeEventListener("mouseover", previewShip);
      gridContainer2.removeEventListener("mouseout", removePreview);
      gridContainer2.removeEventListener("click", placeShip);
      lastHoveredTile = null;
    }
  }
}

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

  function placeEnemyShip(shipSize) {
    let listOfPossibleShips = [];

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

    if (!battleshipShips.ai[shipNames[numb]]) {
      battleshipShips.ai[shipNames[numb]] = [];
    }

    let position;
    const ship =
      listOfPossibleShips[
        Math.floor(Math.random() * listOfPossibleShips.length)
      ];
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
  shipSizes.forEach((shipSize) => {
    placeEnemyShip(shipSize);
  });
}

function previewShip(event) {
  let target = event.target;
  if (typeof selectedShip !== "undefined") {
    if (
      selectedShip &&
      target.classList.contains("grid-item") &&
      target.parentNode.id === "gridContainer2"
    ) {
      lastHoveredTile = event;
      let row = parseInt(target.dataset.row);
      let column = parseInt(target.dataset.column);
      let overlaps = false;
      let offBoard = false;
      for (let i = 0; i < selectedShip.length; i++) {
        for (let j = 0; j < selectedShip[i].length; j++) {
          if (selectedShip[i][j]) {
            let cell = document.querySelector(
              `#gridContainer2 [data-row="${row + i}"][data-column="${
                column + j
              }"]`
            );
            if (cell) {
              if (cell.dataset.state === "1") {
                overlaps = true;
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

document.addEventListener("keydown", function (event) {
  if ((event.key === "r" || event.key === "R") && !gameStarted && !gameWin) {
    removePreview();
    rotateShip();
    if (lastHoveredTile) {
      previewShip(lastHoveredTile);
    }
  }
});

function rotateShip() {
  if (selectedShip) {
    selectedShip = selectedShip[0].map((_, colIndex) =>
      selectedShip.map((row) => row[colIndex]).reverse()
    );
  }
}

function removePreview() {
  let cells = document.querySelectorAll("#gridContainer2 .grid-item");
  cells.forEach((cell) => {
    cell.style.backgroundColor = "";
  });
}

document.getElementById("btnNewGame").addEventListener("click", function () {
  newGame(aiDifficulty); // when click event on button is present newGame resets all states and allows new user input for difficulty
});

document.getElementById("btnNewGame2").addEventListener("click", function () {
  newGame(aiDifficulty); // when click event on button is present newGame resets all states and allows new user input for difficulty
});

document.getElementById("btnMainMenu").addEventListener("click", function () {
  // when click event on button is present Returns to main menu
  window.location.href = "mainMenu.html";
});
