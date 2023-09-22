
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

const express = require('express')
const app = express();

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('coderush.db')

console.log("JPCS Code Rush Backend Service")

// Database Functions

db.serialize(() => 
{
    db.run(`CREATE TABLE IF NOT EXISTS players(
        uuid TEXT PRIMARY KEY DEFAULT '',
        name TEXT UNIQUE DEFAULT '',
        top_wpm INTEGER DEFAULT 0,
        is_admin INTEGER DEFAULT 0
    )`)
})

// Routing 

app.get('/', (req, res) => 
{
    console.log(req.method + ' Request From ' + req.hostname + ' > ' + req.path)
    res.json(
    {
        message: 'CodeRush Api Works :)',
        from: 'Coffee'
    })
})

app.post('/api/v2/player', (req, res) => 
{
    if (!req.body.hasOwnProperty('type'))
    {
        res.status(400).json(
        { 
            error: 'Bad Request',
            message: "No 'type' property in api request" 
        })
        return
    }

    if (!req.body.hasOwnProperty('data'))
    {
        res.status(400).json(
        { 
            error: 'Bad Request',
            message: "No 'data' property in api request" 
        })
        return
    }

    const { type, data } = req.body;

    console.log('API Call Type: ' + type);

    if (type == 'register_player') 
    {
        if (!data.hasOwnProperty('uuid'))
        {
            res.status(400).json(
            { 
                error: 'Bad Request',
                message: "No 'uuid' property in api request" 
            })
            return
        }

        if (!data.hasOwnProperty('name'))
        {
            res.status(400).json(
            { 
                error: 'Bad Request',
                message: "No 'name' property in api request" 
            })
            return
        }

        const { uuid, name } = data;

        db.run(`INSERT INTO players 
        (
            uuid, 
            name
        ) 
        VALUES (?, ?)`, 
        [
            uuid, 
            name
        ], 
        function (err) 
        {
            if (err) 
            {
                console.error(`Error adding new player ${name}:`, err.message);
                res.status(400).json(
                { 
                    error: 'Bad Request',
                    message: err.message
                })
                return

            } 
            else 
            {
                console.log(`New player ${name} added with row id ${this.lastID}!`)
                res.status(200).json({ message: "OK" })
                return
            }
        });
    }
    else
    {
        console.error(`Invalid Request Attempt`);
        res.status(400).json(
        { 
            error: 'Bad Request',
            message: 'Invalid'
        })
    }
}) 

// Listening Worker

const server = app.listen(4000, function () 
{
    let host = server.address().address
    let port = server.address().port
})

