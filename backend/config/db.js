const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Using MongoDB service name defined in docker-compose as the hostname
        // Fallback to localhost if running outside of Docker
        const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/feedbackDB';
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
