const express = require('express'); 
const { v4: uuid } = require('uuid');
var cors = require('cors');
var app = express();
require('dotenv').config()
const {MongoClient, ServerApiVersion} = require("mongodb");
const port = process.env.PORT || 3030; 

app.use(cors());
app.use(express.json()) 
const uri = process.env.URL
const client = new MongoClient(uri,  {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}
);

// var PlaceOrder = {
//     pickUp:"",
//     dropOff:"",
//     note:"",
//     email:"",
//     track_id:"",
//     isPending:boolean,
//     GeoPoint:{
//         lat:any,
//         log:any
//     }
// }


// var EditOrder = { 
//     pickUp:string,
//     dropOff:string,
//     note:string, 
//     email:string,
//     track_id:string,
//     isPending:boolean,
//     GeoPoint:{
//         lat:any,
//         log:any
//     }
// }




app.post('/Register', async (req, res) => {  
    let body = req.body;
    const pets = client.db("Orders").collection("Register");
     if(!await pets.findOne({"body.email":body.email})){
         let write = await pets.insertOne({body});
          if(write.acknowledged)
              res.json({message:"Account created."});
          else
              res.json({message:"Error ocurred account not created"})
     }else
          res.json({message:"Account already exist !"})
});





app.post('/Login', async (req, res) => {  
    let payload = req.body;
       const ref = await client.db("Orders").collection("Register").findOne({"body.email":req.body.email}) 
       if(ref !== null){      
              if(ref.body.password === payload.password)
                   res.json({message:ref.body.email})
               else
                  res.json({message:"Password is invalid"})
        }else
            res.json({message:"Account not found !"})
  
  });





app.post('/PlaceOrder', async (req, res) => {  
        let payload = req.body;
        let pay = {
            track_id: Replace(uuid()),
            pickUp: payload.pickUp,
            desitation: payload.desitation,
            isPending:true,
            GeoPoint:{
                 lat:0,
                 log:0,
            }
        }
        const ref = await client.db("PlaceOrders").collection("Orders").insertOne(pay);
        
          let isWrite = ref.insertedId
           if(isWrite)
              res.json({message:pay.track_id})
           else
              res.json({message:"Contact us order could'nt be placed !"})
  
  });





app.post('/ListOrders', async (req, res) => {  
     let ref = await client.db("PlaceOrders").collection("Orders").find().toArray();
         res.json({message:ref})    
  });






app.post('/ListAccounts', async (req, res) => {  
    let body = req.body;
    const pets = await client.db("Orders").collection("Register").find().toArray();
      res.json({message: pets})
});




  app.post('/EditOrders', async (req, res) => {  
    let payload = req.body;
     let ref =  await client.db("PlaceOrders").collection("Orders")
        .updateOne({"track_id":payload.track_id},{$set:{GeoPoint:{lat:payload.lat,log:payload.log}}});     
    res.json({message: ref.acknowledged ? "Order has been updated" : "Order not found."})   
  });  





  app.post('/Complete', async (req, res) => {  
    let payload = req.body;
     let ref =  await client.db("PlaceOrders").collection("Orders")
        .updateOne({"track_id":payload.track_id},{$set:{isPending:false}});     
    res.json({message: ref.acknowledged ? "Order has been updated" : "Order not found."})   
  });  



  function Replace(url){
    return url.toUpperCase().replace(/-/g, ''.trim())
}



app.listen(port, () => {         
    console.log(`Now listening on port ${port}`); 
});


//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