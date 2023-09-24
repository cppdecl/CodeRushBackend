 class ResultManager {
    getTimeMS(race, racePlayer) {
        const firstTimeStampMS = race['startTime'];
        const keyStrokes = racePlayer.validKeyStrokes();
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

    getMistakesCount(racePlayer) {
        return racePlayer.incorrectKeyStrokes().length;
    }

    getAccuracy(race, racePlayer) {
        const incorrectKeyStrokes = this.getMistakesCount(racePlayer);
        const validKeyStrokes = racePlayer.validKeyStrokes().length;
        const totalKeySrokes = validKeyStrokes + incorrectKeyStrokes;
        return Math.floor((validKeyStrokes / totalKeySrokes) * 100);
    }

    getResult(challenge, race, raceId, racePlayer) {
        const timeMS = this.getTimeMS(race, racePlayer);
        return {
            raceId: raceId,
            user: {
                id: racePlayer.id,
                username: racePlayer.username,
            },
            timeMS: timeMS,
            challenge: challenge,
            cpm: this.getCPM(challenge, timeMS),
            mistakes: this.getMistakesCount(racePlayer),
            accuracy: this.getAccuracy(race, racePlayer)
        };
    }
}


module.exports = {
    ResultManager
};