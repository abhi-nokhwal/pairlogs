import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Random sentences for typing practice
const randomSentences = [
  "The quick brown fox jumps over the lazy dog nearby",
  "A journey of a thousand miles begins with a single step",
  "All that glitters is not gold handle with care always",
  "Better late than never but never late is better still",
  "Every cloud has a silver lining look for it always",
  "Fortune favors the bold and the prepared mind always",
  "Hope is the thing with feathers that perches within",
  "Life is what happens when you are making other plans",
  "Time and tide wait for no man so act quickly now",
  "Where there is a will there is a way forward together"
];

const TypingPractice = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  
  // State for typing test
  const [text, setText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [completed, setCompleted] = useState(false);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Generate a random sentence on mount
  useEffect(() => {
    // Choose a random sentence from the list
    const randomIndex = Math.floor(Math.random() * randomSentences.length);
    setTargetText(randomSentences[randomIndex]);
  }, []);

  // Fetch couple info if token exists (invitation link)
  useEffect(() => {
    if (token) {
      setLoading(true);
      axios.get(`http://localhost:5000/api/couple/token/${token}`)
        .then(res => {
          setInviteInfo({
            partnerName: res.data.partnerOne.name,
            coupleId: res.data.coupleId,
          });
        })
        .catch(err => {
          console.error('Failed to fetch invite info:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (!startTime) {
      setStartTime(Date.now());
    }

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (i < targetText.length && value[i] === targetText[i]) {
        correct++;
      }
    }
    
    if (value.length > 0) {
      setAccuracy(Math.round((correct / value.length) * 100));
      
      // Calculate WPM
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const words = value.length / 5; // assuming 5 characters per word
      setWpm(Math.round(words / timeElapsed));
    }

    // Check for secret code - if partner link (token), go to quiz, otherwise go to registration
    if (value === "miss you") {
      if (token) {
        navigate(`/quiz/${token}`);
      } else {
        navigate('/register');
      }
    }
    
    // Check if completed the sentence
    if (value === targetText) {
      setCompleted(true);
      
      // Generate a new sentence after 2 seconds
      setTimeout(() => {
        setText('');
        setStartTime(null);
        setCompleted(false);
        const randomIndex = Math.floor(Math.random() * randomSentences.length);
        setTargetText(randomSentences[randomIndex]);
      }, 2000);
    }
  };

  // Loading state while fetching invite info
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Loading...</h1>
          <p className="text-gray-600 text-center">Preparing your couple space access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-indigo-700">
          Typing Master
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {token 
            ? `Welcome ${inviteInfo?.partnerName ? `to ${inviteInfo.partnerName}'s invitation` : 'to the couple space'}`
            : 'Improve your typing skills with practice'
          }
        </p>
        
        <div className="mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <div className={`p-4 pl-10 bg-gray-50 rounded-lg border ${completed ? 'border-green-500' : 'border-gray-200'}`}>
              <p className="font-mono text-lg whitespace-pre-wrap break-words">
                {targetText.split('').map((char, index) => {
                  let className = '';
                  if (index < text.length) {
                    if (char === text[index]) {
                      className = 'text-green-600';
                    } else {
                      className = 'text-red-600';
                    }
                  }
                  return <span key={index} className={className}>{char}</span>;
                })}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              <input
                type="text"
                value={text}
                onChange={handleInputChange}
                className={`w-full pl-10 p-4 border rounded-lg focus:outline-none focus:ring-2 
                  ${completed ? 'focus:ring-green-500 border-green-500' : 'focus:ring-indigo-500 border-gray-300'}`}
                placeholder="Start typing here..."
                autoFocus
                disabled={completed}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg text-center">
            <p className="text-sm text-indigo-700 font-medium">SPEED</p>
            <p className="text-3xl font-bold text-indigo-800">{wpm} <span className="text-sm">WPM</span></p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-purple-700 font-medium">ACCURACY</p>
            <p className="text-3xl font-bold text-purple-800">{accuracy}%</p>
          </div>
        </div>

        {completed && (
          <div className="bg-green-50 p-4 rounded-lg text-center mb-6 animate-pulse">
            <p className="text-green-700 font-medium">Completed! New sentence coming up...</p>
          </div>
        )}

        <div className="text-center mb-4">
          <div>
            {/* <p className="text-gray-500 text-sm mb-3">
              {token 
                ? "Type \"miss you\" to access your partner's love space by answering security questions"
                : "Type \"miss you\" to create a new space or access your existing relationship"
              }
            </p> */}
{/*             
            {!token && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors font-medium flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Register
                </button>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingPractice;