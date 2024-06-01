const difficultyInput = document.querySelector('#difficultyInput');
const startGame = document.querySelector('#startGame');
const tenorApiKey = 'AIzaSyAOY2IMznjlCNEKo9N89VLgoeDx7gXO-bc';
const tenorApiUrl = 'https://tenor.googleapis.com/v2/posts';
const gifIds = ["16571793880350149204", "5519983040647503769", "18333335586526716999", "3904152542726193533", "18253183826493308159"];
const backgroundVideo = document.getElementById('background-video');

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

function displayGif(gifObj) {
    // Remove background image
    backgroundVideo.style.backgroundImage = 'none';
    const randomNumber = Math.floor(Math.random() * 10);
    if (randomNumber === 3) {
        backgroundVideo.style.backgroundImage = ('url(./assets/media/give-us-an-a++++.jpg)') 
    }
    // Set the GIF as the source for the video
    backgroundVideo.src = gifObj;
    getApi();
}


document.addEventListener('DOMContentLoaded', function() {   
    getApi();
});