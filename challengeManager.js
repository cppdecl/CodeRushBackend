const { javascript_snippets } = require('./snippets/javascript-snippets');

class ChallengeManager {

    getRandomChallenge() {
        const length = javascript_snippets.length;
        return javascript_snippets[Math.floor(Math.random() * length)];
    }
}

module.exports= {
    ChallengeManager
}