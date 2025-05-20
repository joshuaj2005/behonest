import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';

export const useStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { emit, on, off } = useSocket();

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/stories');
      setStories(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStory = useCallback(async (mediaFile, type, caption = '') => {
    try {
      const formData = new FormData();
      formData.append('media', mediaFile);
      formData.append('type', type);
      formData.append('caption', caption);

      const response = await axios.post('/api/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setStories(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteStory = useCallback(async (storyId) => {
    try {
      await axios.delete(`/api/stories/${storyId}`);
      setStories(prev => prev.filter(story => story._id !== storyId));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const viewStory = useCallback(async (storyId) => {
    try {
      await emit('view_story', { storyId });
      setStories(prev => 
        prev.map(story => 
          story._id === storyId 
            ? { 
                ...story, 
                views: [...story.views, { userId: 'currentUser', viewedAt: new Date() }]
              }
            : story
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }, [emit]);

  useEffect(() => {
    fetchStories();

    // Listen for new stories
    const handleNewStory = (story) => {
      setStories(prev => [story, ...prev]);
    };

    // Listen for story deletions
    const handleStoryDelete = ({ storyId }) => {
      setStories(prev => prev.filter(story => story._id !== storyId));
    };

    // Listen for story views
    const handleStoryView = ({ storyId, userId, viewedAt }) => {
      setStories(prev => 
        prev.map(story => 
          story._id === storyId 
            ? { 
                ...story, 
                views: [...story.views, { userId, viewedAt }]
              }
            : story
        )
      );
    };

    on('new_story', handleNewStory);
    on('story_deleted', handleStoryDelete);
    on('story_viewed', handleStoryView);

    return () => {
      off('new_story', handleNewStory);
      off('story_deleted', handleStoryDelete);
      off('story_viewed', handleStoryView);
    };
  }, [on, off, fetchStories]);

  return {
    stories,
    loading,
    error,
    createStory,
    deleteStory,
    viewStory,
    refresh: fetchStories
  };
}; 