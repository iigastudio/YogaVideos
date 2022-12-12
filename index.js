// Import express
const express = require("express");
const path = require("path");
// Import mongoose
const mongoose = require("mongoose");
// Import passport library
const passport = require("passport");
// Import session
const session = require("express-session");
// Import CORS
const cors = require('cors')
// MongoDB Config
const config = require("./config/database");

// Import video routes
var video_routes = require("./routes/videos");
// Import user routes
var user_routes = require("./routes/users");

// Connect to database
mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Check for DB errors
db.on("error", function (err) {
  console.log("DB Error");
});

// Initialize express app
const app = express();

// Initialize built-in middleware for urlencoding and json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Initialize session
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {},
}));

// Passport config
require("./config/passport")(passport);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Enable CORS on all routes
app.use(cors())

// Import video Mongoose schemas
let Video = require("./models/video");

// Load view engine
app.set("/", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Wildcard route to allow user to be
// used in templates
app.get("*", function(req, res, next){
    res.locals.user = req.user || null;
    next();
})

app.use("/users", user_routes);
app.use("/video", video_routes);

app.use("/", function (req, res) {
  // Query MongoDB for videos
  Video.find({}, function (err, videos) {
    // Catch error
    if (err) {
      console.log("error");
    } else {
      // Pass videos to index
      res.render("index", {
        videos: videos,
      });
    }
  });
});

// Set constant for port
const PORT = process.env.PORT || 8000;

// Listen on a port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
