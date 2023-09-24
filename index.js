/*
    JPCS Code Rush Game for JPCSCart: Code Rush
    Created: September 23, 2023
    Note: This is a single file service for 
          the DLSL Enlistment Week 2023 as
          such a light game doesn't really
          require that much complex file and
          folder structure to begin with. 
    Author: Coffee Delulu of C1A 2023
*/

const express = require("express");
const app = express();
const http = require('http');
const httpServer = http.Server(app);
const { Server } = require("socket.io");
const util = require('util');
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));


const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('coderush.db')
const readline = require('readline');
const generateRandomName = require("./randomNameGenerator");
const { ResultManager } = require("./resultManager");

// map of session id to player id
const sessionMap = {};

// map of room id to race session
const raceMap = {};

// map of user id to room id
const userRaceMap = {};

// map of challenge id to room id
const roomChallengeMap = {};

const resultManager = new ResultManager();


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
    res.json(
        {
            message: 'CodeRush Api Works :)',
            from: 'Coffee'
        })
})

app.post('/api/v2/player', (req, res) => {
    if (!req.body.hasOwnProperty('type')) {
        res.status(400).json(
            {
                error: 'Bad Request',
                message: "No 'type' property in api request"
            })
        return
    }

    if (!req.body.hasOwnProperty('data')) {
        res.status(400).json(
            {
                error: 'Bad Request',
                message: "No 'data' property in api request"
            })
        return
    }

    const { type, data } = req.body

    console.log('API Call Type: ' + type)

    if (type == 'register_player') {

    }
    else if (type == 'player_data_request') {
        if (!data.hasOwnProperty('uuid')) {
            res.status(400).json(
                {
                    error: 'Bad Request',
                    message: "No 'uuid' property in api request"
                })
            return
        }

        const { uuid } = data

        const query = 'SELECT * FROM players WHERE uuid COLLATE NOCASE = ?'

        db.all(query, [uuid], (err, rows) => {
            if (err) {
                console.error(`Error retrieving player data: ${err.message}`)
                res.status(400).json({ error: 'Internal Server Error' })
            }
            else {
                if (rows.length > 0) {
                    res.status(200).json({ data: rows })
                }
                else {
                    console.log('Player Not Found')
                    res.status(400).json(
                        {
                            error: 'Player Not Found',
                            message: "Idk bro, player doesn't exist"
                        })
                    return
                }
            }
        })
    }
    else if (type == 'request_all_player_data') {
        const query = 'SELECT * FROM players'

        db.all(query, (err, rows) => {
            if (err) {
                console.error(`Error retrieving player data: ${err.message}`)
                res.status(400).json({ error: 'Internal Server Error' })
            }
            else {
                res.status(200).json({ data: rows })
            }
        })
    }
    else if (type == 'increment_player_game_count') {

    }
    else if (type == 'update_player_top_wpm') {
        if (!data.hasOwnProperty('uuid')) {
            res.status(400).json(
                {
                    error: 'Bad Request',
                    message: "No 'uuid' property in api request"
                })
            return
        }

        if (!data.hasOwnProperty('wpm')) {
            res.status(400).json(
                {
                    error: 'Bad Request',
                    message: "No 'wpm' property in api request"
                })
            return
        }

        const { uuid, wpm } = data

        const querySelectTotalWPM = 'SELECT top_wpm FROM players WHERE uuid = ?'

        db.get(querySelectTotalWPM, [uuid], function (err, row) {
            if (err) {
                console.error(`Error retrieving top_wpm: ${err.message}`)
                res.status(400).json({ error: 'Internal Server Error' })
                return
            }

            if (row && row.top_wpm > wpm) {
                console.log(`The existing top_wpm (${row.top_wpm}) is higher than the incoming WPM (${wpm}). No update is performed.`)
                res.status(400).json(
                    {
                        error: 'Bad Request',
                        message: "Incoming WPM is higher than current Top WPM in api request"
                    })
            }
            else {
                const queryUpdateTotalWPM = 'UPDATE players SET top_wpm = ? WHERE uuid = ?'

                db.run(queryUpdateTotalWPM, [wpm, uuid], function (err) {
                    if (err) {
                        console.error(`Error updating top_wpm: ${err.message}`)
                        res.status(400).json({ error: 'Internal Server Error' })
                    }
                    else {
                        console.log(`Top WPM updated for player with UUID ${uuid}`)
                        res.status(200).json({ message: "OK" })
                    }
                })
            }
        })
    }
    else {
        console.error(`Invalid Request Attempt`)
        res.status(400).json(
            {
                error: 'Bad Request',
                message: 'Invalid API Request. Why?'
            })
    }
});

