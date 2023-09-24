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

    getAccuracy(race, playerId) {
        const incorrectKeyStrokes = this.getMistakesCount(race.players[playerId].keyStrokes);
        const validKeyStrokes = race.players[playerId].keyStrokes.filter((e) => e['correct']).length;
        const totalKeySrokes = validKeyStrokes + incorrectKeyStrokes;
        return Math.floor((validKeyStrokes / totalKeySrokes) * 100);
    }

    getResult(challenge, race, raceId, playerObject) {
        const timeMS = this.getTimeMS(race, playerObject.uuid);
        return {
            raceId: raceId,
            user: {
                id: playerObject.uuid,
                username: playerObject.name,
            },
            timeMS: timeMS,
            challenge: challenge,
            cpm: this.getCPM(challenge, timeMS),
            mistakes: this.getMistakesCount(race.players[playerObject.uuid].keyStrokes),
            accuracy: this.getAccuracy(race, playerObject.uuid)
        };
    }
}


module.exports = {
    ResultManager
};