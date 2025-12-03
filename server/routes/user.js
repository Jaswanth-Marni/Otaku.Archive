const router = require('express').Router();
const User = require('../models/User');
const verify = require('./verifyToken');

// Get Current User Data
router.get('/me', verify, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle Favorite
router.post('/favorite/:animeId', verify, async (req, res) => {
  try {
    const animeId = parseInt(req.params.animeId);
    console.log(`[User] Toggling favorite for user ${req.user._id}, anime ${animeId}`);
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.favorites) user.favorites = [];

    const index = user.favorites.indexOf(animeId);
    if (index === -1) {
      user.favorites.push(animeId);
    } else {
      user.favorites.splice(index, 1);
    }
    
    const savedUser = await user.save();
    res.json(savedUser.favorites);
  } catch (err) {
    console.error('[User] Error toggling favorite:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update Watch Status
router.post('/status/:animeId', verify, async (req, res) => {
  try {
    const animeId = parseInt(req.params.animeId);
    const { status, progress } = req.body;
    console.log(`[User] Updating status for user ${req.user._id}, anime ${animeId} -> ${status}`);
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.watchList) user.watchList = [];

    const existingEntryIndex = user.watchList.findIndex(item => item.animeId === animeId);
    
    if (existingEntryIndex !== -1) {
      // Update existing
      user.watchList[existingEntryIndex].status = status;
      if (progress !== undefined) user.watchList[existingEntryIndex].progress = progress;
    } else {
      // Add new
      user.watchList.push({ animeId, status, progress: progress || 0 });
    }
    
    const savedUser = await user.save();
    res.json(savedUser.watchList);
  } catch (err) {
    console.error('[User] Error updating status:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
