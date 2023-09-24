const { Player } = require("./player");

// TODO: probably better to use hash map ??
class RoomManager {

    constructor() {
        this.races = [];
    }


    createRace(raceId, userId) {
        const newRace = {
            id: raceId,
            owner: userId,
            state: "waiting", // "waiting", "running", "finished
            players: {},
            startTime: null,
        };

        this.races.push(newRace);
        return newRace;
    }

    getRaceById(raceId) {
        return this.races.find((race) => race.id === raceId);
    }

    joinRace(raceId, user) {
        const race = this.getRaceById(raceId);
        if (race) {
            race.players[user.uuid] = Player.fromUser(raceId, user, race.literals);
            console.log(user.name + " joined room " + raceId);
            return true;
        }
        return false; // Race not found
    }

    startRace(raceId) {
        const race = this.getRaceById(raceId);
    }


    getParticipants(raceId) {
        const race = this.getRaceById(raceId);
        return race ? race.players : {};
    }

    getTimeElapsed(raceId) {
        const race = this.getRaceById(raceId);
        if (race && race.startTime) {
            const currentTime = new Date();
            return (currentTime - race.startTime) / 1000; // Convert to seconds
        }
        return 0;
    }

    leaveRace(raceId, userId) {
        const race = this.getRaceById(raceId);
        if (race) {
            // remove userId from race players
            race.players[userId] = null;
            console.log("User " + userId + " left the room.");
        }
    }

    finishRace(raceId) {
        const race = this.getRaceById(raceId);
        if (race) {
            console.log(`${raceId} finished.`);
            race.state = "finished";
        }
    }
}

module.exports = {
    RoomManager
}