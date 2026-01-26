"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import CertificateTemplate from "@/components/CertificateTemplate";
import PythonPlayground from "@/components/PythonPlayground";

// Course Data
const MODULES = [
  {
    id: "basics",
    title: "Getting Started",
    icon: "bxl-python",
    color: "yellow",
    lessons: [
      { id: "intro", title: "What is Python?", duration: "4 min" },
      { id: "setup", title: "Setting Up Your Environment", duration: "6 min" },
      { id: "hello", title: "Your First Program", duration: "5 min" },
    ],
    quiz: {
      question: "What is Python primarily known for?",
      options: ["Complex syntax", "Readability and simplicity", "Gaming only", "Low-level programming"],
      correct: 1,
    }
  },
  {
    id: "variables",
    title: "Variables & Data Types",
    icon: "bx-data",
    color: "blue",
    lessons: [
      { id: "vars", title: "Variables & Assignment", duration: "6 min" },
      { id: "strings", title: "Working with Strings", duration: "8 min" },
      { id: "numbers", title: "Numbers & Math", duration: "7 min" },
    ],
    quiz: {
      question: "Which is the correct way to create a variable in Python?",
      options: ["var x = 5", "int x = 5", "x = 5", "let x = 5"],
      correct: 2,
    }
  },
  {
    id: "control",
    title: "Control Flow",
    icon: "bx-git-branch",
    color: "green",
    lessons: [
      { id: "conditions", title: "If/Else Statements", duration: "7 min" },
      { id: "loops", title: "For & While Loops", duration: "8 min" },
    ],
    quiz: {
      question: "What keyword ends an if statement block in Python?",
      options: ["end", "endif", "No keyword needed - use indentation", "close"],
      correct: 2,
    }
  },
  {
    id: "functions",
    title: "Functions & More",
    icon: "bx-code-block",
    color: "purple",
    lessons: [
      { id: "funcs", title: "Creating Functions", duration: "8 min" },
      { id: "lists", title: "Lists & Collections", duration: "7 min" },
      { id: "next", title: "What's Next?", duration: "4 min" },
    ],
    quiz: {
      question: "Which keyword is used to define a function in Python?",
      options: ["function", "func", "def", "define"],
      correct: 2,
    }
  },
];

