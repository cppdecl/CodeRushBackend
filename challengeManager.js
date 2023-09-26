const { javascript_snippets } = require('./snippets/javascript-snippets');

class ChallengeManager {

    getRandomChallenge() {
        const length = javascript_snippets.length;
        
        var challenge = javascript_snippets[Math.floor(Math.random() * length)];
        challenge = this.trimChallengeContent(challenge);
        return challenge;

    }

    trimChallengeContent(challenge) {
        challenge.content = challenge.content.trim();
        return challenge;
    }
}

module.exports= {
    ChallengeManager
}