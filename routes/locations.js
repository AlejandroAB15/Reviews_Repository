const express = require("express");
const ROUTER = express.Router();
const catchAsync = require("../utilities/catchAsync");
const {isLoggedIn, validateLocation, isAuthor} = require("../middleware");
const locations = require("../controllers/locations");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

ROUTER.route('/')
    .get(catchAsync(locations.index))
    .post(isLoggedIn , upload.array('image'), validateLocation, catchAsync(locations.createLocation));

ROUTER.get("/new", isLoggedIn , locations.renderNewForm);
    
ROUTER.route('/:id')
    .get(catchAsync(locations.showLocation))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateLocation, catchAsync(locations.updateLocation))
    .delete(isLoggedIn, isAuthor, catchAsync(locations.deleteLocation));

ROUTER.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(locations.renderEditForm));

module.exports = ROUTER;