// Lesson content
const LESSON_CONTENT: Record<string, { title: string; content: React.ReactNode; code?: string }> = {
  intro: {
    title: "What is Python?",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Python is one of the most popular and beginner-friendly programming languages in the world.</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <h4 className="font-bold text-yellow-500 mb-3 flex items-center gap-2">
              <i className="bx bx-star"></i> Why Learn Python?
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Beginner-friendly</strong> - Easy to read and write</li>
              <li>• <strong>Versatile</strong> - Web, AI, data science, automation</li>
              <li>• <strong>In-demand</strong> - Top skill for jobs worldwide</li>
              <li>• <strong>Large community</strong> - Tons of resources & help</li>
            </ul>
          </div>
          
          <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <h4 className="font-bold text-blue-500 mb-3 flex items-center gap-2">
              <i className="bx bx-briefcase"></i> Career Opportunities
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Web Developer</li>
              <li>• Data Scientist</li>
              <li>• Machine Learning Engineer</li>
              <li>• Automation Specialist</li>
            </ul>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-accent/50 border border-border">
          <h4 className="font-bold text-foreground mb-3">Companies Using Python</h4>
          <div className="flex flex-wrap gap-3">
            {["Google", "Netflix", "Instagram", "Spotify", "Dropbox"].map(company => (
              <span key={company} className="px-3 py-1.5 bg-background rounded-lg text-sm border border-border">{company}</span>
            ))}
          </div>
        </div>
      </div>
    )
  },
  setup: {
    title: "Setting Up Your Environment",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Get Python running on your computer in minutes.</p>
        
        <div className="space-y-3">
          {[
            { num: 1, title: "Download Python", desc: "Visit python.org and download the latest version", icon: "bx-download" },
            { num: 2, title: "Install Python", desc: "Run the installer and check 'Add Python to PATH'", icon: "bx-check-shield" },
            { num: 3, title: "Verify Installation", desc: "Open terminal/cmd and type: python --version", icon: "bx-terminal" },
            { num: 4, title: "Choose an Editor", desc: "VS Code is recommended for beginners", icon: "bx-code" },
          ].map(step => (
            <div key={step.num} className="flex items-start gap-4 p-4 rounded-xl bg-accent/30 border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <i className={`bx ${step.icon} text-xl text-primary`}></i>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Step {step.num}: {step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-green-500 font-semibold"><i className="bx bx-bulb mr-2"></i>Pro Tip: You can also practice Python directly in your browser using our interactive playground in this course!</p>
        </div>
      </div>
    )
  },
  hello: {
    title: "Your First Program",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Let&apos;s write your first Python program - the classic &quot;Hello, World!&quot;</p>
        
        <div className="p-5 rounded-xl bg-accent border border-border">
          <h4 className="font-bold text-foreground mb-3">The Code</h4>
          <pre className="bg-background p-4 rounded-lg text-sm overflow-x-auto">
            <code className="text-green-500">print</code>(<code className="text-yellow-500">&quot;Hello, World!&quot;</code>)
          </pre>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <h4 className="font-bold text-purple-500 mb-3">Breaking it Down</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><code className="text-green-500">print()</code> - A function that displays output</li>
              <li><code className="text-yellow-500">&quot;...&quot;</code> - Text inside quotes is a string</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <h4 className="font-bold text-cyan-500 mb-3">Try It!</h4>
            <p className="text-sm text-muted-foreground">Use the playground below to run this code and see the output.</p>
          </div>
        </div>
      </div>
    ),
    code: 'print("Hello, World!")\nprint("Welcome to Python!")'
  },
  vars: {
    title: "Variables & Assignment",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Variables are containers for storing data values. Python is dynamically typed - no need to declare types!</p>
        
        <div className="p-5 rounded-xl bg-accent border border-border">
          <h4 className="font-bold text-foreground mb-3">Creating Variables</h4>
          <pre className="bg-background p-4 rounded-lg text-sm overflow-x-auto">
{`name = "Alice"      # String
age = 25            # Integer
height = 5.6        # Float
is_student = True   # Boolean`}
          </pre>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          {[
            { type: "String", example: '"Hello"', color: "yellow" },
            { type: "Integer", example: "42", color: "blue" },
            { type: "Float", example: "3.14", color: "green" },
            { type: "Boolean", example: "True/False", color: "purple" },
          ].map(item => (
            <div key={item.type} className={`p-4 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 text-center`}>
              <div className={`font-bold text-${item.color}-500 mb-1`}>{item.type}</div>
              <code className="text-xs text-muted-foreground">{item.example}</code>
            </div>
          ))}
        </div>
      </div>
    ),
    code: '# Try creating your own variables!\nname = "Your Name"\nage = 20\nprint("Hello, " + name)\nprint("Age:", age)'
  },
  strings: {
    title: "Working with Strings",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Strings are sequences of characters. Python makes working with text easy!</p>
        
        <div className="p-5 rounded-xl bg-accent border border-border">
          <h4 className="font-bold text-foreground mb-3">String Operations</h4>
          <pre className="bg-background p-4 rounded-lg text-sm overflow-x-auto">
{`message = "Hello, Python!"

# Get length
print(len(message))      # 14

# Access characters
print(message[0])        # H (first)
print(message[-1])       # ! (last)

# Methods
print(message.upper())   # HELLO, PYTHON!
print(message.lower())   # hello, python!`}
          </pre>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { method: ".upper()", desc: "Converts to uppercase" },
            { method: ".lower()", desc: "Converts to lowercase" },
            { method: ".strip()", desc: "Removes whitespace" },
            { method: ".replace()", desc: "Replaces text" },
            { method: ".split()", desc: "Splits into list" },
            { method: ".join()", desc: "Joins list to string" },
          ].map(item => (
            <div key={item.method} className="p-3 rounded-lg bg-accent/30 border border-border">
              <code className="text-primary font-bold">{item.method}</code>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    code: 'text = "Hello, Python!"\nprint("Length:", len(text))\nprint("Upper:", text.upper())\nprint("Lower:", text.lower())'
  },
  numbers: {
    title: "Numbers & Math",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Python supports integers, floats, and complex numbers with built-in math operations.</p>
        
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="p-4 text-left">Operator</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Example</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-t border-border"><td className="p-4">+</td><td className="p-4">Addition</td><td className="p-4">5 + 3 = 8</td></tr>
              <tr className="border-t border-border"><td className="p-4">-</td><td className="p-4">Subtraction</td><td className="p-4">5 - 3 = 2</td></tr>
              <tr className="border-t border-border"><td className="p-4">*</td><td className="p-4">Multiplication</td><td className="p-4">5 * 3 = 15</td></tr>
              <tr className="border-t border-border"><td className="p-4">/</td><td className="p-4">Division</td><td className="p-4">5 / 2 = 2.5</td></tr>
              <tr className="border-t border-border"><td className="p-4">//</td><td className="p-4">Floor Division</td><td className="p-4">5 // 2 = 2</td></tr>
              <tr className="border-t border-border"><td className="p-4">%</td><td className="p-4">Modulus</td><td className="p-4">5 % 2 = 1</td></tr>
              <tr className="border-t border-border"><td className="p-4">**</td><td className="p-4">Exponent</td><td className="p-4">2 ** 3 = 8</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    code: '# Math operations\na = 10\nb = 3\n\nprint("Add:", a + b)\nprint("Subtract:", a - b)\nprint("Multiply:", a * b)\nprint("Divide:", a / b)\nprint("Power:", a ** b)'
  },
  conditions: {
    title: "If/Else Statements",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Control the flow of your program with conditional statements.</p>
        
        <div className="p-5 rounded-xl bg-accent border border-border">
          <h4 className="font-bold text-foreground mb-3">If/Elif/Else Syntax</h4>
          <pre className="bg-background p-4 rounded-lg text-sm overflow-x-auto">
{`age = 18

if age < 13:
    print("Child")
elif age < 20:
    print("Teenager")
else:
    print("Adult")`}
          </pre>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <h4 className="font-bold text-blue-500 mb-3">Comparison Operators</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <span>== (equal)</span><span>!= (not equal)</span>
              <span>&gt; (greater)</span><span>&lt; (less)</span>
              <span>&gt;= (greater or equal)</span><span>&lt;= (less or equal)</span>
            </div>
          </div>
          <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20">
            <h4 className="font-bold text-green-500 mb-3">Logical Operators</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><code>and</code> - Both must be True</li>
              <li><code>or</code> - Either can be True</li>
              <li><code>not</code> - Reverses the result</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    code: '# Try changing the score!\nscore = 85\n\nif score >= 90:\n    print("Grade: A")\nelif score >= 80:\n    print("Grade: B")\nelif score >= 70:\n    print("Grade: C")\nelse:\n    print("Grade: F")'
  },
  loops: {
    title: "For & While Loops",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Loops allow you to repeat code multiple times.</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <h4 className="font-bold text-purple-500 mb-3">For Loop</h4>
            <pre className="bg-background p-3 rounded-lg text-xs overflow-x-auto">
{`# Loop through a range
for i in range(5):
    print(i)  # 0,1,2,3,4

# Loop through a list
fruits = ["apple", "banana"]
for fruit in fruits:
    print(fruit)`}
            </pre>
          </div>
          
          <div className="p-5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <h4 className="font-bold text-orange-500 mb-3">While Loop</h4>
            <pre className="bg-background p-3 rounded-lg text-xs overflow-x-auto">
{`# Repeat while condition is True
count = 0
while count < 5:
    print(count)
    count += 1`}
            </pre>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-accent/50 border border-border">
          <h4 className="font-bold text-foreground mb-3">Loop Control</h4>
          <div className="flex gap-4">
            <span className="px-3 py-1.5 bg-red-500/10 rounded-lg text-red-500 text-sm"><code>break</code> - Exit loop</span>
            <span className="px-3 py-1.5 bg-yellow-500/10 rounded-lg text-yellow-500 text-sm"><code>continue</code> - Skip iteration</span>
          </div>
        </div>
      </div>
    ),
    code: '# For loop example\nfor i in range(1, 6):\n    print(f"Count: {i}")\n\nprint("---")\n\n# While loop example\nnum = 3\nwhile num > 0:\n    print(f"Countdown: {num}")\n    num -= 1\nprint("Done!")'
  },
  funcs: {
    title: "Creating Functions",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Functions are reusable blocks of code that perform specific tasks.</p>
        
        <div className="p-5 rounded-xl bg-accent border border-border">
          <h4 className="font-bold text-foreground mb-3">Function Syntax</h4>
          <pre className="bg-background p-4 rounded-lg text-sm overflow-x-auto">
{`def greet(name):
    """This is a docstring - describes the function"""
    return f"Hello, {name}!"

# Call the function
message = greet("Alice")
print(message)  # Hello, Alice!`}
          </pre>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <h5 className="font-bold text-blue-500 mb-2">Parameters</h5>
            <p className="text-xs text-muted-foreground">Values passed into the function</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <h5 className="font-bold text-green-500 mb-2">Return</h5>
            <p className="text-xs text-muted-foreground">Send a value back</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <h5 className="font-bold text-purple-500 mb-2">Docstring</h5>
            <p className="text-xs text-muted-foreground">Document your function</p>
          </div>
        </div>
      </div>
    ),
    code: '# Create a function\ndef add_numbers(a, b):\n    return a + b\n\ndef greet(name):\n    return f"Hello, {name}!"\n\n# Use them\nprint(add_numbers(5, 3))\nprint(greet("Python Learner"))'
  },
  lists: {
    title: "Lists & Collections",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Lists are ordered, mutable collections that can hold multiple items.</p>
        
        <div className="p-5 rounded-xl bg-accent border border-border">
          <h4 className="font-bold text-foreground mb-3">List Operations</h4>
          <pre className="bg-background p-4 rounded-lg text-sm overflow-x-auto">
{`fruits = ["apple", "banana", "cherry"]

# Add items
fruits.append("orange")

# Access items
print(fruits[0])   # apple
print(fruits[-1])  # orange

# Loop through
for fruit in fruits:
    print(fruit)`}
          </pre>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          {[
            { method: ".append()", desc: "Add to end" },
            { method: ".remove()", desc: "Remove item" },
            { method: ".pop()", desc: "Remove last" },
            { method: ".sort()", desc: "Sort list" },
          ].map(item => (
            <div key={item.method} className="p-3 rounded-lg bg-accent/30 border border-border text-center">
              <code className="text-primary font-bold text-sm">{item.method}</code>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    code: '# Working with lists\ncolors = ["red", "blue", "green"]\n\ncolors.append("yellow")\nprint("Colors:", colors)\n\nprint("First:", colors[0])\nprint("Length:", len(colors))\n\nfor color in colors:\n    print(f"- {color}")'
  },
  next: {
    title: "What's Next?",
    content: (
      <div className="space-y-6">
        <p className="text-lg text-muted-foreground">Congratulations on completing Python basics! Here&apos;s where to go next.</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: "File Handling", desc: "Read and write files", icon: "bx-file" },
            { title: "Error Handling", desc: "Try/except blocks", icon: "bx-error" },
            { title: "Object-Oriented Programming", desc: "Classes and objects", icon: "bx-cube" },
            { title: "Libraries", desc: "Explore NumPy, Pandas, etc.", icon: "bx-library" },
          ].map(topic => (
            <div key={topic.title} className="flex items-start gap-4 p-4 rounded-xl bg-accent/30 border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <i className={`bx ${topic.icon} text-xl text-primary`}></i>
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{topic.title}</h4>
                <p className="text-sm text-muted-foreground">{topic.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl bg-green-500/10 border border-green-500/20">
          <h4 className="font-bold text-green-500 mb-3 flex items-center gap-2">
            <i className="bx bx-trophy"></i> Keep Practicing!
          </h4>
          <p className="text-sm text-muted-foreground">The best way to learn programming is by building projects. Start with simple scripts and gradually take on bigger challenges!</p>
        </div>
      </div>
    )
  },
};

export default function PythonCoursePage() {
  const { data: session } = useSession();
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const activeModule = MODULES[activeModuleIndex];
  const activeLesson = activeModule.lessons[activeLessonIndex];
  const lessonContent = LESSON_CONTENT[activeLesson.id];
  
  const totalLessons = MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
  const progress = Math.round((completedLessons.length / totalLessons) * 100);

  const markComplete = () => {
    if (!completedLessons.includes(activeLesson.id)) {
      setCompletedLessons([...completedLessons, activeLesson.id]);
    }
  };

  const nextLesson = () => {
    markComplete();
    if (activeLessonIndex < activeModule.lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    } else {
      setShowQuiz(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    if (quizAnswer === activeModule.quiz.correct) {
      setTimeout(() => {
        if (activeModuleIndex < MODULES.length - 1) {
          setActiveModuleIndex(activeModuleIndex + 1);
          setActiveLessonIndex(0);
          setShowQuiz(false);
          setQuizAnswer(null);
          setQuizSubmitted(false);
        } else {
          handleCourseComplete();
        }
      }, 1500);
    }
  };

  const handleCourseComplete = async () => {
    setShowCertificate(true);
    try {
      await fetch("/api/courses/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: "basic-python" }),
      });
    } catch (err) {
      console.error("Failed to mark completion", err);
    }
  };

  if (showCertificate) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/courses" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
            <i className="bx bx-arrow-back mr-2"></i> Back to Courses
          </Link>
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="bx bx-trophy text-4xl text-yellow-500"></i>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Congratulations!</h2>
              <p className="text-muted-foreground">You have completed Basic Python Programming.</p>
            </div>
            <div className="flex justify-center overflow-auto py-4">
              <CertificateTemplate
                studentName={session?.user?.name || "Student"}
                courseName="Basic Python Programming"
                completionDate={new Date().toISOString()}
                instructorName="RojgaarNepal Team"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-linear-to-r from-yellow-600 to-orange-600 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/courses" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors text-sm">
            <i className="bx bx-arrow-back mr-2"></i> Back to Courses
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <i className="bx bxl-python text-3xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Basic Python Programming</h1>
              <p className="text-white/70">Learn Python from scratch</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-6 max-w-md">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>{completedLessons.length} of {totalLessons} lessons</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="border-b border-border bg-card/50 sticky top-12 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {MODULES.map((module, i) => (
              <button
                key={module.id}
                onClick={() => { setActiveModuleIndex(i); setActiveLessonIndex(0); setShowQuiz(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeModuleIndex === i
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <i className={`bx ${module.icon}`}></i>
                {module.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-4 sticky top-32">
              <h3 className="font-bold text-foreground mb-4">{activeModule.title}</h3>
              <nav className="space-y-1">
                {activeModule.lessons.map((lesson, i) => (
                  <button
                    key={lesson.id}
                    onClick={() => { setActiveLessonIndex(i); setShowQuiz(false); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-colors ${
                      activeLessonIndex === i && !showQuiz
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    {completedLessons.includes(lesson.id) ? (
                      <i className="bx bx-check-circle text-green-500"></i>
                    ) : (
                      <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">{i + 1}</span>
                    )}
                    <span className="flex-1">{lesson.title}</span>
                    <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                  </button>
                ))}
                <button
                  onClick={() => setShowQuiz(true)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-colors ${
                    showQuiz ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" : "hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <i className="bx bx-help-circle"></i>
                  <span>Module Quiz</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {showQuiz ? (
              <div className="bg-card rounded-xl border border-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <i className="bx bx-help-circle text-2xl text-orange-500"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Module Quiz</h2>
                    <p className="text-sm text-muted-foreground">Test your understanding</p>
                  </div>
                </div>

                <p className="text-lg text-foreground mb-6">{activeModule.quiz.question}</p>

                <div className="space-y-3 mb-8">
                  {activeModule.quiz.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => !quizSubmitted && setQuizAnswer(i)}
                      disabled={quizSubmitted}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${
                        quizSubmitted
                          ? i === activeModule.quiz.correct
                            ? "bg-green-500/10 border-green-500 text-green-500"
                            : quizAnswer === i
                              ? "bg-red-500/10 border-red-500 text-red-500"
                              : "border-border text-muted-foreground"
                          : quizAnswer === i
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-border hover:border-primary/30 text-muted-foreground"
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + i)}.</span> {option}
                    </button>
                  ))}
                </div>

                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={quizAnswer === null}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                ) : quizAnswer === activeModule.quiz.correct ? (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
                    <i className="bx bx-check-circle mr-2"></i>
                    Correct! Moving to next module...
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                      <i className="bx bx-x-circle mr-2"></i>
                      Incorrect. The correct answer is highlighted above.
                    </div>
                    <button
                      onClick={() => { setQuizAnswer(null); setQuizSubmitted(false); }}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="bg-card rounded-xl border border-border p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <i className={`bx ${activeModule.icon} text-2xl text-yellow-500`}></i>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{lessonContent.title}</h2>
                      <p className="text-sm text-muted-foreground">{activeLesson.duration} read</p>
                    </div>
                  </div>

                  {lessonContent.content}

                  <div className="flex justify-between mt-8 pt-6 border-t border-border">
                    <button
                      onClick={() => {
                        if (activeLessonIndex > 0) {
                          setActiveLessonIndex(activeLessonIndex - 1);
                        } else if (activeModuleIndex > 0) {
                          setActiveModuleIndex(activeModuleIndex - 1);
                          setActiveLessonIndex(MODULES[activeModuleIndex - 1].lessons.length - 1);
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={activeModuleIndex === 0 && activeLessonIndex === 0}
                      className="px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-50 transition-colors"
                    >
                      <i className="bx bx-chevron-left mr-1"></i> Previous
                    </button>
                    <button
                      onClick={nextLesson}
                      className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      {activeLessonIndex === activeModule.lessons.length - 1 ? "Take Quiz" : "Next Lesson"} <i className="bx bx-chevron-right ml-1"></i>
                    </button>
                  </div>
                </div>

                {/* Python Playground */}
                {lessonContent.code && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <i className="bx bx-code-alt text-xl text-primary"></i>
                      <h3 className="font-bold text-foreground">Try It Yourself</h3>
                    </div>
                    <PythonPlayground initialCode={lessonContent.code} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
