// Module dependencies.
var express = require("express")
  , path    = require("path")
  , cart  = require("./routes/cart")
  , category  = require("./routes/category")
  // , pdp  = require("./routes/pdp")
  , products  = require("./routes/products")
  , search  = require("./routes/search")
  , index   = require("./routes/index")
var app     = express();
var session = require('express-session')

//session middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

const MongoClient = require("mongodb").MongoClient;
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');

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

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next()
})

// Mount App routes
app.use("/"  , index);            // DONE
app.use("/search", search);
app.use("/category", category);   // DONE
app.use("/cart", cart);
app.use("/products", products);


// Connect to mongoDB, open connection and keep it while server running
const mongoClient = new MongoClient("mongodb+srv://user:pass@osf-kzbfh.mongodb.net/shop?retryWrites=true&w=majority", {
   useNewUrlParser: true,
   useUnifiedTopology: true
  });
 
let dbClient;
 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("shop").collection("categories");
    app.locals.products = client.db("shop").collection("products");
    app.listen(app.get("port"), function(){
        console.log("Express server listening on port ",app.get("port") );
    });
});




process.on("SIGINT", () => {
  dbClient.close();
  process.exit();
});
