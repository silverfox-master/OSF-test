// Module dependencies.
var express = require("express")
  , http    = require("http")
  , path    = require("path")
  , routes  = require("./routes");
var app     = express();

const MongoClient = require("mongodb").MongoClient;
const colors = require('colors');
//const dotenv = require('dotenv');



// All environments
app.set("port", 80);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser("61d333a8-6325-4506-96e7-a180035cc26f"));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.errorHandler());

// App routes
app.get("/"  , routes.index);
app.get("/shop/:level1", routes.collectionsOfProducts);
app.get("/shop/:level1/:level2", routes.collectionsOfProducts);
app.get("/shop/:level1/:level2/:level3", routes.listOfProducts);
app.get("/shop/:level1/:level2/:level3/:prodID", routes.oneProduct);




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

// Run server
// http.createServer(app).listen(app.get("port"), function() {
// 	console.log("Express server listening on port " + app.get("port"));
//});



process.on("SIGINT", () => {
  dbClient.close();
  process.exit();
});
