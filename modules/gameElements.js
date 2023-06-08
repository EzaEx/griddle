const BOARD_DIM = 5;

const board = (() => {
    const BLANK = "⠀"; //blank character for correct rendering
    let gridArray = []; //2D array of board-squares divs
    let scoreArray = []; //1D array of board-scoring divs, (rows 1,2,... columns 1,2,...)
    let e_board = document.getElementById("board"); //DOM element of board
    let e_lastRow;

    let placingChar = BLANK;
    let clickCallback = () => {};

    function onSquareClick(e) {
        let square = e.target;

        if (!square.isSet) {
            square.isSet = true;
            square.classList.add("isSet");

            square.innerText = placingChar;
            clickCallback();
        }
    }

    function buildRow(size, isColumnScores = false) {
        let row = document.createElement("div");
        row.className = "row";
        if (isColumnScores) {
            row.classList.add("finalRow");
            e_lastRow = row;
        }

        gridArray.push([]);

        for (let x = 0; x < size + 1; x++) {
            let square = document.createElement("span");
            square.innerText = BLANK;
            square.className = "square";
            row.appendChild(square);

            if (x != size && !isColumnScores) {
                //standard square
                square.onclick = onSquareClick;
                gridArray[gridArray.length - 1].push(square);
            } else if (
                (x == size && !isColumnScores) ||
                (x != size && isColumnScores)
            ) {
                //scoring square
                square.classList.add("scoring");

                if (isColumnScores) square.classList.add("columnScore");

                scoreArray.push(square);
            } else {
                //hidden (bottom-right) square
                square.classList.add("blank");
            }
        }

        return row;
    }

    //build board
    for (let y = 0; y < BOARD_DIM + 1; y++) {
        let row =
            y == BOARD_DIM
                ? buildRow(BOARD_DIM, true)
                : buildRow(BOARD_DIM, false);
        e_board.appendChild(row);
    }

    return {
        setPlacingChar: (char) => {
            placingChar = char;
        },
        setClickCallback: (func) => {
            clickCallback = func;
        },

        setScore: (index, score) => {
            scoreArray[index].innerText = score;
        },
        revealScores: () => {
            e_lastRow.classList.add("visible");
            scoreArray.forEach((s) => s.classList.add("visible"));
        },

        getWords: () => {
            let words = [];

            //get each row as a word
            for (let y = 0; y < BOARD_DIM; y++) {
                let str = "";
                for (let x = 0; x < BOARD_DIM; x++) {
                    str += gridArray[y][x].innerText;
                }
                words.push(str);
            }

            //get each column as a word
            for (let x = 0; x < BOARD_DIM; x++) {
                let str = "";
                for (let y = 0; y < BOARD_DIM; y++) {
                    str += gridArray[y][x].innerText;
                }
                words.push(str);
            }

            return words;
        },

        markWord: (index, start, end) => {
            if (index < BOARD_DIM) {
                for (let x = start; x < end; x++) {
                    gridArray[index][x].classList.add("rowWord");
                }
            } else {
                for (let y = start; y < end; y++) {
                    gridArray[y][index - BOARD_DIM].classList.add("colWord");
                }
            }
        },
    };
})();

const charChooser = (() => {
    function randFromList(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    function generateCharList(len) {
        const VOWELS = "AEIOU";
        const CONSTANANTS = "BCDFGHKLMNPRSTVWY";

        let choices = [];

        for (let i = 0; i < len; i++) {
            choices.push(
                Math.random() < 0.38
                    ? randFromList(VOWELS)
                    : randFromList(CONSTANANTS)
            );
        }

        return choices;
    }

    const e_NEXT = document.getElementById("nextLetter"); //DOM element of next letter
    const e_NEXTCONTAINER = document.getElementById("nextContainer");
    const e_FINALSCORE = document.getElementById("finalScore");

    let choices = generateCharList(BOARD_DIM ** 2);

    let currentChar = "PLACEHOLDER";

    function nextChar() {
        currentChar = choices.pop();
        e_NEXT.innerText = currentChar;
    }

    nextChar();

    return {
        getCurrentChoice: () => {
            return currentChar;
        },
        nextChoice: () => {
            nextChar();
        },
        isComplete: () => {
            return choices.length == 0;
        },
        hide: () => {
            e_NEXTCONTAINER.hidden = true;
        },
        showScore: (score) => {
            e_FINALSCORE.hidden = false;
            e_FINALSCORE.innerHTML = e_FINALSCORE.innerHTML.replace("9", score);
        },
    };
})();

export { board, charChooser };
