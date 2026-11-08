import './App.css';
import { useState } from 'react';
import { questions } from './data/questions';

function App() {

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];
  const questionAmount = questions.length;

  function difficultyName(): string {
    if (currentQuestion.difficulty === 1) return "Very Easy";
    if (currentQuestion.difficulty === 2) return "Easy";
    if (currentQuestion.difficulty === 3) return "Intermediate";
    if (currentQuestion.difficulty === 4) return "Hard";
    if (currentQuestion.difficulty === 5) return "Very Hard";
    return "Unknown";
  };
  
  function handleAnswer(answer: string, correctAnswer: string) {
    console.log(answer);
    setCurrentQuestionIndex(currentQuestionIndex + 1);

    if (answer === correctAnswer) {
    setScore(previousScore => previousScore + 1);
    }
  };

  if (currentQuestionIndex !== questionAmount)
  return (
    <div>

      <h1>Quiz Game</h1>
      <h5>A REACT PROJECT</h5>

      <h4>Question {currentQuestionIndex + 1}/{questionAmount}</h4>
      <h2>{currentQuestion.question}</h2>

      {currentQuestion.answers.map(answer => (
        <button
        key={answer}
        onClick={() => handleAnswer(answer, currentQuestion.correctAnswer)}
        >
          {answer}
        </button>
      ))}

      <p>
        Difficulty level:<br />
        {currentQuestion.difficulty}/5: {difficultyName()}
      </p>

      <h4>Current Score: {score}</h4>
    </div>
  );

  return (
    <div>
      <h1>Game Over!</h1>
      <h2>Thank you for playing!</h2>
      <h1>Final Score: {score} / {questionAmount}</h1>
    </div>
  );
};

export default App;