function getPlayer(uuid) {
    const query = 'SELECT * FROM players WHERE uuid COLLATE NOCASE = ?'

    const all = util.promisify(db.all.bind(db));
    return all(query, [uuid]).then((rows, err) => {
        console.log(err, rows);
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

// Listening Worker

// const server = app.listen(4000, function () {
//     let host = server.address().address
//     let port = server.address().port
// })

httpServer.listen(4000, () => {
    console.log('listening on *:4000');
});


// events
io.on('connection', async (socket) => {
    const userId = socket.request._query['userId'];
    const sessionId = socket.id;

    var player = await getPlayer(userId);
    if (player == null) {
        console.log("Registering Player: " + userId);
        await registerPlayer(userId, null);
        console.log("Registered Player: " + (player = await getPlayer(userId)).name);
    }

    console.log(player.name + " connected.");

    sessionMap[sessionId] = userId;

    socket.on('disconnect', () => {
        sessionMap[sessionId] = null;
        raceMap[userId] = null;
        userRaceMap[userId] = null;
    });


    socket.on('player_data_request', (data) => {
        console.log('player_data_request: ' + data);
    });


    // user started playing
    socket.on('play', (data) => {
        const userId = sessionMap[sessionId];
        console.log("Play: " + userId);

        const challenge = {
            project: {
                fullName: 'JPCS Cart',
                language: 'javascript',
                licenseName: 'MIT',
            },
            url: '',
            content: 'console.log("Hello World")',
            path: 'index.js',
        }

        var roomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        roomChallengeMap[roomId] = challenge;
        userRaceMap[userId] = roomId;
        raceMap[roomId] = {
            state: 'started',
            players: {
                [userId]: {
                    keyStrokes: [],
                    progress: 0
                }
            },
        };

        socket.emit('challenge_selected', challenge);
    });

    // called on multiplayer only
    socket.on('start_race', (data) => {
        console.log("Race Started");
    });

    socket.on('key_stroke', (keyStroke) => {
        keyStroke["timestamp"] = Date.now();



        var userId = sessionMap[sessionId];
        var roomId = userRaceMap[userId];

        var room = raceMap[roomId];
        if (room == null) {
            console.error("Room " + roomId + " not found")
            return;
        }

        const keyStrokes = room.players[userId].keyStrokes;
        if (keyStrokes.length == 0) {
            raceMap[roomId].startTime = keyStroke.timestamp;
        }

        keyStrokes.push(keyStroke);

        if (keyStroke["correct"]) {
            updateProgress(userId);
        }

        const progress = room.players[userId].progress;
        if (progress == 100) {
            const result = resultManager.getResult(roomChallengeMap[roomId].content, room, roomId, userId);
            socket.emit('race_completed', result);
        }
    });


});

function updateProgress(userId) {
    const roomId = userRaceMap[userId];
    const challengeContent = roomChallengeMap[roomId];
    const keyStrokes = raceMap[roomId].players[userId].keyStrokes;

    const currentInput = keyStrokes.filter((keyStroke) => {
        return keyStroke["correct"] || false;
    }).map((e) => e['key']).join('');

    const code = challengeContent.content;
    const progress = Math.floor(
        (currentInput.length / code.length) * 100,
    );

    raceMap[roomId].players[userId].progress = progress;

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