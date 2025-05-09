import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Gallery from './Gallery';
import Songs from './Songs';
import Notes from './Notes';

// ShareLink component for inviting partner
const ShareLink = ({ token }) => {
  const [copied, setCopied] = useState(false);
  
  // Create the invite link URL
  const inviteUrl = `${window.location.origin}/join/${token}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 md:p-6 rounded-xl mb-6 border border-pink-200 shadow-sm">
      <h3 className="text-lg font-bold text-pink-600 mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
        Share With Your Partner
      </h3>
      <p className="text-sm text-purple-600 mb-3">
        Send this link to your partner so they can join your personal space after solving the quiz:
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          readOnly
          value={inviteUrl}
          className="flex-1 p-3 border rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
          onClick={(e) => e.target.select()}
        />
        <button
          onClick={copyToClipboard}
          className={`px-4 py-3 rounded-lg transition-all flex items-center justify-center min-w-[100px] ${
            copied ? 'bg-green-500' : 'bg-gradient-to-r from-pink-500 to-purple-600'
          } text-white font-medium`}
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
              </svg>
              Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const CoupleSpace = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gallery');
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coupleInfo, setCoupleInfo] = useState(null);
  const [showAddButton, setShowAddButton] = useState(true);
  const [currentUser, setCurrentUser] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [userRole, setUserRole] = useState(''); // Track if user is partner/creator
  const [joinedViaQuiz, setJoinedViaQuiz] = useState(false);
  const [partnerName, setPartnerName] = useState('');

  useEffect(() => {
    // Determine who is logged in (this would come from your authentication system)
    const coupleId = localStorage.getItem('coupleId');
    const userName = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('userRole');
    const accessMethod = localStorage.getItem('accessMethod');
    
    if (coupleId) {
      setCurrentUser(coupleId);
    }
    
    if (userName) {
      setCurrentUserName(userName);
    }
    
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }

    // Check if the user joined via quiz
    if (accessMethod === 'quiz') {
      setJoinedViaQuiz(true);
    }
    
    fetchCoupleData();
  }, [token]);

  const fetchCoupleData = async () => {
    try {
      setLoading(true);
      // First, get the coupleId using the token
      const coupleRes = await axios.get(`http://localhost:5000/api/couple/token/${token}`);
      const coupleId = coupleRes.data.coupleId;
      setCoupleInfo(coupleRes.data);
      
      // Save coupleId for future reference
      localStorage.setItem('coupleId', coupleId);

      // Determine partner's name based on current user
      const { partnerOne, partnerTwo } = coupleRes.data;
      const storedUserRole = localStorage.getItem('userRole');
      
      if (storedUserRole === 'partnerOne') {
        setPartnerName(partnerTwo?.name || 'Partner');
      } else if (storedUserRole === 'partnerTwo') {
        setPartnerName(partnerOne?.name || 'Partner');
      }

      // Try to determine current user name if not already set
      if (!currentUserName || currentUserName === '') {
        // Check if we have user details stored
        const userId = localStorage.getItem('userId');
        const storedUserName = localStorage.getItem('userName');
        
        if (storedUserName) {
          setCurrentUserName(storedUserName);
        } else {
          // If we don't have a stored name, see if we can determine from the couple info
          const partnerOne = coupleRes.data.partnerOne || {};
          const partnerTwo = coupleRes.data.partnerTwo || {};
          
          // If we have the userId, match it with the right partner
          if (userId) {
            if (partnerOne.userId === userId) {
              setCurrentUserName(partnerOne.name);
              localStorage.setItem('userName', partnerOne.name);
              localStorage.setItem('userRole', 'partnerOne');
              setPartnerName(partnerTwo?.name || 'Partner');
            } else if (partnerTwo.userId === userId) {
              setCurrentUserName(partnerTwo.name);
              localStorage.setItem('userName', partnerTwo.name);
              localStorage.setItem('userRole', 'partnerTwo');
              setPartnerName(partnerOne?.name || 'Partner');
            }
          } else {
            // If we can't determine, default to partnerOne
            if (partnerOne.name) {
              setCurrentUserName(partnerOne.name);
              localStorage.setItem('userName', partnerOne.name);
              localStorage.setItem('userRole', 'partnerOne');
              setPartnerName(partnerTwo?.name || 'Partner');
            }
          }
        }
      }
      
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('coupleId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('accessMethod');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-center mb-4">
            <div className="animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Loading Your Love Space</h1>
          <p className="text-gray-600 text-center">Please wait while we prepare your special moments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Something went wrong</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => fetchCoupleData()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">No personal space found</h2>
          <p className="text-gray-600 mb-6">Try refreshing the page or creating a new space.</p>
          <button
            onClick={() => fetchCoupleData()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Romantic header */}
        {coupleInfo && (
          <div className="mb-6">
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="bg-white p-4 rounded-full shadow-md mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-700 mb-2">
                {coupleInfo.partnerOne.name} & {coupleInfo.partnerTwo.name}
              </h1>
              <p className="text-purple-600 font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {coupleInfo.coupleId}
              </p>
            </div>
            
            <div className="flex justify-between">
              <p className="text-purple-600 font-medium">
                Logged in as: <span className="font-bold">{currentUserName}</span> 
                {partnerName && <span className="ml-2 text-pink-600">❤️ Paired with <span className="font-bold">{partnerName}</span></span>}
              </p>
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-medium text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm-.879.879A3 3 0 013 3h10a.997.997 0 01.707.293l4 4a.996.996 0 01.293.707V16a3 3 0 01-3 3H3a3 3 0 01-3-3V4a3 3 0 012.121-2.121zM7 9a1 1 0 011-1h1V7a1 1 0 112 0v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}
        
        {/* Share link component - only show if not joined via quiz */}
        {!joinedViaQuiz && <ShareLink token={token} />}
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tab navigation with heart icons */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-4 px-4 font-medium text-sm transition-colors relative ${
                activeTab === 'gallery' 
                  ? 'text-pink-600 border-b-2 border-pink-500' 
                  : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Gallery
              </div>
            </button>
            <button
              onClick={() => setActiveTab('songs')}
              className={`flex-1 py-4 px-4 font-medium text-sm transition-colors relative ${
                activeTab === 'songs' 
                  ? 'text-pink-600 border-b-2 border-pink-500' 
                  : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
                Songs
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-4 px-4 font-medium text-sm transition-colors relative ${
                activeTab === 'notes' 
                  ? 'text-pink-600 border-b-2 border-pink-500' 
                  : 'text-gray-600 hover:text-pink-500'
              }`}
            >
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Notes
              </div>
            </button>
          </div>

          <div className="p-4 md:p-6">
            {activeTab === 'gallery' && <Gallery space={space} onUpdate={fetchCoupleData} currentUser={currentUserName} />}
            {activeTab === 'songs' && <Songs space={space} onUpdate={fetchCoupleData} currentUser={currentUserName} />}
            {activeTab === 'notes' && <Notes space={space} onUpdate={fetchCoupleData} currentUser={currentUserName} />}
          </div>
        </div>
        
        {/* Floating add button */}
        {showAddButton && (
          <div className="fixed bottom-6 right-6">
            <button 
              onClick={() => {
                const addFunctions = {
                  'gallery': () => document.getElementById('add-gallery-item')?.click(),
                  'songs': () => document.getElementById('add-song-item')?.click(),
                  'notes': () => document.getElementById('add-note-item')?.click()
                };
                
                if (addFunctions[activeTab]) {
                  addFunctions[activeTab]();
                }
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white focus:outline-none hover:opacity-90 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoupleSpace;