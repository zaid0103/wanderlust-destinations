const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");

const Listing=require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
const Booking = require("../models/booking.js");

router
.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createListing)
     //first of all we will be extracting all the things that we are recieving from the user
 );

 router.get("/new",isLoggedIn, listingController.renderNewForm);

 
 router.route("/:id")
 .get(wrapAsync(listingController.showListing))
 .put(isLoggedIn,isOwner, upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
 .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

//index route- we will accept the get request at /listings and then we will be returning all the listings
    
    //new route - now we are creating a new route that will give us form with the help of which we will be adding new place to our listings
    //we are keeping the new route above the show id one since we need to avoid the confusion for the coputer so that it doesnt consider new as an id
    //show route- we will be creating the show route here, in this we will be sending a get request and asking for the display of the information of a particular id
    
    //create route- we took the data from the userwhich we need to add to the databse and now we are sending the post request to the route
    
    //edit route- this is the route we will be making in order to edit one of our listing
 
    router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));
    

module.exports = router;