const sqlite3 = require('sqlite3').verbose()

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

    incrementGameCount(userId) {
        const queryToUpdateGames = 'UPDATE players SET total_games = total_games + 1 WHERE uuid = ?'
        db.run(queryToUpdateGames, [userId], function (err) 
        {
            if (err) 
            {
                console.error(`Error updating total_games: ${err.message}`);
            } 
            else 
            {
                console.log(`Total games updated for player with UUID ${userId}`);
            }
        });
    }

    updateTopWPM(userId, newWpm) {
        const querySelectTotalWPM = 'SELECT top_wpm FROM players WHERE uuid = ?';

        this.db.get(querySelectTotalWPM, [userId], function (err, row) 
        {
            if (err) 
            {
                console.error(`Error retrieving top_wpm: ${err.message}`);
                return;
            }

            if (row && row.top_wpm > newWpm) 
            {
                console.log(`The existing top_wpm (${row.top_wpm}) is higher than the incoming WPM (${wpm}). No update is performed.`);
            } 
            else 
            {
                const queryUpdateTotalWPM = 'UPDATE players SET top_wpm = ? WHERE uuid = ?';
                
                this.db.run(queryUpdateTotalWPM, [newWpm, userId], function (err) 
                {
                    if (err) 
                    {
                        console.error(`Error updating top_wpm: ${err.message}`);
                    } 
                    else 
                    {
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