export const COURSE_MODULES = [
  {
    id: "module-1",
    title: "Module 1: Python Basics & Setup",
    duration: "4 Hours",
    lessons: [
      {
        id: "l1-1",
        title: "Introduction to Python & Installation",
        content: `### What is Python?
Python is a popular, high-level programming language known for its simplicity and readability. It's used in web development, data science, AI, automation, and more.

### Why Python?
*   **Easy to Learn:** Python uses English-like syntax.
*   **Versatile:** You can build websites, analyze data, or write scripts.
*   **Huge Community:** Millions of developers use Python.

### Installation
1.  Go to [python.org](https://python.org).
2.  Download the latest version for your OS.
3.  **Important:** Check the box "Add Python to PATH" during installation.
4.  Open your terminal/command prompt and type \`python --version\` to verify.`,
        quiz: {
          question: "What must you check during installation on Windows?",
          options: ["Install for all users", "Add Python to PATH", "Download debug symbols", "Install documentation"],
          answer: 1
        }
      },
      {
        id: "l1-2",
        title: "Your First Python Program",
        content: `### The Print Function
In Python, the \`print()\` function is used to output text to the console. It's the most basic way to communicate with the user.

### Syntax
\`\`\`python
print("Your text here")
\`\`\`

*   You must use parentheses \`()\`.
*   Text (strings) must be inside quotes \`""\` or \`''\`.

### Common Mistakes
*   Missing quotes: \`print(Hello)\` (Error!)
*   Capital P: \`Print("Hello")\` (Error! Python is case-sensitive)

### Challenge
Write a program that prints exactly: **Hello, Python!**`,
        challenge: {
          description: "Use the print function to output 'Hello, Python!' to the console.",
          initialCode: `# Write your code below
print("Hello, World!") # Change this line`,
          expectedOutput: "Hello, Python!"
        },
        quiz: {
          question: "Which function is used to output text?",
          options: ["echo()", "console.log()", "print()", "write()"],
          answer: 2
        }
      },
      {
        id: "l1-3",
        title: "Variables and Data Types",
        content: `### Variables
Variables are containers for storing data values. Unlike other languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.

\`\`\`python
x = 5
name = "John"
\`\`\`

### Data Types
*   **String (\`str\`):** Text, e.g., \`"Hello"\`
*   **Integer (\`int\`):** Whole numbers, e.g., \`20\`
*   **Float (\`float\`):** Decimal numbers, e.g., \`20.5\`
*   **Boolean (\`bool\`):** Truth values, \`True\` or \`False\`

### Challenge
Create a variable named \`city\` and assign it the value \`"Kathmandu"\`. Then print the variable.`,
        challenge: {
          description: "Define a variable 'city' with value 'Kathmandu' and print it.",
          initialCode: `# Create variable city
city = ""

# Print it
print(city)`,
          expectedOutput: "Kathmandu"
        },
        quiz: {
          question: "Which type represents decimal numbers?",
          options: ["int", "decimal", "float", "double"],
          answer: 2
        }
      }
    ]
  },
  {
    id: "module-2",
    title: "Module 2: Control Flow & Logic",
    duration: "6 Hours",
    lessons: [
      {
        id: "l2-1",
        title: "If, Elif, Else Statements",
        content: `### Making Decisions
Python supports the usual logical conditions from mathematics:
*   Equals: \`a == b\`
*   Not Equals: \`a != b\`
*   Less than: \`a < b\`

### Syntax
\`\`\`python
if condition:
    # code to run if true
elif other_condition:
    # code to run if 1st is false but this is true
else:
    # code to run if nothing else is true
\`\`\`

**Indentation is crucial!** Python uses whitespace to define blocks of code.

### Challenge
Write an if-else statement. If \`age\` is 18 or more, print "Adult". Otherwise, print "Minor". Set \`age = 20\`.`,
        challenge: {
          description: "Set age to 20. Write logic to print 'Adult' if age >= 18, else 'Minor'.",
          initialCode: `age = 15 # Change this to 20

if age < 18:
    print("Minor")
else:
    print("Adult")`,
          expectedOutput: "Adult"
        },
        quiz: {
          question: "Which keyword checks for an alternative condition?",
          options: ["else if", "elif", "elseif", "otherwise"],
          answer: 1
        }
      },
      {
        id: "l2-2",
        title: "Loops (For & While)",
        content: `### For Loops
A \`for\` loop is used for iterating over a sequence (that is either a list, a tuple, a dictionary, a set, or a string).

\`\`\`python
fruits = ["apple", "banana", "cherry"]
for x in fruits:
  print(x)
\`\`\`

### The range() Function
To loop through a set of code a specified number of times, we can use the \`range()\` function.
\`range(6)\` generates numbers from 0 to 5.

### Challenge
Use a for loop and \`range()\` to print numbers from 0 to 4.`,
        challenge: {
          description: "Print numbers 0, 1, 2, 3, 4 using a for loop.",
          initialCode: `# Write a loop to print 0 to 4
for i in range(3): # Fix the range
    print(i)`,
          expectedOutput: "0\n1\n2\n3\n4"
        },
        quiz: {
          question: "range(5) generates numbers up to what?",
          options: ["5", "4", "6", "Unlimited"],
          answer: 1
        }
      }
    ]
  },
  {
    id: "module-3",
    title: "Module 3: Data Structures",
    duration: "8 Hours",
    lessons: [
      {
        id: "l3-1",
        title: "Lists & Tuples",
        content: `### Lists
Lists are used to store multiple items in a single variable. Lists are created using square brackets \`[]\`.

\`\`\`python
my_list = ["apple", "banana", "cherry"]
print(my_list[0]) # apple
\`\`\`

**Lists are mutable**, meaning we can change, add, and remove items after it has been created.

### Tuples
Tuples are similar to lists but are **immutable** (unchangeable). They use parentheses \`()\`.

\`\`\`python
my_tuple = ("apple", "banana", "cherry")
\`\`\`

### Challenge
Create a list named \`colors\` with "Red", "Green", and "Blue". Print the second item ("Green").`,
        challenge: {
          description: "Create list 'colors' with Red, Green, Blue. Print the second item.",
          initialCode: `colors = ["Red", "Green", "Blue"]
# Print the second item (index 1)
print(colors[0])`,
          expectedOutput: "Green"
        },
        quiz: {
          question: "Which data structure is immutable?",
          options: ["List", "Dictionary", "Set", "Tuple"],
          answer: 3
        }
      },
      {
        id: "l3-2",
        title: "Dictionaries & Sets",
        content: `### Dictionaries
Dictionaries are used to store data values in key:value pairs. They are ordered, changeable, and do not allow duplicates.

\`\`\`python
thisdict = {
  "brand": "Ford",
  "model": "Mustang",
  "year": 1964
}
print(thisdict["brand"])
\`\`\`

### Sets
Sets are used to store multiple items in a single variable. A set is a collection which is unordered, unchangeable*, and unindexed.

\`\`\`python
myset = {"apple", "banana", "cherry"}
\`\`\`

### Challenge
Create a dictionary named \`person\` with keys "name" (value "Arpit") and "age" (value 25). Print the name.`,
        challenge: {
          description: "Create dict 'person' with name='Arpit', age=25. Print the name.",
          initialCode: `person = {
    "name": "Arpit",
    "age": 25
}
# Print the name
print(person["age"])`,
          expectedOutput: "Arpit"
        },
        quiz: {
          question: "How do you access a value in a dictionary?",
          options: ["By index", "By key", "By value", "By order"],
          answer: 1
        }
      }
    ]
  },
  {
    id: "module-4",
    title: "Module 4: Functions & Modules",
    duration: "6 Hours",
    lessons: [
      {
        id: "l4-1",
        title: "Defining Functions",
        content: `### Functions
A function is a block of code which only runs when it is called. You can pass data, known as parameters, into a function. A function can return data as a result.

### Creating a Function
In Python a function is defined using the \`def\` keyword:

\`\`\`python
def my_function():
  print("Hello from a function")
\`\`\`

### Calling a Function
To call a function, use the function name followed by parenthesis:

\`\`\`python
my_function()
\`\`\`

### Challenge
Define a function named \`greet\` that prints "Namaste". Then call it.`,
        challenge: {
          description: "Define function 'greet' that prints 'Namaste'. Call it.",
          initialCode: `def greet():
    # Your code here
    pass

# Call the function
`,
          expectedOutput: "Namaste"
        },
        quiz: {
          question: "Which keyword defines a function?",
          options: ["func", "function", "def", "define"],
          answer: 2
        }
      },
      {
        id: "l4-2",
        title: "Lambda Functions",
        content: `### Lambda
A lambda function is a small anonymous function.
A lambda function can take any number of arguments, but can only have one expression.

### Syntax
\`lambda arguments : expression\`

\`\`\`python
x = lambda a : a + 10
print(x(5))
\`\`\`

### Challenge
Create a lambda function named \`double\` that takes one argument \`x\` and returns \`x * 2\`. Print the result of \`double(5)\`.`,
        challenge: {
          description: "Create lambda 'double' that multiplies input by 2. Print double(5).",
          initialCode: `double = lambda x: x # Fix this
print(double(5))`,
          expectedOutput: "10"
        },
        quiz: {
          question: "What is a lambda function?",
          options: ["A large function", "An anonymous function", "A loop", "A module"],
          answer: 1
        }
      }
    ]
  },
  {
    id: "module-5",
    title: "Module 5: Object Oriented Programming (OOP)",
    duration: "10 Hours",
    lessons: [
      {
        id: "l5-1",
        title: "Classes & Objects",
        content: `### Classes/Objects
Python is an object oriented programming language.
Almost everything in Python is an object, with its properties and methods.
A Class is like an object constructor, or a "blueprint" for creating objects.

### Create a Class
To create a class, use the keyword \`class\`:

\`\`\`python
class MyClass:
  x = 5
\`\`\`

### The __init__() Function
All classes have a function called \`__init__()\`, which is always executed when the class is being initiated.

### Challenge
Create a class \`Person\` with an \`__init__\` method that sets \`name\`. Create an object \`p1\` with name "John" and print \`p1.name\`.`,
        challenge: {
          description: "Class Person with name attribute. Create instance 'John'. Print name.",
          initialCode: `class Person:
    def __init__(self, name):
        self.name = name

p1 = Person("John")
print(p1.name)`,
          expectedOutput: "John"
        },
        quiz: {
          question: "What is the constructor method in Python?",
          options: ["__construct__", "__init__", "__start__", "__setup__"],
          answer: 1
        }
      },
      {
        id: "l5-2",
        title: "Inheritance",
        content: `### Inheritance
Inheritance allows us to define a class that inherits all the methods and properties from another class.

*   **Parent class** is the class being inherited from, also called base class.
*   **Child class** is the class that inherits from another class, also called derived class.

\`\`\`python
class Student(Person):
  pass
\`\`\`

### Challenge
Create a class \`Student\` that inherits from \`Person\` (from previous lesson). Create a student object and print their name.`,
        challenge: {
          description: "Inherit Student from Person. Create Student 'Alice'. Print name.",
          initialCode: `class Person:
    def __init__(self, name):
        self.name = name

class Student(Person):
    pass

s = Student("Alice")
print(s.name)`,
          expectedOutput: "Alice"
        },
        quiz: {
          question: "Which concept allows a child class to use parent methods?",
          options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
          answer: 1
        }
      }
    ]
  },
  {
    id: "module-6",
    title: "Module 6: File Handling & Error Handling",
    duration: "4 Hours",
    lessons: [
      {
        id: "l6-1",
        title: "Reading & Writing Files",
        content: `### File Handling
The key function for working with files in Python is the \`open()\` function.
The \`open()\` function takes two parameters; filename, and mode.

There are four different methods (modes) for opening a file:
*   \`"r"\` - Read - Default value. Opens a file for reading, error if the file does not exist
*   \`"a"\` - Append - Opens a file for appending, creates the file if it does not exist
*   \`"w"\` - Write - Opens a file for writing, creates the file if it does not exist
*   \`"x"\` - Create - Creates the specified file, returns an error if the file exists

### Challenge
(Note: File operations are restricted in this browser playground. This is a theoretical lesson.)
Print "File Opened" to simulate opening a file.`,
        challenge: {
          description: "Print 'File Opened'.",
          initialCode: `print("File Opened")`,
          expectedOutput: "File Opened"
        },
        quiz: {
          question: "Which mode opens a file for writing?",
          options: ["'r'", "'w'", "'a'", "'x'"],
          answer: 1
        }
      },
      {
        id: "l6-2",
        title: "Try, Except, Finally",
        content: `### Exception Handling
The \`try\` block lets you test a block of code for errors.
The \`except\` block lets you handle the error.
The \`else\` block lets you execute code when there is no error.
The \`finally\` block lets you execute code, regardless of the result of the try- and except blocks.

\`\`\`python
try:
  print(x)
except:
  print("An exception occurred")
\`\`\`

### Challenge
Write a try-except block. Try to print undefined variable \`z\`. In except, print "Error caught".`,
        challenge: {
          description: "Try to print 'z'. Catch error and print 'Error caught'.",
          initialCode: `try:
    print(z)
except:
    print("Error caught")`,
          expectedOutput: "Error caught"
        },
        quiz: {
          question: "Which block executes regardless of error?",
          options: ["try", "except", "else", "finally"],
          answer: 3
        }
      }
    ]
  },
  {
    id: "module-7",
    title: "Module 7: Final Project & Advanced Topics",
    duration: "6 Hours",
    lessons: [
      {
        id: "l7-1",
        title: "Building a Real Application",
        content: `### Final Project
You have learned the basics of Python!
*   Variables & Types
*   Control Flow (If/Else, Loops)
*   Data Structures (Lists, Dicts)
*   Functions
*   OOP
*   Error Handling

### Next Steps
To become a professional developer:
1.  Build projects (Calculators, To-Do Lists, Web Scrapers).
2.  Learn a framework (Django, Flask for web; Pandas for data).
3.  Practice on LeetCode or HackerRank.

### Challenge
Print "I am a Python Developer!" to complete the course.`,
        challenge: {
          description: "Print 'I am a Python Developer!'",
          initialCode: `print("I am a Python Developer!")`,
          expectedOutput: "I am a Python Developer!"
        },
        quiz: {
          question: "What is the best way to structure a large project?",
          options: ["One big file", "Multiple modules/packages", "Global variables", "No structure"],
          answer: 1
        }
      }
    ]
  }
];

