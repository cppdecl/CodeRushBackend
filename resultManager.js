 class ResultManager {
    getTimeMS(race, player) {
        const firstTimeStampMS = race['startTime'];
        const keyStrokes = race['players'][player]['keyStrokes'].filter((e) => e['correct']);
        const lastTimeStampMS = keyStrokes[keyStrokes.length - 1].timestamp;
        return lastTimeStampMS - firstTimeStampMS;
    }

    getCPM(code, timeMS) {
        const timeSeconds = timeMS / 1000;
        const strippedCode = code;
        const cps = strippedCode.length / timeSeconds;
        const cpm = cps * 60;
        return Math.floor(cpm);
    }

    getMistakesCount(keyStrokes) {
        return keyStrokes.filter((e) => !e['correct']).length;
    }

    getAccuracy(race, player) {
        const incorrectKeyStrokes = this.getMistakesCount(race.players[player].keyStrokes);
        const validKeyStrokes = race.players[player].keyStrokes.filter((e) => e['correct']).length;
        const totalKeySrokes = validKeyStrokes + incorrectKeyStrokes;
        return Math.floor((validKeyStrokes / totalKeySrokes) * 100);
    }

    getResult(challenge, race, raceId, player) {
        const timeMS = this.getTimeMS(race, player);
        return {
            raceId: raceId,
            user: {
                id: player
            },
            timeMS: timeMS,
            challenge: challenge,
            cpm: this.getCPM(challenge, timeMS),
            mistakes: this.getMistakesCount(race.players[player].keyStrokes),
            accuracy: this.getAccuracy(race, player)
        };
    }
}


module.exports = {
    ResultManager
};