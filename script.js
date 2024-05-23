let dailyWord;
const wordApiUrl = `https://random-word-api.herokuapp.com/word?number=1&length=5`;
const validateApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/`; 

async function fetchDailyWord() {
    try {
        const response = await fetch(wordApiUrl);
        const data = await response.json();
        if (data && data.length > 0) {
            dailyWord = data[0].toLowerCase();
        } else {
            throw new Error("Failed to fetch a valid word");
        }
    } catch (error) {
        console.error("Error fetching daily word:", error);
        alert("Failed to fetch daily word. Please try again later.");
    }
}

async function isValidWord(word) {
    try {
        const response = await fetch(`${validateApiUrl}${word}`);
        return response.ok;
    } catch (error) {
        console.error("Error validating word:", error);
        return false;
    }
}

let attempts = 0;
const maxAttempts = 6;
let currentGuess = '';
let currentRow = 0;

function updateGrid() {
    const gridRow = document.querySelectorAll('.grid-row')[currentRow];
    const cells = gridRow.querySelectorAll('.grid-cell');
    cells.forEach((cell, index) => {
        cell.textContent = currentGuess[index] || '';
    });
}

function handleKeyPress(key) {
    if (key === 'Enter') {
        if (currentGuess.length === 5) {
            submitGuess();
        }
    } else if (key === 'Backspace' || key === 'Delete') {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    } else if (currentGuess.length < 5 && /^[a-z]$/i.test(key)) {
        currentGuess += key.toLowerCase();
        updateGrid();
    }
}

async function submitGuess() {
    const guess = currentGuess;
    if (guess.length !== 5) {
        alert("Please enter a 5-letter word.");
        return;
    }

    if (attempts >= maxAttempts) {
        alert("You've used all your attempts!");
        return;
    }

    const isValid = await isValidWord(guess);
    if (!isValid) {
        alert("Invalid word! Please enter a valid 5-letter word.");
        return;
    }

    const gridRow = document.querySelectorAll('.grid-row')[currentRow];
    const cells = gridRow.querySelectorAll('.grid-cell');
    let feedback = getFeedback(guess, dailyWord);
    for (let i = 0; i < feedback.length; i++) {
        cells[i].classList.add(feedback[i]);
    }

    updateKeyboard(guess, feedback);

    attempts++;
    currentGuess = '';
    currentRow++;

    if (guess === dailyWord) {
        showEndMessage("Congratulations! You've guessed the word!");
        disableKeyboard();
    } else if (attempts >= maxAttempts) {
        showEndMessage(`Sorry, you've used all your guesses. The word was: ${dailyWord}`);
        disableKeyboard();
    }
}

function getFeedback(guess, word) {
    const feedback = [];
    const wordArray = word.split('');
    const guessArray = guess.split('');

    // First pass: Check for correct letters in the correct position
    guessArray.forEach((letter, index) => {
        if (letter === wordArray[index]) {
            feedback[index] = 'correct';
            wordArray[index] = null;  // Mark this letter as used
        }
    });

    // Second pass: Check for correct letters in the wrong position
    guessArray.forEach((letter, index) => {
        if (!feedback[index]) {
            const foundIndex = wordArray.indexOf(letter);
            if (foundIndex !== -1) {
                feedback[index] = 'present';
                wordArray[foundIndex] = null;  // Mark this letter as used
            } else {
                feedback[index] = 'absent';
            }
        }
    });

    return feedback;
}

function updateKeyboard(guess, feedback) {
    const keys = document.querySelectorAll('.key');
    guess.split('').forEach((letter, index) => {
        const key = document.querySelector(`.key[data-key="${letter}"]`);
        if (key) {
            key.classList.remove('correct', 'present', 'absent');
            key.classList.add(feedback[index]);
        }
    });
}

function disableKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach((key) => {
        key.disabled = true;
    });
}

function enableKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach((key) => {
        key.disabled = false;
    });
}

function showEndMessage(message) {
    document.getElementById("message").textContent = message;
    document.getElementById('play-again-container').style.display = 'block';
}

document.addEventListener('keydown', (event) => {
    handleKeyPress(event.key);
});

document.querySelectorAll('.key').forEach((key) => {
    key.addEventListener('click', () => {
        handleKeyPress(key.getAttribute('data-key'));
    });
});

document.getElementById('play-again').addEventListener('click', resetGame);

function resetGame() {
    attempts = 0;
    currentGuess = '';
    currentRow = 0;
    document.getElementById("message").textContent = '';
    document.getElementById('play-again-container').style.display = 'none';

    document.querySelectorAll('.grid-cell').forEach((cell) => {
        cell.textContent = '';
        cell.classList.remove('correct', 'present', 'absent');
    });
    document.querySelectorAll('.key').forEach((key) => {
        key.classList.remove('correct', 'present', 'absent');
        key.disabled = false;
    });
    fetchDailyWord();
}

window.onload = async () => {
    await fetchDailyWord();
    enableKeyboard();
};
