if(process.env.NODE_ENV != "production")
{
    require("dotenv").config();
}
const express=require("express");//requiring express
const app=express();
const mongoose=require("mongoose");//requiring mongoose
const path=require("path");//we aquired the path in this in order to access the ejs files
const methodOverride = require("method-override")
const ejsMate=require("ejs-mate");//here we are requiring the ejs mate
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash= require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Booking = require("./models/booking.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRoutes = require("./routes/booking");

const dbUrl = process.env.ATLASDB_URL;
main().then(()=>
{
    console.log("connected to the DB");
}).catch(err=>
{
    console.log(err);
});
async function main()
{
    await mongoose.connect(dbUrl);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>
{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());//we have to use the flash before our routes because the flash will be used with the help of the routes

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>
{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
});

/*app.get("/demouser", async(req,res)=>
{
    let fakeUser = new User({
        email:"student@gmail.com",
        username:"delta-student",
    });
    //register method will help us to store the user in the database, here we are first passing the variable ie the fakeUser and with it we are passing the password
    let registeredUser = await User.register(fakeUser,"helloworld");
    res.send(registeredUser);
});*/

// Update the order of route mounting to ensure booking routes are mounted correctly
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", bookingRoutes); // Make sure this is mounted before the 404 handler

// This should be the last route
app.all("*",(req,res,next)=>
{
    next(new ExpressError(404, "Page Not Found!"));
});
//now we are defining a middleware
app.use((err,req,res,next)=>
{
    //here we will be deconstructing the error by extracting its statuscode and message
    let {statusCode=500, message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs",{message});
    //res.status(statusCode).send(message);
});
//creating a basic api

//starting the server
app.listen(8080,()=>
{
    console.log("server is listening to port 8080");
});