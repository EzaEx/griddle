import { board, charChooser } from "./modules/gameElements.js";
import { WORDS } from "./modules/words.js";

const game = (() => {
    function onClickCallback() {
        if (charChooser.isComplete()) {
            onGameComplete();
            return;
        }

        charChooser.nextChoice();
        board.setPlacingChar(charChooser.getCurrentChoice());
    }

    //returns longest in-order subword of a string of characters (w)
    function longestWordIn(w) {
        //checking for lengths of words in descending order (only down to length 2)
        for (let length = w.length; length >= 2; length--) {
            //starting from index 0, look across as many spaces as will fit words of desired length
            for (let start = 0; start <= w.length - length; start++) {
                //extract substring of desired length
                let subword = w.substring(start, start + length);

                //check if words exists in dict
                if (WORDS[length - 1].includes(subword)) {
                    return { len: length, start, end: start + length };
                }
            }
        }
        //no subwords found :(
        return { len: 0, start: 0, end: 0 };
    }

    function onGameComplete() {
        charChooser.hide();

        let words = board.getWords();

        let totalScore = 0;

        words.forEach((w, i) => {
            let data = longestWordIn(w);

            board.setScore(i, data.len);
            totalScore += data.len;

            board.markWord(i, data.start, data.end);
        });

        board.revealScores();
        charChooser.showScore(totalScore);
    }

    board.setClickCallback(onClickCallback);

    board.setPlacingChar(charChooser.getCurrentChoice());
})();
