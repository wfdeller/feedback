import { create } from 'zustand';
import axios from 'axios';
import { createJiraIssueFromFeedback, updateJiraIssue } from '../services/jiraService.js';

const API_URL = 'http://localhost:5000/api';

// Creating selectors to prevent infinite loops and improve performance
const createSelectors = (store) => {
  const storeState = store.getState();
  return Object.keys(storeState).reduce((selectors, key) => {
    selectors[key] = (state) => state[key];
    return selectors;
  }, {});
};

const useFeedbackStoreBase = create((set, get) => ({
  // State
  feedbacks: [],
  loading: false,
  error: null,
  formState: {
    title: '',
    description: '',
    priority: 'Medium',
  },
  message: '',

  // Form actions
  updateFormField: (field, value) => {
    set((state) => ({
      formState: {
        ...state.formState,
        [field]: value,
      },
    }));
  },

  resetForm: () => {
    set({
      formState: {
        title: '',
        description: '',
        priority: 'Medium',
      },
      error: null,
      message: '',
    });
  },

  // API actions
  submitFeedbackRequest: async (userId, applicationId) => {
    set({ loading: true, error: null, message: '' });

    try {
      const { formState } = get();
      
      // Prepare the feedback request data
      const newRequest = {
        ...formState,
        userId,
        applicationId,
        status: [{ description: 'Request created', statusDate: new Date() }],
        feedbackStatus: 'Open'
      };
      
      // Save it to the database using the API
      const response = await axios.post(`${API_URL}/feedback-requests`, newRequest);
      const savedRequest = response.data;
      
      // Create a Jira ticket for the feedback
      try {
        const jiraTicketId = await createJiraIssueFromFeedback(savedRequest);
        
        // If Jira ticket was created, update the feedback with the ticket ID
        if (jiraTicketId) {
          const updateData = {
            jiraTicketId,
            status: [...savedRequest.status, { 
              description: `Jira ticket ${jiraTicketId} created`,
              statusDate: new Date()
            }]
          };
          
          // Update the feedback with the Jira ticket ID
          await axios.put(`${API_URL}/feedback-requests/${savedRequest._id}`, updateData);
        }
      } catch (jiraError) {
        console.error('Error creating Jira ticket:', jiraError);
        // Continue even if Jira ticket creation fails - log this in the database
        const updateData = {
          status: [...savedRequest.status, { 
            description: `Failed to create Jira ticket: ${jiraError.message}`,
            statusDate: new Date()
          }]
        };
        
        await axios.put(`${API_URL}/feedback-requests/${savedRequest._id}`, updateData);
      }

      // Update the state with success message
      set({
        loading: false,
        message: 'Feedback request submitted successfully!',
        formState: {
          title: '',
          description: '',
          priority: 'Medium',
        },
      });

      // Get all feedback requests to update the list
      get().getFeedbackRequests(userId, applicationId);

      return savedRequest;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to submit feedback request',
      });
      console.error('Error submitting request:', error);
      return null;
    }
  },

  getFeedbackRequests: async (userId, applicationId) => {
    set({ loading: true, error: null });

    try {
      // Create query parameters for API request
      let url = `${API_URL}/feedback-requests`;
      const params = new URLSearchParams();
      
      if (userId) params.append('userId', userId);
      if (applicationId) params.append('applicationId', applicationId);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      // Fetch feedbacks from the API
      const response = await axios.get(url);
      const feedbacks = response.data;
      
      set({ feedbacks, loading: false });
      return feedbacks;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to fetch feedback requests',
      });
      console.error('Error fetching requests:', error);
      return [];
    }
  },
  
  // Update feedback status and Jira ticket
  updateFeedbackStatus: async (feedbackId, newStatus) => {
    set({ loading: true, error: null });
    
    try {
      // Get the current feedback to update
      const response = await axios.get(`${API_URL}/feedback-requests/${feedbackId}`);
      const feedback = response.data;
      
      if (!feedback) {
        throw new Error('Feedback request not found');
      }
      
      // Create a status update object
      const statusUpdate = {
        description: newStatus,
        statusDate: new Date()
      };
      
      // Prepare update data
      const updateData = {
        status: [...feedback.status, statusUpdate]
      };
      
      // Update feedback status if appropriate
      if (newStatus === 'Resolved') {
        updateData.feedbackStatus = 'Resolved';
      } else if (newStatus === 'In Progress') {
        updateData.feedbackStatus = 'In Progress';
      } else if (newStatus === 'Closed') {
        updateData.feedbackStatus = 'Closed';
      }
      
      // Save the updated feedback
      await axios.put(`${API_URL}/feedback-requests/${feedbackId}`, updateData);
      
      // If there's a Jira ticket, update it too
      if (feedback.jiraTicketId) {
        try {
          await updateJiraIssue(feedback.jiraTicketId, statusUpdate);
        } catch (jiraError) {
          console.error('Error updating Jira ticket:', jiraError);
          // Continue even if Jira update fails
        }
      }
      
      // Update loading state
      set({ loading: false });
      
      return feedback;
    } catch (error) {
      set({
        loading: false,
        error: error.message || 'Failed to update feedback status'
      });
      console.error('Error updating feedback status:', error);
      return null;
    }
  }
}));

// Create a store with selectors
const selectors = createSelectors(useFeedbackStoreBase);

// Create a hook that combines the store and selectors
const useFeedbackStore = (selector) => {
  if (selector) {
    if (typeof selector === 'function') {
      // Use standard selector function
      return useFeedbackStoreBase(selector);
    } else if (typeof selector === 'string') {
      // Use the property name as selector
      return useFeedbackStoreBase(selectors[selector]);
    } else if (Array.isArray(selector)) {
      // Create a combined selector for multiple properties
      return selector.map(prop => useFeedbackStoreBase(selectors[prop]));
    }
  }
  
  // Return the entire store if no selector provided
  return useFeedbackStoreBase();
};

export default useFeedbackStore;