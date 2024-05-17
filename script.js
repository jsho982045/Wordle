let dailyWord;
const apiUrl = `https://random-word-api.herokuapp.com/word?number=1&length=5`;

async function fetchDailyWord() {
    try {
        const response = await fetch(apiUrl);
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
    } else if (key === 'Delete' || key === 'Backspace') {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    } else if (currentGuess.length < 5 && /^[a-z]$/i.test(key)) {
        currentGuess += key.toLowerCase();
        updateGrid();
    }
}

function submitGuess() {
    const guess = currentGuess;
    if (guess.length !== 5) {
        alert("Please enter a 5-letter word.");
        return;
    }

    if (attempts >= maxAttempts) {
        alert("You've used all your attempts!");
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
        document.getElementById("message").textContent = "Congratulations! You've guessed the word!";
        disableKeyboard();
    }else if (attempts >= maxAttempts) {
        document.getElementById("message").textContent = "Sorry, you've used all your guesses. The word was:  ${dailyWord}";
        disableKeyboard();
    }
}

function getFeedback(guess, word) {
    const feedback = [];
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === word[i]) {
            feedback.push("correct");
        } else if (word.includes(guess[i])) {
            feedback.push("present");
        } else {
            feedback.push("absent");
        }
    }
    return feedback;
}

function updateKeyboard(guess, feedback) {
    const keys = document.querySelectorAll('.key');
    keys.forEach((key) => {
        const keyValue = key.getAttribute('data-key');
        const index = guess.indexOf(keyValue);
        if (index !== -1) {
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

document.addEventListener('keydown', (event) => {
    handleKeyPress(event.key);
});

document.querySelectorAll('.key').forEach((key) => {
    key.addEventListener('click', () => {
        handleKeyPress(key.getAttribute('data-key'));
    });
});

window.onload = async () => {
    await fetchDailyWord();
};