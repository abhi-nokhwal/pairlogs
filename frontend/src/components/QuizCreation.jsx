import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const QuizCreation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  
  const [questions, setQuestions] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);
  const [coupleId, setCoupleId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [error, setError] = useState('');

  // Fetch coupleId using token
  useEffect(() => {
    const fetchCoupleData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/couple/token/${token}`);
        setCoupleId(res.data.coupleId);
        setPartnerName(res.data.partnerOne.name);
      } catch (err) {
        console.error('Failed to fetch coupleId:', err);
        setError('Failed to load couple data. Please try again.');
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
    setSubmitting(true);
    setError('');
    
    try {
      await axios.post('http://localhost:5000/api/quiz/create', {
        coupleId,
        questions,
        createdBy: partnerName
      });
      navigate(`/space/${token}`);
    } catch (error) {
      console.error('Quiz creation failed:', error);
      setError(error.response?.data?.message || 'Failed to create quiz. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Loading...</h1>
          <p className="text-gray-600 text-center">Preparing your quiz creation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center text-indigo-700">Create Security Quiz</h1>
        <p className="text-center text-gray-500 mb-6">Create questions that only your partner would know</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {questions.map((q, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <label className="text-indigo-700 font-medium">Question {index + 1}</label>
                {questions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="text-red-500 hover:text-red-700 text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Remove
                  </button>
                )}
              </div>
              <div className="mb-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your question"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <input
                    type="text"
                    value={q.answer}
                    onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                    className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter the answer"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
          
          {questions.length < 5 && (
            <button
              type="button"
              onClick={addQuestion}
              className="w-full mb-6 bg-indigo-100 text-indigo-700 font-medium p-3 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Another Question
            </button>
          )}
          
          <div className="text-sm text-gray-600 mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Your partner must answer these questions correctly to access your shared space. Make sure they are questions only your partner would know.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Quiz...
              </span>
            ) : (
              'Create Quiz & Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizCreation;