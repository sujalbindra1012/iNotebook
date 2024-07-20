const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/iNotebook2?directConnection=true";

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true
        });
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        // Exit process on connection failure, optionally you can handle this differently
        process.exit(1);
    }
};

module.exports = connectToMongo;
