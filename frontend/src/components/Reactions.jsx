import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const REACTIONS = {
  HEART: { emoji: '❤️', label: 'Love', className: 'heart-beat' },
  SMILE: { emoji: '😊', label: 'Like', className: 'pulse' },
  LAUGH: { emoji: '😂', label: 'Haha', className: 'bounce' },
  WOW: { emoji: '😮', label: 'Wow', className: 'pop' },
  SAD: { emoji: '😢', label: 'Sad', className: 'pulse-slow' },
};

const Reactions = ({ itemId, itemType, space, onUpdate, currentReactions = [], currentUser }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedReaction, setSelectedReaction] = useState(null);
  const toast = useToast();

  // Check if current user has any reaction
  const userReaction = currentReactions.find(r => r.addedBy === currentUser);
  const hasReacted = !!userReaction;

  // Set selected reaction on initial render if user has already reacted
  useEffect(() => {
    if (hasReacted) {
      setSelectedReaction(userReaction.type);
    }
  }, [hasReacted, userReaction]);

  const handleReactionClick = async (reactionType) => {
    if (submitting) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      let route;
      if (itemType === 'note') {
        route = `/${space.coupleId}/notes/${itemId}/reaction`;
      } else if (itemType === 'song') {
        route = `/${space.coupleId}/songs/${itemId}/reaction`;
      } else if (itemType === 'gallery') {
        route = `/${space.coupleId}/gallery/${itemId}/reaction`;
      }

      // If they already reacted, remove it (for toggling)
      if (hasReacted && userReaction.type === reactionType) {
        await axios.delete(`http://localhost:5000/api/personal-space${route}`, {
          data: { reactionId: userReaction._id }
        });
        toast.info('Reaction removed');
        setSelectedReaction(null);
      } else {
        // Otherwise add the reaction
        await axios.post(`http://localhost:5000/api/personal-space${route}`, {
          type: reactionType,
          addedBy: currentUser
        });
        toast.success(`Added ${REACTIONS[reactionType].label} reaction`);
        setSelectedReaction(reactionType);
      }
      
      // Close the reactions menu
      setShowReactions(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to add reaction:', error);
      setError('Failed to add reaction');
      toast.error('Failed to add reaction');
    } finally {
      setSubmitting(false);
    }
  };

  // Count reactions by type
  const reactionCounts = currentReactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative">
      {error && <div className="text-red-500 text-xs absolute -top-5 left-0 slide-in-left">{error}</div>}
      
      {/* Main reaction button */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        className={`text-gray-500 hover:text-pink-500 flex items-center text-xs transition-all duration-300 ease-in-out ${hasReacted ? 'text-pink-500' : ''} hover:scale-105`}
        aria-label="React with emoji"
        title={hasReacted ? "Change your reaction" : "Add a reaction"}
      >
        {hasReacted ? (
          <span className={`${REACTIONS[userReaction.type].className || ''} text-lg`}>
            {REACTIONS[userReaction.type].emoji}
          </span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 hover-float" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        )}
        <span className="ml-1">
          {hasReacted ? 'Reacted' : 'React'}
        </span>
      </button>
      
      {/* Reaction picker */}
      {showReactions && (
        <div className="absolute -top-10 left-0 bg-white shadow-xl rounded-full px-3 py-1.5 z-10 flex space-x-3 border border-pink-200 slide-in-right">
          {Object.entries(REACTIONS).map(([type, { emoji, label, className }]) => (
            <button
              key={type}
              onClick={() => handleReactionClick(type)}
              className={`transition-all duration-300 hover:scale-125 relative ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                userReaction?.type === type ? 'scale-125 bg-pink-100 rounded-full' : ''
              } ${className || ''} text-xl`}
              title={label}
              disabled={submitting}
              aria-label={`React with ${label}`}
            >
              <span className="relative z-10">{emoji}</span>
              {userReaction?.type === type && (
                <span className="absolute inset-0 bg-pink-100 rounded-full -z-10 animate-pulse-slow"></span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Show reaction counts */}
      {Object.keys(reactionCounts).length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {Object.entries(reactionCounts).map(([type, count]) => (
            <span 
              key={type} 
              className="inline-flex items-center bg-gradient-to-r from-pink-50 to-purple-50 text-xs px-2 py-0.5 rounded-full reaction-pop shadow-sm border border-pink-100 hover:from-pink-100 hover:to-purple-100 transition-all cursor-default"
              title={`${count} ${count === 1 ? 'person' : 'people'} reacted with ${REACTIONS[type].label}`}
            >
              {REACTIONS[type].emoji} {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reactions; 