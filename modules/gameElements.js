import { LETTERS, WEIGHTS } from "./letters.js";

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
            let highlight = document.createElement("div");
            document.body.appendChild(highlight);

            let drawHighlight;
            let rec;

            if (index < BOARD_DIM) {
                highlight.className = "rowHighlight";

                drawHighlight = () => {
                    rec = gridArray[index][start].getBoundingClientRect();

                    let last =
                        gridArray[index][end - 1].getBoundingClientRect();

                    rec.width = last.right - rec.left;

                    rec.y += rec.height / 4;
                    rec.x += rec.height / 6;
                    rec.width -= rec.height / 3;
                    rec.height /= 2;

                    let docRec = document.body.getBoundingClientRect();
                    rec.y -= docRec.y;
                    rec.x -= docRec.x;

                    highlight.style.top = rec.top + "px";
                    highlight.style.left = rec.left + "px";
                    highlight.style.width = rec.width + "px";
                    highlight.style.height = rec.height + "px";
                };
            } else {
                highlight.className = "colHighlight";

                drawHighlight = () => {
                    rec =
                        gridArray[start][
                            index - BOARD_DIM
                        ].getBoundingClientRect();

                    let last =
                        gridArray[end - 1][
                            index - BOARD_DIM
                        ].getBoundingClientRect();

                    rec.height = last.bottom - rec.top;

                    rec.x += rec.width / 4;
                    rec.y += rec.width / 6;
                    rec.height -= rec.width / 3;
                    rec.width /= 2;

                    let docRec = document.body.getBoundingClientRect();
                    rec.y -= docRec.y;
                    rec.x -= docRec.x;

                    highlight.style.top = rec.top + "px";
                    highlight.style.left = rec.left + "px";
                    highlight.style.width = rec.width + "px";
                    highlight.style.height = rec.height + "px";
                };
            }

            drawHighlight();
            window.addEventListener("resize", () => {
                drawHighlight();
                setTimeout(drawHighlight, 1000);
            });
        },
    };
})();

const charChooser = (() => {
    function randomWeightedLetter() {
        let selection = RNG();

        let accumulator = 0;

        for (let i = 0; i < WEIGHTS.length; i++) {
            accumulator += WEIGHTS[i];
            if (selection < accumulator) {
                return LETTERS[i];
            }
        }

        throw "NO LETTER SELECTION ERROR";
        return "E";
    }

    function generateCharList(len) {
        let choices = [];

        for (let i = 0; i < len; i++) {
            choices.push(randomWeightedLetter());
        }

        return choices;
    }

    const e_NEXT = document.getElementById("nextLetter"); //DOM element of next letter
    const e_NEXTCONTAINER = document.getElementById("nextContainer");
    const e_FINALSCORE = document.getElementById("finalScore");

    let dt = new Date();
    const SEED = (
        dt.getUTCFullYear() +
        dt.getUTCMonth() * 100000 +
        dt.getUTCDate() * 10000000
    ).toString();

    function cyrb128(str) {
        let h1 = 1779033703,
            h2 = 3144134277,
            h3 = 1013904242,
            h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        return [
            (h1 ^ h2 ^ h3 ^ h4) >>> 0,
            (h2 ^ h1) >>> 0,
            (h3 ^ h1) >>> 0,
            (h4 ^ h1) >>> 0,
        ];
    }

    function sfc32(a, b, c, d) {
        return function () {
            a >>>= 0;
            b >>>= 0;
            c >>>= 0;
            d >>>= 0;
            var t = (a + b) | 0;
            a = b ^ (b >>> 9);
            b = (c + (c << 3)) | 0;
            c = (c << 21) | (c >>> 11);
            d = (d + 1) | 0;
            t = (t + d) | 0;
            c = (c + t) | 0;
            return (t >>> 0) / 4294967296;
        };
    }

    const RNG = sfc32(...cyrb128(SEED));

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
