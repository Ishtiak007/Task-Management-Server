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
    // await client.connect();


    const tasksCollection = client.db("taskManagementDB").collection("task");

    //  Task related api
    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const result = await tasksCollection
        .find({ owner: email, status: 'todo' })
        .sort({ deadline: 1 })
        .toArray();
      res.send(result);
    });

    app.get("/ongoingTasks/:email", async (req, res) => {
      const email = req.params.email;
      const result = await tasksCollection
        .find({ owner: email, status: "ongoing" })
        .toArray();
      res.send(result);
    });
    
    app.get("/completedTasks/:email", async (req, res) => {
      const email = req.params.email;
      const result = await tasksCollection
        .find({ owner: email, status: "completed" })
        .toArray();
      res.send(result);
    });

    app.get('/individual/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await tasksCollection.findOne(query)
      res.send(result)
      // console.log(result)
    })


    app.post("/addTask", async (req, res) => {
      const task = req.body;
      const result = await tasksCollection.insertOne(task);
      res.send(result);
    });

    app.put('/updateTask/:id', async(req,res)=>{
      const id = req.params.id;
      const query ={_id: new ObjectId(id)}
      const options = {
        upsert: true
      }
      const task = req.body;
      const updateDoc = {
        $set: task
      }
      const result = await tasksCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })

    app.delete("/deleteTask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/updateTaskStatus/:taskId", async (req, res) => {
      const { taskId } = req.params;
      const { newStatus } = req.body;

      const taskToUpdate = await tasksCollection.findOne({
        _id: new ObjectId(taskId),
      });

      if (!taskToUpdate) {
        return res.status(404).json({ error: "Task not found" });
      }

      try {
        await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { status: newStatus } }
        );

        return res
          .status(200)
          .json({ message: "Task status updated successfully" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });




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