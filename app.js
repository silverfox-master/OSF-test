// Module dependencies.
var express   = require("express")
  , path      = require("path")
  , cart      = require("./routes/cart")
  , category  = require("./routes/category")
  , products  = require("./routes/products")
  , search    = require("./routes/search")
  , index     = require("./routes/index");
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
var session   = require('express-session')
const { connectDB } = require('./config/db');

var app     = express();
dotenv.config({ path:'./config/config.env' })

//Connect to mongoose
connectDB();

//session middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));




// All environments
app.use(express.json());
app.use(cookieParser());

//dev logging middleware
app.use(morgan('dev'));
app.set("port", 80);
app.set("views", __dirname + "/views");
app.engine('ejs', require('ejs-locals'));
// app.use(express.session());

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


// Mount App routes
app.use("/"  , index);            // DONE
app.use("/search", search);
app.use("/category", category);   // DONE
app.use("/cart", cart);
app.use("/products", products);


app.listen(app.get("port"), () => {
       console.log(`App listening in DEV mode on port ${app.get("port")}!`.yellow.inverse);
});



process.on("SIGINT", () => {
  dbClient.close();
  process.exit();
});









