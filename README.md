# Feedback Request Application

A React application that allows users to submit feedback requests which are stored in MongoDB and tracked with status updates for Jira integration.

## Features

- Feedback request form with userId and applicationId parameters
- User information fetched from WebTeleService API
- MongoDB storage with status tracking
- Zustand for state management
- Ant Design UI components
- API endpoints for creating and retrieving feedback requests
- Status tracking with dates and descriptions
- Prepared for Jira integration

## Technologies Used

- React with Vite
- Zustand for state management
- Ant Design for UI components
- MongoDB for database storage
- Express for backend API
- Axios for API requests

## Prerequisites

- Node.js 18.x or higher
- MongoDB running locally or connection string to a MongoDB instance
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure MongoDB:
   - Ensure MongoDB is running locally at `mongodb://localhost:27017/feedback`
   - Or modify the connection string in `server.js` to your MongoDB instance

## Running the Application

Start both the backend server and frontend development server:

```bash
npm run start
```

Or run them separately:

- Backend server: `npm run server`
- Frontend development server: `npm run dev`

## API Endpoints

- **POST /api/feedback-requests** - Create a new feedback request
- **GET /api/feedback-requests** - Get all feedback requests (can filter by userId and/or applicationId)

## Database Schema

### Feedback Request

- `userId` (String, required) - ID of the user submitting the request
- `userName` (String) - FormattedName of the user fetched from WebTeleService API
- `userEmail` (String) - OfficialEmail of the user fetched from WebTeleService API
- `applicationId` (String, required) - ID of the application the feedback is for
- `title` (String, required) - Title of the feedback request
- `description` (String, required) - Detailed description of the feedback
- `priority` (String, enum: ['Low', 'Medium', 'High'], default: 'Medium') - Priority of the request
- `submittedDate` (Date, default: Date.now) - Date when the request was submitted
- `status` (Array of StatusSchema) - Status history of the request
- `jiraTicketId` (String) - Reference to the Jira ticket, if created

### Status Schema

- `statusDate` (Date, default: Date.now) - Date when the status was updated
- `description` (String, required) - Description of the status update

## Project Structure

- `server.js` - Express server setup and API endpoints
- `src/models/` - MongoDB models
- `src/store/` - Zustand state management
- `src/components/` - React components
- `src/App.jsx` - Main application component

## WebTeleService Integration

The application integrates with WebTeleService to fetch user information:

1. When a user submits a feedback request, the application sends a request to WebTeleService using the userId
2. The WebTeleService returns JSON with user details, including FormattedName and OfficialEmail
3. This information is stored with the feedback request and displayed in the UI
4. The system falls back gracefully if the WebTeleService is unavailable

### Configuration

To configure the WebTeleService integration:

1. Set the `WEBTELE_SERVICE_URL` environment variable in your `.env` file
2. The URL format should be `https://your-webtele-service.com/api`
3. The application will append the userId to the URL to fetch user details

## Jira Integration

The application includes integration with Jira for ticket creation and management:

1. When a feedback request is submitted, a Jira ticket is automatically created
2. The Jira ticket ID is stored with the feedback request for reference
3. Status updates in the application are synchronized with the Jira ticket
4. Historical status updates are maintained for audit purposes

### Configuration

To configure the Jira integration:

1. Copy the `.env.example` file to `.env`
2. Update the Jira API credentials with your Atlassian account:
   - `JIRA_HOST`: Your Jira instance (e.g., your-company.atlassian.net)
   - `JIRA_USERNAME`: Your Atlassian email address
   - `JIRA_API_TOKEN`: An API token created in your Atlassian account
   - `JIRA_PROJECT_KEY`: The project key in Jira where tickets should be created

### Status Updates

The application provides a status update workflow:
1. Select a feedback request in the list view
2. Click the "Update" button to open the status update dialog
3. Choose a new status (In Progress, Resolved, Closed, or Custom)
4. The status is updated in both the database and the linked Jira ticket