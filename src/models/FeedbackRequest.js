import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
    statusDate: { type: Date, default: Date.now },
    description: { type: String, required: true },
});

const feedbackRequestSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        userName: { type: String, required: false },  // Will store FormattedName from WebTeleService
        userEmail: { type: String, required: false }, // Will store OfficialEmail from WebTeleService
        applicationId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
        submittedDate: { type: Date, default: Date.now },
        jiraTicketId: { type: String },
        feedbackStatus: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
        status: [statusSchema],
    },
    { timsstamps: true }
);

const FeedbackRequest = mongoose.model('FeedbackRequest', feedbackRequestSchema);

export default FeedbackRequest;
