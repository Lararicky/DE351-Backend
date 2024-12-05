const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session"); // store session
const cors = require("cors"); // เพิ่มการใช้งาน CORS
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const http = require('http');
const setupSocket = require('./io');

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = setupSocket(server);

// Import routes
const tagRoutes = require("./routes/tags");
const userRoutes = require("./routes/users");
const storyRoutes = require("./routes/stories");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");
const collabRoutes = require('./routes/collab');


// CORS configuration
app.use(cors({
    origin: '*',  // แก้ไขเป็นค่าคงที่
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    req.io = io;
    next();
});


// Session configuration
app.use(session({
    secret: "1w2a3d4s",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true if using https
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to TribeTales API");
});

// API routes
app.use("/tag", tagRoutes);
app.use("/user", userRoutes);
app.use("/story", storyRoutes);
app.use("/like", likeRoutes);
app.use("/comment", commentRoutes);
app.use('/collaborations', collabRoutes);


// MongoDB connection
mongoose.connect("mongodb://localhost:27017/tribetalesdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("Successfully connected to MongoDB.");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// Handle MongoDB events
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});



// Start Server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});