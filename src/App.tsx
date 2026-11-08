import './App.css';
import { useState } from 'react';
import { questions } from './data/questions';

function App() {

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];

  function handleAnswer(answer: string) {
    console.log(answer);

    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }

  return (
    <div>
      <h1>Quiz Game</h1>
      <h4>A REACT PROJECT</h4>

      <h2>{currentQuestion.question}</h2>

      {currentQuestion.answers.map(answer => (
        <button
          key={answer}
          onClick={() => handleAnswer(answer)}
        >
          {answer}
        </button>
      ))}
    </div>
  );
}

export default App;