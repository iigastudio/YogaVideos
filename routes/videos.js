const express = require("express");
const router = express.Router();
// Import Express validatior
const { check, validationResult } = require("express-validator");
const video = require("../models/video");

// Import Video and User Mongoose schemas
let Video = require("../models/video");
let User = require("../models/user");

// Level
let levels = ["Beginner", "Intermediate", "Advanced"];

// Attach routes to router
router
  .route("/add")
  // Get method renders the pug add_video page
  .get(ensureAuthenticated, (req, res) => {
    // Render page with list of levels
    res.render("add_video", {
      levels: levels,
    });
    // Post method accepts form submission and saves video in MongoDB
  })
  .post(ensureAuthenticated, async (req, res) => {
    // Async validation check of form elements
    await check("name", "Name is required").notEmpty().run(req);
    await check("description", "Description is required").notEmpty().run(req);
    await check("link", "Link is required").notEmpty().run(req);
    await check("level", "Level is required").notEmpty().run(req);

    // Get validation errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      // Create new video from mongoose model
      let video = new Video();
      // Assign attributes based on form data
      video.name = req.body.name;
      video.description = req.body.description;
      video.link = req.body.link;
      video.level = req.body.level;
      video.posted_by = req.user.id;

      // Save video to MongoDB
      video.save(function (err) {
        if (err) {
          // Log error if failed
          console.log(err);
          return;
        } else {
          // Route to home to view videos if suceeeded
          res.redirect("/");
        }
      });
    } else {
      res.render("add_video", {
        // Render form with errors
        errors: errors.array(),
        levels: levels,
      });
    }
  });

// Route that returns and deletes video based on id
router
  .route("/:id")
  .get((req, res) => {
    // Get video by id from MongoDB
    // Get user name by id from DB
    Video.findById(req.params.id, function (err, video) {
      User.findById(video.posted_by, function (err, user) {
        if (err) {
          console.log(err);
        }
        res.render("video", {
          video: video,
          posted_by: user.name,
        });
      });
    });
  })
  .delete((req, res) => {
    // Restrict delete if user not logged in
    if (!req.user._id) {
      res.status(500).send();
    }

    // Create query dict
    let query = { _id: req.params.id };

    Video.findById(req.params.id, function (err, video) {
      // Restrict delete if user did not post video
      if (video.posted_by != req.user._id) {
        res.status(500).send();
      } else {
        // MongoDB delete with Mongoose schema deleteOne
        Video.deleteOne(query, function (err) {
          if (err) {
            console.log(err);
          }
          res.send("Successfully Deleted");
        });
      }
    });
  });

// Route that return form to edit video
router
  .route("/edit/:id")
  .get(ensureAuthenticated, (req, res) => {
    // Get video by id from MongoDB
    Video.findById(req.params.id, function (err, video) {
      // Restrict to only allowing user that posted to make updates
      if (video.posted_by != req.user._id) {
        res.redirect("/");
      }
      res.render("edit_video", {
        video: video,
        levels: levels,
      });
    });
  })
  .post(ensureAuthenticated, (req, res) => {
    // Create dict to hold video values
    let videoUpdate = {};

    // Assign attributes based on form data
    videoUpdate.name = req.body.name;
    videoUpdate.description = req.body.description;
    videoUpdate.link = req.body.link;
    videoUpdate.level = req.body.level;

    let query = { _id: req.params.id };

    Video.findById(req.params.id, function (err, video) {
      // Restrict to only allowing user that posted to make updates
      if (video.posted_by != req.user._id) {
        res.redirect("/");
      } else {
        // Update video in MongoDB
        Video.updateOne(query, videoUpdate, function (err) {
          if (err) {
            console.log(err);
            return;
          } else {
            res.redirect("/");
          }
        });
      }
    });
  });

// Function to protect routes from unauthenticated users
function ensureAuthenticated(req, res, next) {
  // If logged in proceed to next middleware
  if (req.isAuthenticated()) {
    return next();
    // Otherwise redirect to login page
  } else {
    res.redirect("/users/login");
  }
}

module.exports = router;
