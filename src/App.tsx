import './App.css';
import { useState } from 'react';
import { questions } from './data/questions';

function App() {

  const [gameState, setGameState] = useState("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];
  const questionAmount = questions.length;

  function startNewGame() {
    setGameState("start");
    setCurrentQuestionIndex(0);
    setScore(0);
  }

  function difficultyName(): string {
    if (currentQuestion.difficulty === 1) return "Very Easy";
    if (currentQuestion.difficulty === 2) return "Easy";
    if (currentQuestion.difficulty === 3) return "Intermediate";
    if (currentQuestion.difficulty === 4) return "Hard";
    if (currentQuestion.difficulty === 5) return "Very Hard";
    return "Unknown";
  }
  
  function handleAnswer(answer: string, correctAnswer: string) {
    const isCorrect = answer === correctAnswer;
    let newScore = score;

    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }

    if (newScore > highScore) {
      setHighScore(newScore);
    }

    const isLastQuestion =
      currentQuestionIndex === questionAmount - 1;

    if (isLastQuestion) {
      setGameState("gameover");
      return;
    }

    setCurrentQuestionIndex(prev => prev + 1);
  }


  // RENDER:
  // RENDER:
  // RENDER:

  if (gameState === "start")
  return (
    <div>
      <h1>Quiz Game</h1>
      <h5>A REACT PROJECT by Juho Hiltunen</h5>
      <h3>Current High Score: {highScore} / {questionAmount}</h3>
      <button onClick={() => setGameState("playing")}>Start Game</button>
    </div>
  )

  if (gameState === "playing")
  return (
    <div>
      <h4>Question {currentQuestionIndex + 1}/{questionAmount}</h4>
      <h3>Category: {currentQuestion.category}</h3>
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
  )

  if (gameState === "gameover")
  return (
    <div>
      <h1>Game Over!</h1>
      <h2>Thank you for playing!</h2>
      <h1>Final Score: {score} / {questionAmount}</h1>
      <h3>Current High Score: {highScore} / {questionAmount}</h3>
      <button onClick={(startNewGame)}>
        Play Again!
      </button>
    </div>
  );
};

export default App;