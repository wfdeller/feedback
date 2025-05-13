import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import FeedbackRequest from './src/models/FeedbackRequest.js';
import { getUserInfo } from './src/services/userService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/feedback')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/feedback-requests', async (req, res) => {
  try {
    // Get userId from request
    const { userId } = req.body;
    
    // Fetch user information from WebTeleService
    const userInfo = await getUserInfo(userId);
    
    // Create new feedback request with user info included
    const newRequest = new FeedbackRequest({
      ...req.body,
      userName: userInfo.userName || `User ${userId}`,  // Use FormattedName or fallback
      userEmail: userInfo.email || '',                  // Use OfficialEmail or empty string
      status: [{ description: 'Request created' }]
    });
    
    const savedRequest = await newRequest.save();
    
    // Here you would add code to create a Jira ticket
    // and update the status with the Jira ticket ID
    
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/feedback-requests', async (req, res) => {
  try {
    const { userId, applicationId } = req.query;
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (applicationId) filter.applicationId = applicationId;
    
    const requests = await FeedbackRequest.find(filter);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific feedback request by ID
app.get('/api/feedback-requests/:id', async (req, res) => {
  try {
    const feedback = await FeedbackRequest.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback request not found' });
    }
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to fetch user information from WebTeleService
app.get('/api/user-info/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get user info from WebTeleService
    const userInfo = await getUserInfo(userId);
    
    res.json(userInfo);
  } catch (error) {
    res.status(500).json({ 
      message: error.message,
      userId: req.params.userId,
      userName: `User ${req.params.userId}` // Fallback username
    });
  }
});

// Update a feedback request
app.put('/api/feedback-requests/:id', async (req, res) => {
  try {
    const feedback = await FeedbackRequest.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback request not found' });
    }
    
    // Update the feedback properties
    Object.keys(req.body).forEach(key => {
      feedback[key] = req.body[key];
    });
    
    const updatedFeedback = await feedback.save();
    res.json(updatedFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});