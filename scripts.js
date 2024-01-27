let currentRowArray; // array of strings that represent each word (as received from the API)
let currentRowInnerHTML_Raw = ""; // a string of all the words separated by spaces - named "Raw" because it doesn't have any span tags
let currentRowInnerHTML_Processed = ""; // the string of words with added <span> tags used to color the letters as the user types
let typedKeyValue; //the key typed by the user
let highlightCharIndex = 0; // index of highlighted key
let rowLength = 0; // number of total chars in the current row (considers words and the spaces inbetween)
let charStates; // characters can have one of four states:
// 0 -> not reached
// 1 -> highlighted (current)
// 2 -> typed correctly
// 3 -> typed wrong      -> CharStates is an array that stores the state value for each character
let currentWordIsCorrect = 1;
let currentWordCount = 0; // number of correctly typed words
let maxWordCount = 0; // max number of correctly typed words
let timer = 60;
let counterInterval; // 60 sec timer animation
let cursorInterval; // cursor animation

async function getRandomWords() { // gets a list of 10 random words with an API request 
    const response = await fetch("https://random-word-api.vercel.app/api?words=10");
    try {
        currentRowArray = await response.json();
    } catch (error) {
        console.log("error: " + error);
        alert("error: " + error);
    }
    buildCurrentRowInnerHTML();
    displayCurrentRow();
}

function buildCurrentRowInnerHTML() { //obtains the values for three of the variables declared above:currentRowInnerHTML_Raw, rowLength, charStates (initialization)
    for (let i = 0; i < currentRowArray.length; ++i) {
        currentRowInnerHTML_Raw += currentRowArray[i]; //currentRowInnerHTML_Raw - the string of all the words received from the API call separated by spaces
        if (i < currentRowArray.length - 1) {
            currentRowInnerHTML_Raw += " ";
        }
    }
    rowLength = currentRowInnerHTML_Raw.length; // row length
    charStates = Array(rowLength).fill(0); // initialize the states array and indicates that the first char is highlighted
    charStates[0] = 1;
}

function displayCurrentRow() { //build the contents of the HTML element called "htmlWordList" in "currentRowInnerHTML_Processed" then assigns the result to "htmlWordList"
    if(highlightCharIndex < rowLength) {
        for (let i = 0; i < currentRowInnerHTML_Raw.length; ++i) {
            if (charStates[i] == 0) {
                currentRowInnerHTML_Processed += currentRowInnerHTML_Raw[i]; // each char in the string "currentRowInnerHTML_Processed" will have span tags for styling purposes except the letters that haven't been reached
            } else if (charStates[i] == 1) {
                currentRowInnerHTML_Processed += "<span id='highlighted'>" + currentRowInnerHTML_Raw[i] + "</span>";
            } else if (charStates[i] == 2) {
                currentRowInnerHTML_Processed += "<span class='typedCorrectly'>" + currentRowInnerHTML_Raw[i] + "</span>";
            } else {
                currentRowInnerHTML_Processed += "<span class='typedWrong'>" + currentRowInnerHTML_Raw[i] + "</span>";
            }
        }
        document.getElementById("htmlWordList").innerHTML = currentRowInnerHTML_Processed;
        currentRowInnerHTML_Processed = "";
    } else {
        clearExistingRow();
    }
}

function updateCurrentRowState() { // compares the highlighted char with user input then updates the charStates array and the counters accordingly
        let currentLetter = currentRowInnerHTML_Raw[highlightCharIndex];
        if (typedKeyValue == currentLetter) {
            charStates[highlightCharIndex] = 2; // 2 is for the correcltly typed value
        } else {
            charStates[highlightCharIndex] = 3; // 3 is for the wrong value
        }
        if (highlightCharIndex < currentRowInnerHTML_Raw.length - 1) { //if not at row's end highlight the next char
            charStates[highlightCharIndex + 1] = 1;
        }
        if ((typedKeyValue == " " || highlightCharIndex == currentRowInnerHTML_Raw.length - 1) && typedKeyValue == currentLetter) {
            if (currentWordIsCorrect) {
                ++currentWordCount;
                updateCounterPads();
            } else {
                currentWordIsCorrect = 1;
            }
        }
        ++highlightCharIndex; // "highlightCharIndex" tracks which char is highlihted
}

function addKeyListener() {
    document.addEventListener("keyup",handleKeyUp);
}

function handleKeyUp(eventParameter){
    typedKeyValue = eventParameter.key;
    updateCurrentRowState();
    displayCurrentRow();
}

function removeKeyListener() {
    document.removeEventListener("keyup",handleKeyUp);
}

function runTimer() {
    addKeyListener();
    document.getElementById("start").hidden = true;
    document.getElementById("reset").hidden = false;
    let timerElement = document.getElementById("timer");
    timerElement.hidden = false;						 
    timerElement.classList.remove("timerCounterOff");
    timerElement.classList.add("timerCounterOn");
    counterInterval = setInterval(  //set counter animation
        () => {
            --timer;
            document.getElementById("timer").innerHTML = timer;
            if (timer == 0) {
                clearInterval(counterInterval);
                clearInterval(cursorInterval);
                timerElement.classList.remove("timerCounterOn"); // styling switch because the counter text and the end message share the same html element
                timerElement.classList.add("timerCounterOff");
                updateCounterPads();
                timer = 60;
                removeKeyListener();
                document.getElementById("timer").innerHTML = "You have typed " + currentWordCount + " words correctly. Reset to try again.";
            }
        }, 1000);
	cursorInterval = setInterval(
        () => {
            let highlightedChar = document.getElementById("highlighted");
            if (highlightedChar.classList.contains("cursorAnimationFrame1")) {
                highlightedChar.classList.remove("cursorAnimationFrame1");
                highlightedChar.classList.add("cursorAnimationFrame2");
            } else {
                highlightedChar.classList.remove("cursorAnimationFrame2");
                highlightedChar.classList.add("cursorAnimationFrame1");
            }
        }, 200);
}

function resetTimer() {
    removeKeyListener();
    clearExistingRow();
    document.getElementById("start").hidden = false;
    document.getElementById("reset").hidden = true;
    document.getElementById("timer").hidden = true;
    clearInterval(counterInterval);
    clearInterval(cursorInterval);
    document.getElementById("timer").innerHTML = "60";
    timer = 60;
    resetCounter();
}

function clearExistingRow() {
    currentRowInnerHTML_Raw = "";
    highlightCharIndex = 0;
    rowLength = 0;
    getRandomWords();
}

function resetCounter() {
    currentWordCount = 0;
    updateCounterPads();
} 

function updateCounterPads() {
    if (currentWordCount > maxWordCount) {
        maxWordCount = currentWordCount;
    }
    document.getElementById("countValue").innerHTML = currentWordCount.toString().padStart(3, '0');
    document.getElementById("maxValue").innerHTML = maxWordCount.toString().padStart(3, '0');
}

getRandomWords();