export const FINAL_EXAM_DATA = [
  { id: 1, question: "What is the correct file extension for Python files?", options: [".pt", ".pyt", ".py", ".python"], answer: 2, relatedLessonId: "l1-1" },
  { id: 2, question: "Which operator is used for exponentiation in Python?", options: ["^", "**", "//", "exp()"], answer: 1, relatedLessonId: "l1-3" },
  { id: 3, question: "How do you create a function in Python?", options: ["function x():", "def x():", "create x():", "func x():"], answer: 1, relatedLessonId: "l4-1" },
  { id: 4, question: "Which collection is ordered, changeable, and allows duplicate members?", options: ["Set", "Dictionary", "Tuple", "List"], answer: 3, relatedLessonId: "l3-1" },
  { id: 5, question: "What is the output of: print(10 // 3)?", options: ["3.33", "3", "4", "3.0"], answer: 1, relatedLessonId: "l1-3" },
  { id: 6, question: "Which method adds an item to the end of a list?", options: ["push()", "add()", "append()", "insert()"], answer: 2, relatedLessonId: "l3-1" },
  { id: 7, question: "How do you start a comment in Python?", options: ["//", "/*", "#", "<!--"], answer: 2, relatedLessonId: "l1-2" },
  { id: 8, question: "Which function returns the length of a list?", options: ["count()", "size()", "length()", "len()"], answer: 3, relatedLessonId: "l3-1" },
  { id: 9, question: "What is the result of 'Hello'[1]?", options: ["H", "e", "l", "o"], answer: 1, relatedLessonId: "l1-3" },
  { id: 10, question: "Which keyword is used to import a module?", options: ["include", "import", "require", "using"], answer: 1, relatedLessonId: "l1-1" },
  { id: 11, question: "What does 'pip' stand for?", options: ["Python Install Package", "Pip Installs Packages", "Package Installer Python", "None of the above"], answer: 1, relatedLessonId: "l1-1" },
  { id: 12, question: "Which statement is used to stop a loop?", options: ["stop", "exit", "break", "return"], answer: 2, relatedLessonId: "l2-2" },
  { id: 13, question: "What is a correct syntax to output 'Hello World' in Python?", options: ["p('Hello World')", "echo 'Hello World'", "print('Hello World')", "Console.WriteLine('Hello World')"], answer: 2, relatedLessonId: "l1-2" },
  { id: 14, question: "How do you insert COMMENTS in Python code?", options: ["/* This is a comment */", "# This is a comment", "// This is a comment", "<!-- This is a comment -->"], answer: 1, relatedLessonId: "l1-2" },
  { id: 15, question: "Which one is NOT a legal variable name?", options: ["_myvar", "my_var", "Myvar", "my-var"], answer: 3, relatedLessonId: "l1-3" },
  { id: 16, question: "How do you create a variable with the numeric value 5?", options: ["x = 5", "x = int(5)", "Both are correct", "None are correct"], answer: 2, relatedLessonId: "l1-3" },
  { id: 17, question: "What is the correct file extension for Python files?", options: [".pyth", ".pt", ".py", ".pyt"], answer: 2, relatedLessonId: "l1-1" },
  { id: 18, question: "How do you create a dictionary?", options: ["{}", "[]", "()", "<>"], answer: 0, relatedLessonId: "l3-3" },
  { id: 19, question: "Which operator is used to multiply numbers?", options: ["%", "/", "#", "*"], answer: 3, relatedLessonId: "l1-3" },
  { id: 20, question: "Which operator can be used to compare two values?", options: ["<>", "==", "=", "><"], answer: 1, relatedLessonId: "l2-1" },
  { id: 21, question: "Which of these collections defines a LIST?", options: ["{'name': 'apple', 'color': 'green'}", "('apple', 'banana', 'cherry')", "{'apple', 'banana', 'cherry'}", "['apple', 'banana', 'cherry']"], answer: 3, relatedLessonId: "l3-1" },
  { id: 22, question: "Which of these collections defines a TUPLE?", options: ["{'name': 'apple', 'color': 'green'}", "('apple', 'banana', 'cherry')", "{'apple', 'banana', 'cherry'}", "['apple', 'banana', 'cherry']"], answer: 1, relatedLessonId: "l3-2" },
  { id: 23, question: "Which of these collections defines a SET?", options: ["{'name': 'apple', 'color': 'green'}", "('apple', 'banana', 'cherry')", "{'apple', 'banana', 'cherry'}", "['apple', 'banana', 'cherry']"], answer: 2, relatedLessonId: "l3-2" },
  { id: 24, question: "Which of these collections defines a DICTIONARY?", options: ["{'name': 'apple', 'color': 'green'}", "('apple', 'banana', 'cherry')", "{'apple', 'banana', 'cherry'}", "['apple', 'banana', 'cherry']"], answer: 0, relatedLessonId: "l3-3" },
  { id: 25, question: "Which collection does not allow duplicate members?", options: ["List", "Tuple", "Set", "All of the above"], answer: 2, relatedLessonId: "l3-2" },
  { id: 26, question: "How do you start a while loop?", options: ["while x > y:", "while (x > y)", "x > y while {", "while x > y {"], answer: 0, relatedLessonId: "l2-2" },
  { id: 27, question: "How do you start a for loop?", options: ["for x in y:", "for each x in y:", "for x > y:", "for x in y {"], answer: 0, relatedLessonId: "l2-2" },
  { id: 28, question: "Which statement is used to stop a loop?", options: ["stop", "return", "break", "exit"], answer: 2, relatedLessonId: "l2-2" },
  { id: 29, question: "Which function is used to read a string from standard input?", options: ["cin", "scanf", "input()", "get()"], answer: 2, relatedLessonId: "l1-2" },
  { id: 30, question: "What is the output of print(2 ** 3)?", options: ["6", "8", "9", "5"], answer: 1, relatedLessonId: "l1-3" }
];
