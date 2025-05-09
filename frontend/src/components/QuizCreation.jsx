import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const QuizCreation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  
  const [questions, setQuestions] = useState([
    { question: '', answer: '' }
  ]);
  const [coupleId, setCoupleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState('');

  // Fetch coupleId using token
  useEffect(() => {
    const fetchCoupleData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/couple/token/${token}`);
        setCoupleId(res.data.coupleId);
        setPartnerName(res.data.partnerOne.name);
      } catch (err) {
        console.error('Failed to fetch coupleId:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCoupleData();
  }, [token]);

  const addQuestion = () => {
    if (questions.length < 5) {
      setQuestions([...questions, { question: '', answer: '' }]);
    }
  };

  const removeQuestion = (index) => {
    if (questions.length > 2) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/quiz/create', {
        coupleId,
        questions,
        createdBy: partnerName
      });
      navigate(`/space/${token}`);
    } catch (error) {
      console.error('Quiz creation failed:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Quiz</h1>
        <form onSubmit={handleSubmit}>
          {questions.map((q, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700">Question {index + 1}</label>
                {questions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                value={q.question}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter question"
                required
              />
              <input
                type="text"
                value={q.answer}
                onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter answer"
                required
              />
            </div>
          ))}
          {questions.length < 5 && (
            <button
              type="button"
              onClick={addQuestion}
              className="w-full mb-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
            >
              Add Question
            </button>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Create Quiz
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizCreation;