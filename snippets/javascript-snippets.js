const javascript_snippets = [
    {
        project: {
            fullName: 'JPCS Cart',
            language: 'javascript',
            licenseName: 'MIT',
        },
        url: '',
        content: `function main() {\n\tconsole.log("Hello World!");\n}`,
        path: 'index.js',
    },

    {
        project: {
            fullName: 'JPCS Cart',
            language: 'javascript',
            licenseName: 'MIT',
        },
        url: '',
        content: 'function addNumbers(a, b) {\n\treturn a + b;\n}',
        path: 'index.js',
    },

    {
        project: {
            fullName: 'JPCS Cart',
            language: 'javascript',
            licenseName: 'MIT',
        },
        url: '',
        content: `const fruits = ['apple', 'banana', 'orange'];\nconst fruit = fruits[Math.floor(Math.random() * fruits.length)];\nconsole.log(fruit);`,
        path: 'index.js',
    },


    {
        project: {
            fullName: 'JPCS Cart',
            language: 'cpp',
            licenseName: 'MIT',
        },
        url: '',
        content: `int main() {\n\tstd::cout << "Hello World!" << std::endl;\n\treturn 0;\n}`,
        path: 'main.cpp',
    },

    {
        project: {
            fullName: 'JPCS Cart',
            language: 'cpp',
            licenseName: 'MIT',
        },
        url: '',
        content: `int main() {\n\tint a = 5;\n\tint b = 10;\n\tstd::cout << a + b << std::endl;\n\treturn 0;\n}`,
        path: 'addingNumbers.cpp'
    }
];

const fruits = ['apple', 'banana', 'orange'];
const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
console.log(`Today's random fruit is: ${randomFruit}`);

module.exports = {
    javascript_snippets
}