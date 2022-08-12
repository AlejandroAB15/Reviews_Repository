if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utilities/ExpressError");
const locationsRoutes = require("./routes/locations");
const reviewsRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users")
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const dbURL = process.env.DB_URL;
const secret = process.env.SECRET;
const MongoStore = require("connect-mongo");


const APP = express();
const PORT = 3000; 

/* ----------------Conexion a la base de datos---------------------*/

mongoose.connect(dbURL);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
}); 

/* -----------------------------------------------------------------*/

/* --------------------EJS & EXPRESS CONFIGURATION------------------*/

APP.set('view engine', 'ejs');
APP.set('views', path.join(__dirname,'views'));
APP.use(express.urlencoded({extended: true}));
APP.use(methodOverride('_method'));
APP.engine('ejs', ejsMate);
APP.use(express.static(path.join(__dirname, "public")));
APP.use(helmet({ contentSecurityPolicy: false }));

const store = MongoStore.create({
    mongoUrl: dbURL,
    secret,
    touchAfter: 24*60*60
});

store.on("error", function(e){
    console.log("Session store error!",e);
})

const sessionConfig = {
    name: 'session',
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

APP.use(session(sessionConfig));
APP.use(flash());

APP.use(passport.initialize());
APP.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
APP.use(mongoSanitize());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

APP.use((req,res,next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

/* -----------------------------------------------------------------*/

/* ---------------------CRUD FUNCTIONALITY--------------------------*/

//EXPRESS ROUTERS
APP.use("/locations", locationsRoutes);
APP.use("/locations/:id/reviews", reviewsRoutes);
APP.use("/", userRoutes);

//DEFAULT PAGE
APP.get("/", (req, res) => {
    res.render("home");
})

APP.get("/home", (req, res) => {
    res.redirect("/");
});

//NOT FOUND PAGE
APP.all("*", (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});

/* -----------------------------------------------------------------*/

/* ---------------------EXPRESS ERROR HANDLING----------------------*/

APP.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('error', {err});
});

/* -----------------------------------------------------------------*/

APP.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})