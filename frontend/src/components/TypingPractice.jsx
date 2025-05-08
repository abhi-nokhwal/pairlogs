import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const sampleSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing faster takes time and patience.",
  "Stay focused and avoid looking at the keyboard.",
  "Practice makes perfect in everything you do.",
  "Improve your accuracy before speed.",
  "Consistency is key to typing improvement.",
  "Avoid mistakes rather than typing fast.",
  "Accuracy always beats speed in the beginning.",
  "Keep your fingers on the home row keys.",
  "Typing is a valuable digital skill to master.",
];

export default function TypingPractice() {
  const [targetSentence, setTargetSentence] = useState("");
  const [typedText, setTypedText] = useState("");
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  const getRandomSentence = () => {
    const randomIndex = Math.floor(Math.random() * sampleSentences.length);
    return sampleSentences[randomIndex];
  };

  useEffect(() => {
    setTargetSentence(getRandomSentence());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedInput = typedText.trim().toLowerCase();

    if (cleanedInput === "missyou") {
      navigate("/couple/93xlf8u2k9"); // Secret dashboard
    } else if (typedText === targetSentence) {
      setFeedback("✅ Great! You typed it perfectly!");
      setTargetSentence(getRandomSentence()); // Change sentence
    } else {
      setFeedback("❌ There's a typo. Try again!");
    }

    setTypedText("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Typing Practice
        </h1>
        <p className="text-gray-600 text-sm mb-2 text-center">
          Type the sentence below exactly to improve accuracy.
        </p>

        <div className="bg-gray-100 text-gray-800 p-4 rounded-md font-mono text-base mb-4">
          {targetSentence}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
            placeholder="Type here..."
          />
          <button
            type="submit"
            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200">
            Submit
          </button>
        </form>

        {feedback && (
          <p className="mt-4 text-center text-sm text-gray-700">{feedback}</p>
        )}
      </div>
    </div>
  );
}
