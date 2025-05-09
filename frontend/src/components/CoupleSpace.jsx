import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Gallery from './Gallery';
import Songs from './Songs';
import Notes from './Notes';

const CoupleSpace = () => {
  const { token } = useParams();
  const [activeTab, setActiveTab] = useState('gallery');
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoupleData();
  }, [token]);

  const fetchCoupleData = async () => {
    try {
      // First, get the coupleId using the token
      const coupleRes = await axios.get(`http://localhost:5000/api/couple/token/${token}`);
      const coupleId = coupleRes.data.coupleId;
      
      // Then try to fetch the personal space
      try {
        const spaceRes = await axios.get(`http://localhost:5000/api/personal-space/${coupleId}`);
        
        // If space exists, use it
        if (spaceRes.data) {
          setSpace(spaceRes.data);
        } else {
          // If no space found, create a new one
          await createPersonalSpace(coupleId);
        }
      } catch (err) {
        // If error (likely 404), create a new space
        await createPersonalSpace(coupleId);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load your personal space. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const createPersonalSpace = async (coupleId) => {
    try {
      const createRes = await axios.post(`http://localhost:5000/api/personal-space`, { coupleId });
      setSpace(createRes.data);
    } catch (err) {
      console.error('Failed to create personal space:', err);
      setError('Failed to create personal space. Please try again.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!space) {
    return <div className="min-h-screen flex items-center justify-center">No personal space found yet. Try refreshing the page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded ${
                activeTab === 'gallery' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('songs')}
              className={`px-4 py-2 rounded ${
                activeTab === 'songs' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Songs
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded ${
                activeTab === 'notes' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              Notes
            </button>
          </div>

          {activeTab === 'gallery' && <Gallery space={space} onUpdate={fetchCoupleData} />}
          {activeTab === 'songs' && <Songs space={space} onUpdate={fetchCoupleData} />}
          {activeTab === 'notes' && <Notes space={space} onUpdate={fetchCoupleData} />}
        </div>
      </div>
    </div>
  );
};

export default CoupleSpace;