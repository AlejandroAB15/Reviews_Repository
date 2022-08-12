const Location = require("../models/location");
const {cloudinary} = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const locations = await Location.find({});
    res.render("locations/index", { locations });
}

module.exports.renderNewForm = (req, res) => {
    res.render("locations/new");
}

module.exports.createLocation = async (req, res) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.location.location,
        limit: 1
    }).send();
    const newLocation = new Location(req.body.location);
    newLocation.geometry = geoData.body.features[0].geometry;
    newLocation.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    newLocation.author = req.user._id;
    await newLocation.save();
    req.flash('success', 'Successfully made a new location!');
    res.redirect(`/locations/${newLocation._id}`);
}

module.exports.showLocation = async (req, res) => {
    const { id } = req.params;
    const location = await Location.findById(id)
    .populate({path: "reviews", populate: {path: "author"}}).populate("author");
    if(!location){
      req.flash('error', 'Location not found');
      res.redirect("/locations");
    }
    res.render("locations/show", { location });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const foundLocation = await Location.findById(id);
    if(!foundLocation){
      req.flash('error', 'Location not found');
      res.redirect("/locations")
    }
    res.render("locations/edit", { foundLocation });
}

module.exports.updateLocation = async (req, res) => {
    const { id } = req.params;
    const updatedLocation = await Location.findByIdAndUpdate(id, {...req.body.location});
    const images = req.files.map(f => ({url: f.path, filename: f.filename}));
    updatedLocation.images.push(...images);
    await updatedLocation.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await updatedLocation.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    req.flash('success', 'Successfully updated this location!');
    res.redirect(`/locations/${updatedLocation._id}`);
}

module.exports.deleteLocation = async (req, res) => {
    const { id } = req.params;
    await Location.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the location');
    res.redirect("/locations");
}