const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s1bw0ez.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const tasksCollection = client.db("taskManagementDB").collection("task");

    //  Task related api
    app.post('/tasks',async(req,res)=>{
        const task = req.body;
        const result =await tasksCollection.insertOne(task);
        res.send(result);
    });
    app.get('/tasks',async(req,res)=>{
        let query = {}
        if(req.query?.email){
            query = {email : req.query.email}
        }
        const result = await tasksCollection.find(query).toArray();
        res.send(result);
    });
    app.get('/tasks/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await tasksCollection.findOne(query);
        res.send(result);
    });
    app.delete('/tasks/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await tasksCollection.deleteOne(query);
        res.send(result);
    });
    app.patch('/tasks/:id', async(req,res)=>{
        const task = req.body;
        const id = req.params.id;
        const filter = {_id : new ObjectId(id)}
        const updatedDoc={
          $set:{
            title : task.title,
            description : task.description,
            deadline: task.deadline,
            priority: task.priority
          }
        }
        const result = await tasksCollection.updateOne(filter,updatedDoc);
        res.send(result);
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);








app.get('/',(req,res)=>{
    res.send('Task Manager server is running')
});
app.listen(port,()=>{
    console.log(`Task Manager server is running on port ${port}`);
});