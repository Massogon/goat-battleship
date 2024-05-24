const difficultyInput = document.querySelector('#difficulty-input');
const startGame = document.querySelector('#startGame');

startGame.addEventListener('click', function (event) {
    event.preventDefault();
    const nameInput = document.getElementById('user-name');
    const userName = nameInput.value;
    const userDifficulty = difficultyInput.value;
    console.log(userName);
    console.log(userDifficulty);
    localStorage.setItem('nameInput', userName);
    localStorage.setItem('difficulty-input', userDifficulty);

    window.location.href = "index.html";
})

