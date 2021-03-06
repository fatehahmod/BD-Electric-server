const express = require('express');
const stripe = require('stripe')('sk_test_51KFv2GLrL1EnXa50ySgpEtLrqPPzBfUqETKHomqlbDDeicL9eMfjim2a0vJHXSwYtolw0AgautHKuVCCKNLnuKfQ00uUyAQ9o8');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const app = express();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000
const cors = require('cors')
// medilware
app.use(cors());
app.use(express.json());

// cannect uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n0kiz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);


async function run() {
  try {
    await client.connect();
    const database = client.db('mobile-bd');
    const mobileCallection = database.collection('mobile');
    const addMobiletCallection = database.collection('addMobile');
    const bookMobileCallection = database.collection('bookMobile');
    const reviewCallection = database.collection('review');
    const usersCallection = database.collection('user');
    const clintCallection = database.collection('clint');



    // get api
    app.get('/mobile', async (req, res) => {
      const cursor = mobileCallection.find({});
      const user = await cursor.toArray();

      res.send(user)

    });

    // get single
    app.get('/mobile/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = {
        projection: { _id: 0 },
      };
      const result = await mobileCallection.findOne(query, options);
      res.send(result)
    });
//  post Api
    app.post('/addBike', async (req, res) => {
      const dile = req.body;
      const result = await addMobiletCallection.insertOne(dile);
      res.json(result)

    })

    // get api 
    app.get('/addMobile', async (req, res) => {
      const cursor = addMobiletCallection.find({});
      const user = await cursor.toArray();
      res.send(user)

    });


    // get single
    app.get('/bookMobile/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = {
        projection: { _id: 0 },
      };
      const result = await bookMobileCallection.findOne(query, options);
      res.send(result)
    });


    //  post Api for add to card

    app.post('/bookBike', async (req, res) => {
      const bike = req.body;
      const result = await bookMobileCallection.insertOne(bike);
      res.json(result)

    })

    /// get all
    app.get('/manageOrder', async (req, res) => {
      const cursor = bookMobileCallection.find({});
      const user = await cursor.toArray();
      res.send(user)
    });

    // get Api

    app.get('/myOrder/:email', async (req, res) => {
      const email = req.params.email;
      const qurey = { email: email };
      console.log(qurey);
      const result = await bookMobileCallection.find(qurey).toArray();
      console.log(result);
      res.json(result);


    })

    // delete Api
    app.delete('/manageOrder/:id', async (req, res) => {
      const bikeId = req.params.id;
      console.log(bikeId);
      const qurey = { _id: ObjectId(bikeId) };
      const result = await bookMobileCallection.deleteOne(qurey);
      res.json(result);


    })

    //  post Api
    app.post('/review', async (req, res) => {
      const dile = req.body;
      const result = await reviewCallection.insertOne(dile);

      res.json(result)

    });

    /// get all
    app.get('/review', async (req, res) => {
      const cursor = reviewCallection.find({});
      const user = await cursor.toArray();
      res.send(user)
    });
// add user info
    app.post("/addUserInfo", async (req, res) => {
      console.log("req.body");
      const result = await usersCallection.insertOne(req.body);
      res.send(result);

    });

// make Admin
    app.put("/makeAdmin", async (req, res) => {
      const filter = { email: req.body.email };
      const result = await usersCallection.find(filter).toArray();
      if (result) {
        const documents = await usersCallection.updateOne(filter, {
          $set: { role: "admin" },
        });


      }
      res.send(result)
    });

//chack Admin
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await usersCallection.find({ email: req.params.email })
        .toArray();
      res.send(result);
    });


// status update
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id,req.body)
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: req.body.status,
        }
      }

      const result = await bookMobileCallection.updateOne(filter, updateDoc, options
      );
      res.json(result);
      console.log(result);
    });


    //get clint api 

    app.get('/clint', async (req, res) => {
      const cursor = clintCallection.find({});
      const user = await cursor.toArray();

      res.send(user)

    });

    // stripe payment gatway
    app.post('/payAmount', async (req, res) => {
      const paymentInfo = req.body;
      const amount = paymentInfo.price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
          currency: 'usd',
          amount: amount,
          payment_method_types: ['card']
      });
      res.json({ clientSecret: paymentIntent.client_secret })
  });

  // set payment status
  app.put('/payProduct/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const payment = req.body;
      const filter = { _id:ObjectId (id)};
      const updateDoc = {
          $set: {
              paid:true
          }
      };
      const result = await bookMobileCallection.updateOne(filter, updateDoc);
      res.json(result);
  })


  }

  finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('runing my server 5000')
});
app.listen(port, () => {
  console.log('live server', port);
})