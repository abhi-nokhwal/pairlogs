import { BrowserRouter, Routes, Route } from "react-router-dom";
import TypingPractice from "./components/TypingPractice";
import CoupleDashboard from "./components/CoupleDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TypingPractice />} />
        <Route path="/couple/:id" element={<CoupleDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
