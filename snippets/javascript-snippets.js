const javascript_snippets = [
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
        content: `int main() {\n\tint a = 5;\n\tint b = 10;\n\tcout << a + b << endl;\n\treturn 0;\n}`,
        path: 'addingNumbers.cpp'
    },

    {
        project: {
            fullName: 'My C++ Project',
            language: 'cpp',
            licenseName: 'MIT',
        },
        url: 'https://github.com/mycppproject',
        content: `#include <iostream>\n\nusing namespace std;\n\nint main() {\n\tint a = 5;\n\tint b = 10;\n\tcout << a + b << endl;\n\treturn 0;\n}`,
        path: 'addingNumbers.cpp'
    },
    {
        project: {
            fullName: 'C++ Calculator',
            language: 'cpp',
            licenseName: 'GPL',
        },
        url: 'https://github.com/cppcalculator',
        content: `#include <iostream>\n\nusing namespace std;\n\nint main() {\n\tint x = 20;\n\tint y = 30;\n\tcout << x * y << endl;\n\treturn 0;\n}`,
        path: 'multiplyNumbers.cpp'
    },
    {
        project: {
            fullName: 'C++ Game Engine',
            language: 'cpp',
            licenseName: 'Apache License 2.0',
        },
        url: 'https://github.com/cppgameengine',
        content: `#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint main() {\n\tstring message = "Hello, World!";\n\tcout << message << endl;\n\treturn 0;\n}`,
        path: 'helloWorld.cpp'
    },

    {
        project: {
            fullName: 'C++ Data Structures',
            language: 'cpp',
            licenseName: 'BSD 3-Clause',
        },
        url: 'https://github.com/cppdatastructures',
        content: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint main() {\n\tvector<int> numbers = {1, 2, 3, 4, 5};\n\tfor (int num : numbers) {\n\t\tcout << num << " ";\n\t}\n\tcout << endl;\n\treturn 0;\n}`,
        path: 'vectorExample.cpp'
    },
    {
        project: {
            fullName: 'C++ Sorting Algorithms',
            language: 'cpp',
            licenseName: 'MIT',
        },
        url: 'https://github.com/cppsort',
        content: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n\tvector<int> numbers = {5, 3, 1, 4, 2};\n\tsort(numbers.begin(), numbers.end());\n\tfor (int num : numbers) {\n\t\tcout << num << " ";\n\t}\n\tcout << endl;\n}`,
        path: 'sortingExample.cpp'
    },
    {
        project: {
            fullName: 'C++ Sorting Algorithms',
            language: 'cpp',
            licenseName: 'MIT',
        },
        url: 'https://github.com/cppsort',
        content: `#include <iostream>\n\nusing namespace std;\nint main() {\n\tstring username;\n\tcout << "Enter your username: ";\n\t\n\tcout << "Your username is: " << username;\n}`,
        path: 'sortingExample.cpp'
    }


];

module.exports = {
    javascript_snippets
}