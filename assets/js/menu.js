const difficultyInput = document.querySelector('#difficultyInput');
const startGame = document.querySelector('#startGame');
const tenorApiKey = 'AIzaSyAOY2IMznjlCNEKo9N89VLgoeDx7gXO-bc';
const tenorApiUrl = 'https://tenor.googleapis.com/v2/posts';
const gifIds = ["16571793880350149204", "5519983040647503769", "18333335586526716999", "3904152542726193533", "18253183826493308159"];
const backgroundVideo = document.getElementById('background-video');

// Allows user input for user name and difficulty to be stored locally
startGame.addEventListener('click', function(event) {
    event.preventDefault();
    const nameInput = document.getElementById('user-name');
    const userName = nameInput.value;
    const userDifficulty = difficultyInput.value;

    if (!userName || userDifficulty === "Select Difficulty") {
        alert("Please enter a valid username and select a difficulty.");
        return;
    }

    localStorage.setItem('nameInput', userName);
    localStorage.setItem('difficultyInput', userDifficulty);

    window.location.href = "index.html";
});

let count = 0;
let ranOnce = false;
let timer = 0;

// Takes information from specified const variables related to tenor api to produce gif.  Loops through gifs every 3 seconds.  If api call successful displays gifs, if not returns error and degrates to bg image
function getApi() { 
    setTimeout(function() {
        const randomGifId = gifIds[count];
        const getApiUrl = `${tenorApiUrl}?key=${tenorApiKey}&ids=${randomGifId}&media_filter=mp4`;
        count++;

        if (!ranOnce) {
            ranOnce = true;
            timer = 3000;
        }

        if (count === gifIds.length) {
            count = 0;
        }
        
        fetch(getApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const gifObj = data.results[0].media_formats.mp4.url;
                    displayGif(gifObj);
                }
            })
            .catch(error => console.error('Error fetching the GIF:', error));
    }, timer);
}

// Takes gif and displays as bg image for main menu
function displayGif(gifObj) {
    // Remove background image
    backgroundVideo.style.backgroundImage = 'none';
    const randomNumber = Math.floor(Math.random() * 10);
    // Will display static bg image when randomNumber pulls a 3 (subliminal message)
    if (randomNumber === 3) {
        backgroundVideo.style.backgroundImage = ('url(./assets/media/give-us-an-a++++.jpg)') 
    }
    // Set the GIF as the source for the video
    backgroundVideo.src = gifObj;
    getApi();
}

// Allows getApi function to instantly run
document.addEventListener('DOMContentLoaded', function() {   
    getApi();
});