const words = 'tumble cute school marsh convert joke replacement dough cluster rack equation bulletin path commitment list food flower marriage pitch lover note technique leaf fish glow bell crab frog spin drum luck tap'.split(' ');
const wordsCount = words.length;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;
window.pauseTime = 0;


function addClass(el,name){
    el.className += ' '+name;
}

function removeClass(el,name){
    el.className = el.className.replace(name,'');
}

function randomWord() {
    const randomIndex = Math.ceil(Math.random() * wordsCount);
    return words[randomIndex-1];
}

function formatWord(word) {
    return `<div class="word"><span class = "letter">${word.split('').join('</span><span class = "letter">')}</span></div>`;
}

function newGame() {
    const gameTime = 30 * 1000;
    window.timer = null;
    window.gameStart = null;
    window.pauseTime = 0;
    wordContainer.style.display = 'block';
    resultContainer.style.display = 'none';
    document.getElementById('words').innerHTML = '';
    for (let i = 0; i < 200; i++) {
        document.getElementById('words').innerHTML += formatWord(randomWord());
    }
    addClass(document.querySelector('.word'), 'current');
    addClass(document.querySelector('.letter'), 'current');

    document.getElementById('info').innerHTML = (gameTime / 1000) + '';
    window.timer = null;

    cursor.style.top = document.querySelector('.letter').getBoundingClientRect().top + 'px';
    cursor.style.left = document.querySelector('.letter').getBoundingClientRect().left + 'px';
}

function getWpm() {
    const words = [...document.querySelectorAll('.word')];
    const lastTypedWord = document.querySelector('.word.current');
    const lastTypedWordIndex = words.indexOf(lastTypedWord) + 1;
    const typedWords = words.slice(0, lastTypedWordIndex);
    const correctWords = typedWords.filter(word => {
        const letters = [...word.children];
        const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
        const correctLetters = letters.filter(letter => letter.className.includes('correct'));
        return incorrectLetters.length === 0 && correctLetters.length === letters.length;
    });
    console.log(correctWords.length, typedWords.length);
    return correctWords.length / gameTime *60000;  //words per minute
}

function getAcc() {
    const words = [...document.querySelectorAll('.word')];
    const lastTypedWord = document.querySelector('.word.current');
    const lastTypedWordIndex = words.indexOf(lastTypedWord) + 1;
    const typedWords = words.slice(0, lastTypedWordIndex);
    const correctWords = typedWords.filter(word => {
        const letters = [...word.children];
        const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
        const correctLetters = letters.filter(letter => letter.className.includes('correct'));
        return incorrectLetters.length === 0 && correctLetters.length === letters.length;
    });
    return Math.round((correctWords.length/typedWords.length)*100);  //accuracy
}

function gameOver() {
    clearInterval(window.timer);
    wordContainer.style.display = 'none';
    resultContainer.style.display = 'block';

    addClass(document.getElementById('game'), 'over');
    const resultwpm = getWpm();
    const resultacc = getAcc();
    document.getElementById('result').innerHTML = `WPM: ${resultwpm} Accuracy: ${resultacc}%`;
}

document.getElementById('game').addEventListener('keyup', ev =>{
    const key = ev.key;
    const currentWord = document.querySelector('.word.current');
    const currentLetter = document.querySelector('.letter.current');
    const expected = currentLetter?.innerHTML || ' ';
    const isLetter = key.length === 1 && key!==' ';
    const isSpace = key === ' ';
    const isBackspace = key == 'Backspace';
    const isFirstLetter = currentLetter === currentWord.firstChild;
    const isFirstWord = currentWord === document.querySelector('.word');
    const isExtra = document.querySelector(".letter.incorrect.extra:last-child");


    if(document.querySelector('#game.over')) {
        return;
    }

    console.log({key,expected});

    if (!window.timer && isLetter) {
        window.timer = setInterval(() => {
            if(!window.gameStart) {
                window.gameStart = (new Date()).getTime();
            }
            const currentTime = (new Date()).getTime();
            const msPassed = currentTime - window.gameStart;
            const secondsPassed = Math.round(msPassed/1000);
            const secondsLeft = Math.round((gameTime / 1000) - secondsPassed);
            if (secondsLeft <= 0) {
                gameOver();
                return;
            }
            document.getElementById('info').innerHTML = secondsLeft + '';
        }, 1000);
    }

    if (isLetter) {
        if (currentLetter){
            addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
            removeClass(currentLetter, 'current');
            if (currentLetter.nextSibling){
                addClass(currentLetter.nextSibling, 'current');
            }
        } else {
            const incorrectLetter = document.createElement('span');
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = 'letter incorrect extra';
            currentWord.appendChild(incorrectLetter);
        }
    }

    if (isSpace) {
        if (expected !== ' '){
            const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
            lettersToInvalidate.forEach(letter => {
                addClass(letter, 'incorrect');
            });
        }
        removeClass(currentWord, 'current');
        addClass(currentWord.nextSibling, 'current');
        if (currentLetter){
            removeClass(currentLetter, 'current');
        }
        addClass(currentWord.nextSibling.firstChild, 'current');
    }

    
    if (isBackspace) {
        if(isExtra){
            console.log(isExtra);
            currentWord.removeChild(isExtra)
            }
        if(currentLetter && isFirstLetter && !isFirstWord) {
            //make previous word current and last letter current
            removeClass(currentWord, 'current');
            addClass(currentWord.previousSibling, 'current');
            removeClass(currentLetter, 'current');
            addClass(currentWord.previousSibling.lastChild, 'current');
            removeClass(currentWord.previousSibling.lastChild, 'correct');
            removeClass(currentWord.previousSibling.lastChild, 'incorrect');
        }
        if (currentLetter && !isFirstLetter && !isExtra) {
            //mve back one letter and remove classnames
            removeClass(currentLetter, 'current');
            addClass(currentLetter.previousSibling, 'current');
            removeClass(currentLetter.previousSibling, 'correct');
            removeClass(currentLetter.previousSibling, 'incorrect');
        }
        if (!currentLetter && !isExtra) {     //expected character is space
            addClass(currentWord.lastChild, 'current');
            removeClass(currentWord.lastChild, 'correct');
            removeClass(currentWord.lastChild, 'incorrect');
        }
    }


    //move lines(scroll text upwards)
    if (currentWord.getBoundingClientRect().top > 250) {
        const words = document.getElementById('words');
        const margin = parseInt(words.style.marginTop || '0px');
        words.style.marginTop = (margin - 35) + 'px';
    }


    //move cursor
    const nextLetter = document.querySelector('.letter.current');
    const nextWord = document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    if(nextLetter){
        cursor.style.top = nextLetter.getBoundingClientRect().top + 'px';
        cursor.style.left = nextLetter.getBoundingClientRect().left + 'px';
    } else {
        cursor.style.top = nextWord.getBoundingClientRect().top + 'px';
        cursor.style.left = nextWord.getBoundingClientRect().right + 'px';
    }
});

document.getElementById('newGameBtn').addEventListener('click', () => {
    gameOver();
    document.getElementById('game').className = '';
    newGame();
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    // gameOver();
    newGame();
  }); 

newGame();
