import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    coupleId: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // First, login with credentials
      const response = await axios.post('http://localhost:5000/api/couple/login', formData);
      const { token, coupleId } = response.data;
      
      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('coupleId', coupleId);
      
      // Fetch the couple details to get partner information
      try {
        const coupleDetails = await axios.get(`http://localhost:5000/api/couple/token/${token}`);
        const { partnerOne, partnerTwo } = coupleDetails.data;
        
        // Save partner names for future reference
        localStorage.setItem('partnerOneName', partnerOne?.name || '');
        localStorage.setItem('partnerTwoName', partnerTwo?.name || '');
        
        // Use a heuristic to determine which partner is logging in
        // This is just a simple example - real implementation might use email or other identifiers
        const inputCoupleId = formData.coupleId.toLowerCase();
        
        if (partnerOne?.email?.toLowerCase().includes(inputCoupleId) || 
            partnerOne?.name?.toLowerCase().includes(inputCoupleId)) {
          localStorage.setItem('userName', partnerOne.name);
          localStorage.setItem('userEmail', partnerOne.email);
          localStorage.setItem('userRole', 'partnerOne');
        } else if (partnerTwo?.email?.toLowerCase().includes(inputCoupleId) || 
                  partnerTwo?.name?.toLowerCase().includes(inputCoupleId)) {
          localStorage.setItem('userName', partnerTwo.name);
          localStorage.setItem('userEmail', partnerTwo.email);
          localStorage.setItem('userRole', 'partnerTwo');
        } else {
          // Default to partner one if we can't determine
          localStorage.setItem('userName', partnerOne?.name || 'Partner One');
        }
      } catch (detailsError) {
        console.error('Failed to fetch user details:', detailsError);
        // Continue anyway, we'll just use the default naming
      }
      
      // Navigate to couple space
      navigate(`/space/${token}`);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center text-indigo-700">Welcome Back</h1>
        <p className="text-center text-gray-500 mb-6">Login to access your love space</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Couple ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              <input
                type="text"
                name="coupleId"
                value={formData.coupleId}
                onChange={handleChange}
                className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your Couple ID"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
          
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <p className="text-sm text-gray-500">
                Don't have an account?
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Register Now
            </button>
          </div>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Your partner can access this space by answering security questions
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login; 