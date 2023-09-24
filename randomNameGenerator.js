
const words = [
    "apple",
    "banana",
    "cherry",
    "dog",
    "elephant",
    "fox",
    "grape",
    "horse",
    "iguana",
    "jellyfish",
    "kiwi",
    "lemon",
    "monkey",
    "narwhal",
    "octopus",
    "panda",
    "quokka",
    "rabbit",
    "squirrel",
    "tiger",
    "umbrella",
    "vulture",
    "walrus",
    "xylophone",
    "yak",
    "zebra",
];

function generateRandomName() {
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];

    const name = `${word1}-${word2}`;

    return name;
}
module.exports = generateRandomName;
