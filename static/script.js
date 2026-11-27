
"use strict";

const passwordInput = document.getElementById("password");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const toggleBtn = document.getElementById("togglePassword");

const result = document.getElementById("result");
const strengthText = document.getElementById("strengthText");
const progress = document.getElementById("progress");
const analysisList = document.getElementById("analysisList");
const suggestionList = document.getElementById("suggestionList");

function addItem(list, text) {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
}

function hasRepeatedCharacters(password) {
    return /(.)\1{2,}/us.test(password);
}

function hasSequentialPattern(password) {
    const chars = Array.from(password);

    for (let i = 0; i < chars.length - 2; i++) {
        const a = chars[i].codePointAt(0);
        const b = chars[i + 1].codePointAt(0);
        const c = chars[i + 2].codePointAt(0);

        if (
            (b === a + 1 && c === b + 1) ||
            (b === a - 1 && c === b - 1)
        ) {
            return true;
        }
    }

    return false;
}

function hasKeyboardPattern(password) {
    const rows = [
        "qwertyuiop",
        "asdfghjkl",
        "zxcvbnm",
        "1234567890"
    ];

    const value = password.toLowerCase();

    for (const row of rows) {
        for (let i = 0; i <= row.length - 3; i++) {
            const pattern = row.slice(i, i + 3);

            if (
                value.includes(pattern) ||
                value.includes([...pattern].reverse().join(""))
            ) {
                return true;
            }
        }
    }

    return false;
}

function hasRepeatedChunk(password) {
    const chars = Array.from(password);
    const maxSize = Math.min(8, Math.floor(chars.length / 2));

    for (let size = 2; size <= maxSize; size++) {
        const seen = new Set();

        for (let i = 0; i <= chars.length - size; i++) {
            const chunk = chars.slice(i, i + size).join("");

            if (seen.has(chunk)) {
                return true;
            }

            seen.add(chunk);
        }
    }

    return false;
}

function analyzePassword() {

    const password = passwordInput.value;

    analysisList.replaceChildren();
    suggestionList.replaceChildren();

    if (password.length === 0) {
        result.hidden = true;
        passwordInput.focus();
        return;
    }

    const chars = Array.from(password);
    const length = chars.length;

    const upper = /\p{Lu}/u.test(password);
    const lower = /\p{Ll}/u.test(password);
    const number = /\p{N}/u.test(password);
    const symbol = /[^\p{L}\p{N}\s]/u.test(password);
    const space = /\s/u.test(password);

    const unique = new Set(chars).size;

    const repeated = hasRepeatedCharacters(password);
    const sequential = hasSequentialPattern(password);
    const keyboard = hasKeyboardPattern(password);
    const repeatedChunk = hasRepeatedChunk(password);

    let score = 0;
    const suggestions = [];

    if (length >= 16) {
        score += 35;
    } else if (length >= 12) {
        score += 27;
    } else if (length >= 8) {
        score += 17;
    } else {
        suggestions.push("Use a longer password, preferably 16 or more characters.");
    }

    const variety = [upper, lower, number, symbol].filter(Boolean).length;

    score += variety * 10;

    if (!upper) suggestions.push("Consider uppercase letters.");
    if (!lower) suggestions.push("Consider lowercase letters.");
    if (!number) suggestions.push("Consider numbers.");
    if (!symbol) suggestions.push("Consider symbols.");

    if (unique / length > 0.65) {
        score += 10;
    } else if (unique / length < 0.4) {
        score -= 10;
        suggestions.push("Avoid repeating characters.");
    }

    if (repeated) {
        score -= 15;
        suggestions.push("Avoid repeated characters.");
    }

    if (sequential) {
        score -= 15;
        suggestions.push("Avoid simple sequential patterns.");
    }

    if (keyboard) {
        score -= 15;
        suggestions.push("Avoid common keyboard patterns.");
    }

    if (repeatedChunk) {
        score -= 15;
        suggestions.push("Avoid repeating the same short sequence.");
    }

    if (space) {
        suggestions.push("Make sure the complete phrase is unpredictable.");
    }

    score = Math.max(0, Math.min(100, score));

    let label;

    if (length < 8 || score < 35) {
        label = "Weak";
    } else if (score < 70) {
        label = "Medium";
    } else {
        label = "Strong";
    }

    strengthText.textContent = label;
    progress.style.width = score + "%";

    addItem(analysisList, "Length: " + length);
    addItem(analysisList, "Uppercase: " + (upper ? "Present" : "Not detected"));
    addItem(analysisList, "Lowercase: " + (lower ? "Present" : "Not detected"));
    addItem(analysisList, "Numbers: " + (number ? "Present" : "Not detected"));
    addItem(analysisList, "Symbols: " + (symbol ? "Present" : "Not detected"));
    addItem(analysisList, "Unique characters: " + unique);
    addItem(analysisList, "Repeated characters: " + (repeated ? "Detected" : "Not detected"));
    addItem(analysisList, "Sequential pattern: " + (sequential ? "Detected" : "Not detected"));
    addItem(analysisList, "Keyboard pattern: " + (keyboard ? "Detected" : "Not detected"));
    addItem(analysisList, "Repeated chunk: " + (repeatedChunk ? "Detected" : "Not detected"));

    if (suggestions.length === 0) {
        addItem(suggestionList, "No basic improvements detected. This is not a security guarantee.");
    } else {
        suggestions.forEach(s => addItem(suggestionList, s));
    }

    result.hidden = false;
}

analyzeBtn.addEventListener("click", analyzePassword);

toggleBtn.addEventListener("click", function() {

    const hidden = passwordInput.type === "password";

    passwordInput.type = hidden ? "text" : "password";

    toggleBtn.textContent = hidden ? "Hide" : "Show";
});

clearBtn.addEventListener("click", function() {

    passwordInput.value = "";
    passwordInput.type = "password";

    toggleBtn.textContent = "Show";

    analysisList.replaceChildren();
    suggestionList.replaceChildren();

    strengthText.textContent = "-";
    progress.style.width = "0%";

    result.hidden = true;

    passwordInput.focus();
});
