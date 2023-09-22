
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

const express = require('express');
const app = express();

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('coderush.db')

console.log("JPCS Code Rush Backend Service")

// Database Functions

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS players(
        uuid TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        top_wpm INTEGER,
        is_admin INTEGER
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

app.post('/api/v2/player', (req, res) => {
    const { type, data } = req.body;
    console.log('Type: ' + type);
    console.log('Data: ' + data);
}) 

// Listening Worker

const server = app.listen(4000, function () {
    let host = server.address().address
    let port = server.address().port
})

