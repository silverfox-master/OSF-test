var mdbClient = require('mongodb').MongoClient;

exports.dbConnectAndQuery = async (collection) =>{
    console.log('collection param is: ',collection)
    let coll;
    mdbClient.connect("mongodb+srv://user:pass@osf-kzbfh.mongodb.net/shop?retryWrites=true&w=majority",
        {useUnifiedTopology:true}, 
		function(err, db) {
			console.log("........MONGODB connected.....".blue.inverse);
			const shop = db.db("shop");
			shop
				.collection(collection)
				.find()
                .toArray(async function(err, items) {
                        await db.close();
                        console.log("items length is: ", items.length)
                        coll = items 
                        //console.log("coll in db = ",coll)
                    }
                );
            
        });
    return coll
        
}


const mongoose = require('mongoose');

exports.connectDB = async () =>{
    const conn = await mongoose.connect(process.env.MONGO_URI,{
        useNewUrlParser:true,
        useCreateIndex:true,
        useFindAndModify:false,
        useUnifiedTopology:true
    })
    console.log(`MongoDB connected: ${conn.connection.host}`.cyan.inverse)
}



//module.exports = dbConnectAndQuery;
