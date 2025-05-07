const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");

// Dashboard route
router.get("/dashboard", isLoggedIn, wrapAsync(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate("listing")
        .sort("-startDate");
    res.render("dashboard", { bookings });
}));

// Create booking route
router.post("/listings/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, guests } = req.body;
        
        // Validate dates
        if (!startDate || !endDate || !guests) {
            req.flash("error", "Please provide all booking details");
            return res.redirect(`/listings/${id}`);
        }

        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        // Calculate total price
        const start = new Date(startDate);
        const end = new Date(endDate);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const totalPrice = listing.price * nights;

        const booking = new Booking({
            user: req.user._id,
            listing: id,
            startDate: start,
            endDate: end,
            guests: parseInt(guests),
            totalPrice,
            status: "confirmed"
        });

        await booking.save();
        req.flash("success", "Booking confirmed successfully!");
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        req.flash("error", "Error creating booking");
        res.redirect(`/listings/${id}`);
    }
}));

// Handle payment
router.post("/bookings/:id/payment", isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
    }

    // Simulate payment processing
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
        booking.status = "confirmed";
        await booking.save();
        return res.json({ success: true, booking });
    } else {
        return res.status(400).json({ success: false, error: "Payment failed" });
    }
}));

module.exports = router;
