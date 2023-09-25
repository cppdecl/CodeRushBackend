class ChallengeManager {

    getRandomChallenge() {
        const challenge = {
            project: {
                fullName: 'JPCS Cart',
                language: 'javascript',
                licenseName: 'MIT',
            },
            url: '',
            content: 'console.log("Hello World!");',
            path: 'index.js',
        }
    }
}

export default {
    ChallengeManager
}