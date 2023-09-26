const sqlite3 = require('sqlite3').verbose()
const util = require('util');

class DBManager {
    constructor() {
        this.db = new sqlite3.Database('coderush.db')
    }

    init() {
        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS players(
                uuid TEXT NOT NULL PRIMARY KEY CHECK (uuid <> ''),
                name TEXT NOT NULL COLLATE NOCASE UNIQUE CHECK (name <> ''),
                top_wpm INTEGER DEFAULT 0,
                total_games INTEGER DEFAULT 0,
                is_admin INTEGER DEFAULT 0
            )`)
        })
    }

    getPlayer(userId) {
        const query = 'SELECT * FROM players WHERE uuid COLLATE NOCASE = ?'
        const all = util.promisify(this.db.all.bind(this.db));
        return all(query, [userId]).then((rows, err) => {
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

    deletePlayer(name) {
        const query = 'DELETE FROM players WHERE name COLLATE NOCASE = ?'
        this.db.run(query, [name], function (err) {
            if (err) {
                console.error(`Error deleting row: ${err.message}`)
            }
            else {
                console.log(`Row(s) deleted: ${this.changes}`)
            }
        })
    }

    changePlayerName(userId, newName) {
        const run = util.promisify(this.db.run.bind(this.db));
        run(`UPDATE players SET name = ? WHERE uuid = ?`, [newName, userId], function (err) {
            if (err) {
                console.error(`Error changing username: ${err.message}`)
            }
            else {
                console.log(`Username changed: ${this.changes}`)
            }
        })
    }

    incrementGameCount(userId) {
        const queryToUpdateGames = 'UPDATE players SET total_games = total_games + 1 WHERE uuid = ?'
        this.db.run(queryToUpdateGames, [userId], function (err) 
        {
            if (err) 
            {
                console.error(`Error updating total_games: ${err.message}`);
            } 
            else 
            {
                console.log(`Total games updated for player with userId ${userId}`);
            }
        });
    }

    async getAllPlayersByRank() {
        const query = 'SELECT * FROM players ORDER BY top_wpm';
        const all = util.promisify(this.db.all.bind(this.db));
        return await all(query).then((rows, err) => {
            if (err) {
                console.log(`Failed to getAllPlayersByRank: ${err.message}`);
                return [];
            } else {
                console.log('`getAllPlayersByRank Success!');
                return rows;
            }
        });
    }

    async getPlayerPercentile(userId) {
        const players = await this.getAllPlayersByRank();
        
        const player = players.find(p => p.uuid === userId);
        if (!player) {
            return 0;
        }

        const playerRank = players.indexOf(player);
        const percentile = playerRank / players.length * 100;
        return percentile;
    }

    updateTopWPM(userId, newWpm) {
        const querySelectTotalWPM = 'SELECT top_wpm FROM players WHERE uuid = ?'
        this.db.get(querySelectTotalWPM, [userId], (err, row) => {
            if (err) {
                console.error(`Error retrieving top_wpm: ${err.message}`);
                return;
            }
    
            if (row && row.top_wpm > newWpm) {
                console.log(`The existing top_wpm (${row.top_wpm}) is higher than the incoming WPM (${newWpm}). No update is performed.`);
            } else {
                const queryUpdateTotalWPM = 'UPDATE players SET top_wpm = ? WHERE uuid = ?';
    
                this.db.run(queryUpdateTotalWPM, [newWpm, userId], (err) => {
                    if (err) {
                        console.error(`Error updating top_wpm: ${err.message}`);
                    } else {
                        console.log(`Top WPM updated for player with UUID ${userId}`);
                    }
                });
            }
        });
    }
}

module.exports = {
    DBManager
}