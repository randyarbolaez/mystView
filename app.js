require("dotenv").config({ path: "./env" });

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("./models/user-schema");

// DB Setup
mongoose.Promise = Promise;
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to Mongo!");
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });
// DB Setup

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cookieParser());

app.use(
  session({
    secret: "our-passport-local-strategy-app",
    resave: true,
    saveUninitialized: true
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "/public")));
// app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// PASSPORT CONFIG
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

passport.use(
  new LocalStrategy(
    {
      passReqToCallback: true
    },
    (req, username, password, next) => {
      User.findOne(
        {
          username
        },
        (err, user) => {
          if (err) {
            return next(err);
          }
          if (!user) {
            return next(null, false, {
              message: "Incorrect username"
            });
          }
          if (!bcrypt.compareSync(password, user.password)) {
            return next(null, false, {
              message: "Incorrect password"
            });
          }

          return next(null, user);
        }
      );
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

//Route
const index = require("./routes/index");
app.use("/", index);
const authRoutes = require("./routes/auth-routes");
app.use("/", authRoutes);
const reviewRoutes = require("./routes/review-routes");
app.use("/reviews", reviewRoutes);
//Route

app.listen(process.env.PORT, () => {
  console.log(`Listening on http://localhost:${process.env.PORT}`);
});

module.exports = app;
