import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const QuizAnswering = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [partnerName, setPartnerName] = useState('');

  useEffect(() => {
    fetchQuiz();
  }, [token]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      // First get the couple data to show partner name
      const coupleRes = await axios.get(`http://localhost:5000/api/couple/token/${token}`);
      setPartnerName(coupleRes.data.partnerOne.name);
      
      // Then get the quiz questions
      const quizRes = await axios.get(`http://localhost:5000/api/quiz/${token}`);
      setQuiz(quizRes.data);
      setAnswers(new Array(quizRes.data.questions.length).fill(''));
    } catch (error) {
      console.error('Failed to load quiz:', error);
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(`http://localhost:5000/api/quiz/${token}/submit`, {
        answers
      });
      
      if (response.data.success) {
        // Set access method to 'quiz' in localStorage
        localStorage.setItem('accessMethod', 'quiz');
        
        // Get couple info to save the user's name
        try {
          const coupleInfo = await axios.get(`http://localhost:5000/api/couple/token/${token}`);
          const { partnerOne, partnerTwo } = coupleInfo.data;
          
          // Set the user as partnerTwo (typically the quiz-solver)
          if (partnerTwo && partnerTwo.name) {
            localStorage.setItem('userName', partnerTwo.name);
            localStorage.setItem('userRole', 'partnerTwo');
          }
        } catch (error) {
          console.error('Could not fetch user details:', error);
        }
        
        // Navigate to the couple space
        navigate(`/space/${token}`);
      }
    } catch (error) {
      console.error('Quiz submission failed:', error);
      if (error.response?.status === 429) {
        setLockedUntil(error.response.data.lockedUntil);
      } else {
        setAttemptsLeft(error.response?.data?.attemptsLeft || 0);
        setError(error.response?.data?.message || 'Incorrect answers. Please try again.');
      }
    } finally {
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
          <p className="text-gray-600 text-center">Retrieving security questions...</p>
        </div>
      </div>
    );
  }

  if (lockedUntil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Access Temporarily Blocked</h2>
          <p className="text-gray-700 mb-4">Too many failed attempts. For security reasons, access has been temporarily locked.</p>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
            <p className="text-gray-700">Please try again after:</p>
            <p className="text-xl font-bold text-red-700 mt-2">{new Date(lockedUntil).toLocaleTimeString()}</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Quiz Not Found</h2>
          <p className="text-gray-700 mb-4">Unable to load the security questions. The link may be invalid or expired.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center text-indigo-700">Security Check</h1>
        <p className="text-center text-gray-500 mb-6">
          {partnerName ? `Answer ${partnerName}'s questions to access your shared space` : 'Answer these security questions to continue'}
        </p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-center">
            {error}
          </div>
        )}
        
        <div className="flex items-center mb-6">
          <div className={`w-1/5 h-2 rounded-l-full ${attemptsLeft > 4 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          <div className={`w-1/5 h-2 ${attemptsLeft > 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          <div className={`w-1/5 h-2 ${attemptsLeft > 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          <div className={`w-1/5 h-2 ${attemptsLeft > 1 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
          <div className={`w-1/5 h-2 rounded-r-full ${attemptsLeft > 0 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
        </div>
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-indigo-100 px-3 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-indigo-800">Attempts left: {attemptsLeft}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {quiz.questions.map((q, index) => (
            <div key={index} className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-indigo-700 font-medium mb-3">
                Question {index + 1}: <span className="text-gray-800">{q.question}</span>
              </label>
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
                  value={answers[index]}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your answer"
                  required
                />
              </div>
            </div>
          ))}
          
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
                Verifying...
              </span>
            ) : (
              'Submit Answers'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizAnswering;