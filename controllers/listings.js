const Listing = require("../models/listing.js")
const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxgeocoding({accessToken:mapToken});


module.exports.index=async(req,res)=>
{
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res)=>
{
        res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res)=>
    {
        //we will be getting the id so we will be extracting it
        let {id}=req.params;
        //now we will be finding on the basis of the id and storing it
       const listing = await Listing.findById(id).populate({path:"reviews",
        populate:{
            path:"author",
        },
       }).populate("owner");
        //whatever data we got we will be passing it in the show.ejs in order to to show it in the different page
        if(!listing)
            {
                req.flash("error","Listing you requested for does not exist");
                res.redirect("/listings");
            }
            else
            {
                res.render("listings/show.ejs",{listing});
            }
    };

    module.exports.createListing = async(req,res,next)=>{
         
        let response = await geocodingClient
        .forwardGeocode({
            query:req.body.listing.location,
            limit:1,
        })
        .send();
        

        let url = req.file.path;
        let filename = req.file.filename;

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url,filename};
        newListing.geometry = response.body.features[0].geometry;
        let savedListing = await newListing.save();
        console.log(savedListing);
        req.flash("success","New listing created!");
        res.redirect("/listings");
    };

    module.exports.renderEditForm = async(req,res)=>
        {
            //first we will be extracting the id that will help us to get the post which we have to edit
            let {id}=req.params;
            //now we are find the complete object from the database and then we are sending it to the edit form because in the place of the placeholder we already need the original data of the post which we need to edit
            const listing=await Listing.findById(id);
            if(!listing)
            {
                req.flash("error","Listing you requested for does not exist!");
                res.redirect("/listings");
            }
            else
            {
                let originalImageUrl = listing.image.url;
                originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
                res.render("listings/edit.ejs",{listing,originalImageUrl});
            }
        };

    module.exports.updateListing = async(req,res)=>
        {
            //first of all we will be extracting the id and the  we will be extracting the listing
            let {id}=req.params;
            let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
            if(typeof req.file !== "undefined")
            {
                let url = req.file.path;
                let filename = req.file.filename;
                listing.image = {url,filename};
                await listing.save();
            }
            req.flash("success","Listing updated");
            res.redirect(`/listings/${id}`);
            
        };

    module.exports.destroyListing = async(req,res)=>
        {
            //first of all we will be extracting the id so from which the system can know which post it has to delete
            let{id}=req.params;
            let deletedListing = await Listing.findByIdAndDelete(id);
            req.flash("success","Listing Deleted!");
            res.redirect("/listings");
        };