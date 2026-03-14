const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email']
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Suggestion', 'Complaint', 'Website Feedback', 'Service Feedback']
    },
    message: {
        type: String,
        required: [true, 'Please add a feedback message']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
