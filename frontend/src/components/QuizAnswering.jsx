import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const QuizAnswering = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [lockedUntil, setLockedUntil] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [token]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quiz/${token}`);
      setQuiz(response.data);
      setAnswers(new Array(response.data.questions.length).fill(''));
    } catch (error) {
      setError('Failed to load quiz');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/api/quiz/${token}/submit`, {
        answers
      });
      
      if (response.data.success) {
        navigate(`/space/${token}`);
      }
    } catch (error) {
      if (error.response?.status === 429) {
        setLockedUntil(error.response.data.lockedUntil);
      } else {
        setAttemptsLeft(error.response?.data?.attemptsLeft || 0);
      }
    }
  };

  if (lockedUntil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <h2 className="text-xl font-bold mb-4">Too Many Attempts</h2>
          <p>Please try again after {new Date(lockedUntil).toLocaleTimeString()}</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Answer Quiz</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p className="text-gray-600 mb-4">Attempts left: {attemptsLeft}</p>
        <form onSubmit={handleSubmit}>
          {quiz.questions.map((q, index) => (
            <div key={index} className="mb-4">
              <label className="block text-gray-700 mb-2">
                Question {index + 1}: {q.question}
              </label>
              <input
                type="text"
                value={answers[index]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[index] = e.target.value;
                  setAnswers(newAnswers);
                }}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Submit Answers
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizAnswering;