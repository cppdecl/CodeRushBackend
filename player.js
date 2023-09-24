const { calculateLiterals } = require('./literalUtils.js');

class Player {
    constructor(id, username, recentlyTypedLiteral) {
        this.id = id;
        this.username = username;
        this.recentlyTypedLiteral = recentlyTypedLiteral;

        this.literalOffset = 0;
        this.literals = [];
        this.progress = 0;
        this.keyStrokes = [];
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            progress: this.progress,
            keyStrokes: this.keyStrokes,
        }
    }

    reset(literals) {
        this.literals = literals;
        this.literalOffset = 0;
        this.recentlyTypedLiteral = this.literals[this.literalOffset];
        this.progress = 0;
        this.saved = false;
        this.typedKeyStrokes = [];
    }

    validKeyStrokes() {
        const keyStrokes = this.typedKeyStrokes;
        const latestKeyStrokePerIndex = Object.fromEntries(
            keyStrokes.map((keyStroke) => {
                return [keyStroke.index, keyStroke];
            }),
        );
        const firstIncorrectKeystroke = Object.values(latestKeyStrokePerIndex).find(
            (keystroke) => !keystroke.correct,
        );
        const validKeyStrokes = Object.values(latestKeyStrokePerIndex)
            .filter((keyStroke) => keyStroke.correct)
            .filter((keystroke) =>
                firstIncorrectKeystroke
                    ? keystroke.index < firstIncorrectKeystroke.index
                    : true,
            );
        return validKeyStrokes;
    }

    incorrectKeyStrokes() {
        const incorrectKeyStrokes = this.typedKeyStrokes.filter(
            (keyStroke) => !keyStroke.correct,
        );
        return incorrectKeyStrokes;
    }

    getValidInput() {
        const validInput = this.validKeyStrokes()
            .map((keyStroke) => keyStroke.key)
            .join('');
        return validInput;
    }

    addKeyStroke(keyStroke) {
        keyStroke.timestamp = new Date().getTime();
        this.typedKeyStrokes.push(keyStroke);
    }

    updateLiteral(code, keyStroke) {
        const untypedCode = code.substring(keyStroke.index);
        const nextLiteral = this.literals[this.literalOffset + 1];
        const startsWithNextLiteral = calculateLiterals(untypedCode.trimStart())
            .join('')
            .startsWith(nextLiteral);
        if (startsWithNextLiteral && this.literals.length > 1) {
            this.literalOffset++;
        }
        this.recentlyTypedLiteral = this.literals[this.literalOffset];
    }


    hasNotStartedTyping() {
        return this.typedKeyStrokes.length === 0;
    }

    hasCompleted () {
        return this.progress === 100;
    }

    static fromUser(raceId, user, literals) {
        const player = new Player(user.uuid, user.name, literals[0]);
        player.progress = 0;
        player.literals = literals;
        player.literalOffset = 0;
        player.raceId = raceId;
        player.id = user.uuid;
        player.typedKeyStrokes = [];
        return player;
    }
}




module.exports = {
    Player
}