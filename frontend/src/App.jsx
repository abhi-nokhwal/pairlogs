import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TypingPractice from './components/TypingPractice';
import CoupleRegistration from './components/CoupleRegistration';
import QuizCreation from './components/QuizCreation';
import QuizAnswering from './components/QuizAnswering';
import CoupleSpace from './components/CoupleSpace';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<TypingPractice />} />
          <Route path="/register" element={<CoupleRegistration />} />
          <Route path="/create-quiz" element={<QuizCreation />} />
          <Route path="/join/:token" element={<TypingPractice />} />
          <Route path="/quiz/:token" element={<QuizAnswering />} />
          <Route path="/space/:token" element={<CoupleSpace />} />
          {/* Add a catch-all route for debugging */}
          <Route path="*" element={<div>404 - Route not found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;