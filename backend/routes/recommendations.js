import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import RecommendationEngine from '../services/recommendationEngine.js';

const router = express.Router();

// Get nutrition recommendations for a user
router.get('/nutrition', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendations = await RecommendationEngine.getNutritionRecommendations(userId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching nutrition recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get meal suggestions for a user
router.get('/meals', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const meals = await RecommendationEngine.getSuggestedMeals(userId);
    res.json(meals);
  } catch (error) {
    console.error('Error fetching meal suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch meal suggestions' });
  }
});

// Submit feedback on recommendations
router.post('/feedback', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recommendationId, feedbackType, notes } = req.body;
    
    await RecommendationEngine.saveFeedback(userId, recommendationId, feedbackType, notes);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// Get user preferences
router.get('/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await RecommendationEngine.getUserPreferences(userId);
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user preferences
router.put('/preferences', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    
    await RecommendationEngine.updateUserPreferences(userId, preferences);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Mark recommendation as viewed
router.post('/viewed/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendationId = req.params.id;
    
    await RecommendationEngine.markAsViewed(userId, recommendationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking as viewed:', error);
    res.status(500).json({ error: 'Failed to mark as viewed' });
  }
});

export default router;
