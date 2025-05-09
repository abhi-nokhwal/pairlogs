import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CoupleRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    coupleId: '',
    partnerOneName: '',
    partnerOneEmail: '',
    partnerTwoName: '',
    partnerTwoEmail: ''
  });

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:5000/api/couple/register', formData);
    const { token, coupleId } = response.data;
    // Store token and coupleId in localStorage or state management
    localStorage.setItem('token', token);
    localStorage.setItem('coupleId', coupleId);
    navigate(`/create-quiz?token=${token}`);
  } catch (error) {
    console.error('Registration failed:', error);
    // Add error handling UI here
  }
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Couple Account</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Couple ID</label>
            <input
              type="text"
              name="coupleId"
              value={formData.coupleId}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              name="partnerOneName"
              value={formData.partnerOneName}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Your Email</label>
            <input
              type="email"
              name="partnerOneEmail"
              value={formData.partnerOneEmail}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Partner's Name</label>
            <input
              type="text"
              name="partnerTwoName"
              value={formData.partnerTwoName}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Partner's Email</label>
            <input
              type="email"
              name="partnerTwoEmail"
              value={formData.partnerTwoEmail}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoupleRegistration;