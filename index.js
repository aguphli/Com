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



app.post('/Register', async (req, res) => {  
    let body = req.body;
    try{
     const pets = client.db("Orders").collection("Register");
      if(!await pets.findOne({"body.email":body.email})){
          pets.insertOne({body});
           res.json({message:"Account created."});
        }else
            res.json({message:"Account already exist !"})
        }catch(err){
            res.json({message: err})
        }
});





app.post('/Login', async (req, res) => {  
    let payload = req.body;
       const ref = await client.db("Orders").collection("Register").findOne({"body.email":req.body.email}) 
       if(ref !== null){      
              if(ref.body.password === payload.password)
                   res.json({message:{User:{email:ref.body.email,fullname:ref.body.fullname}}});
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
            email:payload.email,
            name:payload.name,
            currentLocation:"Pending",
            date:DateHumanFormated(),
            isPending:true,
            GeoPoint:{
                 lat:0,
                 log:0,
            }
        }
        const ref = await client.db("PlaceOrders").collection("Orders").insertOne(pay);
        let refind =  await client.db("Orders").collection("Register")
                .findOne({"body.email":payload.email});
                    if(refind.isDisabled !== true){
                        let isWrite = ref.insertedId
                        if(isWrite)
                          res.json({message:pay.track_id})
                        else
                          res.json({message:"Contact us order could'nt be placed !"})
                    }else
                        res.json({message:"Account has been disabled Pls contact Myrapidroute!"})
      
  
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





app.post('/ListOfUserOrders', async (req, res) => {  
    let carry = [];
    let body = req.body;
    const pets = await client.db("PlaceOrders").collection("Orders").find().toArray();
     for(let e = 0; e < pets.length; e++){
         if(pets[e].email === body.email)
            carry.push(pets[e]);
      if(e == pets.length || e == pets.length -1)
          res.json({message:carry});
     }
});






app.post('/EditUser', async (req, res) => {  
    let payload = req.body;
     let ref =  await client.db("Orders").collection("Register")
        .updateOne({"body.email":payload.email},{$set:{"body.isDisabled": payload.n === 1 ? false : true}}); 
        console.log(ref);    
    res.json({message: ref.matchedCount !== 0 ? "User account updated" : "User not found."})   
});






app.post('/EditOrders', async (req, res) => {  
    let payload = req.body;
     let ref =  await client.db("PlaceOrders").collection("Orders")
        .updateOne({"body.track_id":payload.track_id},{$set:{GeoPoint:{lat:payload.lat,log:payload.log},currentLocation:payload.currentLocation}});     
    res.json({message: ref.acknowledged ? "Order has been updated" : "Order not found."})   
});  







app.post('/Complete', async (req, res) => {  
    let payload = req.body;
     let ref =  await client.db("PlaceOrders").collection("Orders")
        .updateOne({"body.track_id":payload.track_id},{$set:{"body.isPending":false}});     
    res.json({message: ref.acknowledged ? "Order has been updated" : "Order not found."})   
});  





app.post('/Check', async (req, res) => {  
    let body = req.body;
    try{
        const pets = client.db("PlaceOrders").collection("Orders");
        let find = await pets.findOne({"track_id":body.track_id});

        let refind =  await client.db("Orders").collection("Register")
           .findOne({"email":body.email});
            if(refind.isDisabled !== true)
               res.json({message: find});
            else
                res.json({message:"Account has been disabled Pls contact Myrapidroute!"})
        }catch(err){
            res.json({message: err})
        }
});




app.post('/delete', async (req, res) => {  
    let body = req.body;
    try{
        const pets = client.db("PlaceOrders").collection("Orders");
        let find = await pets.deleteOne({"track_id":body.track_id})
        if(find.acknowledged)
            res.json({message: "Order deleted"});
        }catch(err){
            res.json({message: err})
        }
});



function Replace(url){
    return url.toUpperCase().replace(/-/g, ''.trim())
}



function DateHumanFormated(){
 return  new Date().toISOString().split('T')[0]
}

   

app.listen(port, () => {         
    console.log(`Now listening on port ${port}`); 
});


//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