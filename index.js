/*
    JPCS Code Rush Game for JPCSCart: Code Rush
    Created: September 23, 2023
    Note: This is a single file service for 
          the DLSL Enlistment Week 2023 as
          such a light game doesn't really
          require that much complex file and
          folder structure to begin with. 
    Author: Coffee Delulu & Tyron Scott
*/
const PORT = process.env.PORT || 4000;

const express = require("express");
const app = express();

const server = app.listen(PORT, () => { });
const cors = require("cors")

const ioServer = require("socket.io")(server, {
    cors: {
        origin: ["http://localhost:3001", "https://5tszpsmv-3001.asse.devtunnels.ms/", "https://needed-wrench-production.up.railway.app"],
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

const util = require('util');

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(cors({ origin: ["https://5tszpsmv-3001.asse.devtunnels.ms/"] }));
app.use(bodyParser.urlencoded({ extended: false }));


const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('coderush.db')
const readline = require('readline');
const generateRandomName = require("./randomNameGenerator");
const { ResultManager } = require("./resultManager");
const { RoomManager } = require("./roomManager");
const { calculateLiterals } = require("./literalUtils");
const { ChallengeManager } = require("./challengeManager");

// map of user id to room id
const userRaceMap = {};

// map of challenge id to room id
const roomChallengeMap = {};

const resultManager = new ResultManager();
const roomManager = new RoomManager();
const challengeManager = new ChallengeManager();

console.log("JPCS Code Rush Backend Service")

// Database Initialization

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS players(
        uuid TEXT NOT NULL PRIMARY KEY CHECK (uuid <> ''),
        name TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (name <> ''),
        top_wpm INTEGER DEFAULT 0,
        total_games INTEGER DEFAULT 0,
        is_admin INTEGER DEFAULT 0
    )`)
})

// Routing 

app.get('/', (req, res) => {
    console.log(req.method + ' Request From ' + req.hostname + ' > ' + req.path)
    res.json({
        message: 'CodeRush Api Works :)',
        from: 'Coffee'
    })
})

const query = 'SELECT * FROM players WHERE uuid COLLATE NOCASE = ?'
function getPlayer(uuid) {

    const all = util.promisify(db.all.bind(db));
    return all(query, [uuid]).then((rows, err) => {
        if (err) {
            console.error(`Error retrieving player data: ${JSON.stringify(err)}`)
            return null;
        } else {
            if (rows.length > 0) {
                return rows[0];
            } else {
                console.log('Player Not Found')
                return null;
            }
        }
    });
}

function genRoomID(length) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';

    while (result.length < length) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        const randomChar = alphabet[randomIndex];
        if (!result.includes(randomChar)) {
            result += randomChar;
        }
    }

    return result;
}

async function registerPlayer(uuid, name) {

    if (name == null) {
        name = generateRandomName();
    }

    if (name.length < 3) {
        console.err("Name is too short");
        return;
    }

    if (/[^a-zA-Z0-9_-]/.test(name)) {
        console.error("Name contains invalid characters");
        return;
    }

    const run = util.promisify(db.run.bind(db));
    await run(`INSERT INTO players 
    (
        uuid, 
        name
    ) 
    VALUES (?, ?)`,
        [
            uuid,
            name
        ],
        function (err) {
            if (err) {
                console.error(`Error adding new player ${name}:`, err.message)
                return;
            } else {
                console.log(`New player ${name} added with row id ${this.lastID}!`)
                return;
            }
        });

}

// events
ioServer.on('connection', async (socket) => {
    const userId = socket.request._query['userId'];
    const sessionId = socket.id;

    var player = await getPlayer(userId);
    if (player == null) {
        console.log("Registering Player: " + userId);
        await registerPlayer(userId, null);
        console.log("Registered Player: " + (player = await getPlayer(userId)).name);
    }

    console.log(player.name + " connected.");

    socket.on('disconnect', () => {
        const raceId = userRaceMap[userId];
        const room = roomManager.getRaceById(raceId);
        if (room) {
            roomManager.leaveRace(raceId, userId);
            userRaceMap[userId] = null;

            ioServer.to(raceId).emit('member_left', {
                member: userId,
                owner: room.owner
            });
        }
    });

    socket.on('player_data_request', (data) => {
        console.log('player_data_request: ' + data);
    });

    socket.on('join', data => {
        const raceId = data.id;
        const spectator = data.spectator;

        console.log('join: ' + raceId);

        const room = roomManager.getRaceById(raceId);
        if (!room) {
            socket.emit('race_does_not_exist', raceId);
            return;
        }

        userRaceMap[userId] = raceId;
        socket.join(raceId);

        if (spectator) {
            room.spectators.push(userId);

            socket.emit('race_joined', {
                ...room,
                players: roomManager.getParticipants(raceId),
                challenge: roomChallengeMap[raceId],
            });
            return;
        }
        

        room.literals = calculateLiterals(roomChallengeMap[raceId].content);

        roomManager.joinRace(raceId, player);

        ioServer.to(raceId).emit('member_joined', {
            id: userId,
            username: player.name,
            progress: 0,
            recentlyTypedLiteral: '',
        });
        socket.emit('race_joined', {
            ...room,
            players: roomManager.getParticipants(raceId),
            challenge: roomChallengeMap[raceId],
        });
    });

    // user started playing
    socket.on('play', (data) => {
        console.log("Play: " + userId);

        const challenge = getChallenge();

        var roomId;

        do {
            roomId = genRoomID(4);
        } while (roomManager.getRaceById(roomId));

        socket.join(roomId);

        roomChallengeMap[roomId] = challenge;
        userRaceMap[userId] = roomId;

        const room = roomManager.createRace(roomId, userId);
        if (!room) {
            socket.emit('race_does_not_exist', raceId);
            return;
        }
        room.literals = calculateLiterals(challenge.content);

        roomManager.joinRace(roomId, player);

        ioServer.to(roomId).emit('race_joined', {
            ...room,
            players: roomManager.getParticipants(roomId),
            challenge: challenge,
        });
    });

    socket.on('refresh_challenge', (data) => {
        const raceId = userRaceMap[userId];
        const room = roomManager.getRaceById(raceId);

        if (!room) {
            socket.emit('race_does_not_exist', raceId);
            return;
        }

        if (room.owner !== userId) {
            return;
        }

        const challenge = getChallenge();
        const literals = calculateLiterals(challenge.content);

        room.challenge = challenge;
        room.literals = literals;

        roomChallengeMap[raceId] = challenge;
        userRaceMap[userId] = raceId;

        Object.values(room.players).forEach((player) => {
            player.reset(literals);
        });

        ioServer.to(raceId).emit('race_joined', {
            ...room,
            players: roomManager.getParticipants(raceId),
        });
        ioServer.to(raceId).emit('challenge_selected', room.challenge);
    });

    // called on multiplayer only
    socket.on('start_race', (data) => {
        console.log("Race Started");

        const raceId = userRaceMap[userId];
        roomManager.startRace(raceId);

        let count = 5;
        const interval = setInterval(() => {
            ioServer.to(raceId).emit('countdown', count);
            count--;
            if (count === 0) {
                clearInterval(interval);
                ioServer.to(raceId).emit('countdown', null);

                ioServer.to(raceId).emit('race_started', new Date().getTime());
            }
        }, 1000);
    });

    socket.on('key_stroke', async (keyStroke) => {
        var roomId = userRaceMap[userId];
        var room = roomManager.getRaceById(roomId);
        if (room == null) {
            socket.emit('race_does_not_exist', raceId);
            return;
        }

        const racePlayer = room.players[userId];
        if (!racePlayer) {
            console.error(`Player ${userId} not found in room ${roomId}`)
            return;
        }
        
        keyStroke["timestamp"] = Date.now();

        if (racePlayer.hasNotStartedTyping()) {
            room.startTime = new Date().getTime();
        }

        racePlayer.addKeyStroke(keyStroke);
        if (keyStroke.correct) {
            racePlayer.progress = await calculateProgress(racePlayer);
            const code = roomChallengeMap[roomId].content;
            racePlayer.updateLiteral(code, keyStroke);


            const dto = {
                id: racePlayer.id,
                username: racePlayer.username,
                progress: racePlayer.progress,
                recentlyTypedLiteral: racePlayer.recentlyTypedLiteral,
            };
            ioServer.to(roomId).emit('progress_updated', dto);
        }


        if (racePlayer.hasCompleted()) {
            const result = resultManager.getResult(roomChallengeMap[roomId].content, room, roomId, racePlayer);
            ioServer.to(roomId).emit('race_completed', result);
        }

        // only finish race if all players are done
        const participants = roomManager.getParticipants(roomId);
        const allDone = Object.keys(participants).map((userId) => {
            return participants[userId].progress;
        }).filter((progress) => progress < 100).length == 0;
        if (allDone) {
            roomManager.finishRace(roomId);
        }
    });
});

function getChallenge() {
    return challengeManager.getRandomChallenge();
}

async function calculateProgress(racePlayer) {
    const roomId = userRaceMap[racePlayer.id];
    const room = roomManager.getRaceById(racePlayer.raceId);
    if (room == null) {
        socket.emit('race_does_not_exist', raceId);
        return;
    }
    const challengeContent = roomChallengeMap[roomId];

    const currentInput = racePlayer.getValidInput();

    const strippedCode = challengeContent.content
        .split('\n')
        .map((subText) => subText.trimStart())
        .join('\n');

    return Math.floor(
        (currentInput.length / strippedCode.length) * 100,
    );
}


// Commands Listener

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// Function to process user input

function processInput(input) {
    const [command, ...params] = input.split(' ')

    switch (command.toLowerCase()) {
        case 'hello':
            console.log('Hello!')
            break
        case 'add':
            const sum = params.map(Number).reduce((acc, val) => acc + val, 0)
            console.log('Sum:', sum)
            break
        case 'deluser':
            if (params.length < 1)
                break
            const nameToDelete = params[0].toLowerCase()
            const query = 'DELETE FROM players WHERE name COLLATE NOCASE = ?'
            db.run(query, [nameToDelete], function (err) {
                if (err) {
                    console.error(`Error deleting row: ${err.message}`)
                }
                else {
                    console.log(`Row(s) deleted: ${this.changes}`)
                }
            })
            break
        default:
            console.log('Unknown command:', command)
    }

    // Ask for the next input
    rl.question('', processInput)
}

// Start by asking for the first input
rl.question('', processInput)