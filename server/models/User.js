const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  favorites: {
    type: [Number],
    default: []
  },
  watchList: [{
    animeId: Number,
    status: {
      type: String,
      enum: ['WATCHING', 'COMPLETED', 'PLAN_TO_WATCH', 'DROPPED'],
      default: 'PLAN_TO_WATCH'
    },
    progress: {
      type: Number,
      default: 0
    }
  }]
});

module.exports = mongoose.model('User', userSchema);
