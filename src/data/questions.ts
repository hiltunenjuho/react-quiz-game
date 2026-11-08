import type { Question } from "./types/Question";

export const questions: Question[] = [
    {
        question: "What is the capital of Finland?",
        answers: ["Turku", "Helsinki", "Tampere", "Oulu"],
        correctAnswer: "Helsinki",
        category: "Geography",
        difficulty: 1,
    },
    {
        question: "What is 2 + 2?",
        answers: ["3", "4", "5", "6"],
        correctAnswer: "4",
        category: "Math",
        difficulty: 1,
    },
    {
        question: "Which country is known for the city of Tokyo?",
        answers: ["China", "Japan", "South Korea", "Thailand"],
        correctAnswer: "Japan",
        category: "Geography",
        difficulty: 2,
    },
    {
        question: "What planet is known as the Red Planet?",
        answers: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
        category: "Science",
        difficulty: 2,
    },
    {
        question: "What does HTML stand for?",
        answers: ["Hyper Text Markup Language", "High Tech Machine Language", "Home Town Mall Leisure", "Heroic Tank Man Longshot"],
        correctAnswer: "Hyper Text Markup Language",
        category: "Technology",
        difficulty: 3,
    },
    {
        question: "What is 5 × 6?",
        answers: ["25", "30", "35", "40"],
        correctAnswer: "30",
        category: "Math",
        difficulty: 2,
    },
    {
        question: "Which company created Minecraft?",
        answers: ["Valve", "Epic Games", "Mojang", "Ubisoft"],
        correctAnswer: "Mojang",
        category: "Gaming",
        difficulty: 3
    },
    {
        question: "In which year did World War II end?",
        answers: ["1943", "1944", "1945", "1946"],
        correctAnswer: "1945",
        category: "History",
        difficulty: 4,
    },
    {
        question: "How many continents are there on Earth?",
        answers: ["5", "6", "7", "8"],
        correctAnswer: "7",
        category: "Geography",
        difficulty: 3,
    },
    {
        question: "How many players are there on the field for one football (soccer) team at a time?",
        answers: ["9", "10", "11", "12"],
        correctAnswer: "11",
        category: "Sports",
        difficulty: 3,
    },
    {
        question: "Which language is primarily used by React?",
        answers: ["Python", "Java", "JavaScript", "C#"],
        correctAnswer: "JavaScript",
        category: "Programming",
        difficulty: 4,
    },
    {
        question: "Which letter is missing from this cat breed: *Devon _ex*",
        answers: ["D", "S", "H", "R",],
        correctAnswer: "R",
        category: "Science",
        difficulty: 3,
    }
];
