import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TypingPractice = () => {
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const navigate = useNavigate();
  const { token } = useParams();

  const targetText = "miss you";

  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (!startTime) {
      setStartTime(Date.now());
    }

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === targetText[i]) correct++;
    }
    setAccuracy(Math.round((correct / value.length) * 100));

    // Calculate WPM
    if (value.length > 0) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const words = value.length / 5; // assuming 5 characters per word
      setWpm(Math.round(words / timeElapsed));
    }

    // Check if completed
    if (value === targetText) {
      if (token) {
        navigate(`/quiz/${token}`);
      } else {
        navigate('/register');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Type Practice</h1>
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Type this text:</p>
          <p className="text-xl font-mono bg-gray-50 p-2 rounded">{targetText}</p>
        </div>
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Start typing..."
        />
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>WPM: {wpm}</span>
          <span>Accuracy: {accuracy}%</span>
        </div>
      </div>
    </div>
  );
};

export default TypingPractice;