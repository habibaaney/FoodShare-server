// const express = require("express");
// const cors = require("cors");

// // const { MongoClient, ServerApiVersion, ObjectId, ChangeStream } = require("mongodb");

// const { MongoClient, ServerApiVersion } = require("mongodb");

// const dotenv = require("dotenv");
// dotenv.config();

// //*** */ var admin = require("firebase-admin");

// // var serviceAccount = require("./admin-key.json");

// // admin.initializeApp({
// //   credential: admin.credential.cert(serviceAccount)
// // });



// // const serviceAccount = require("./admin-key.json");***

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// //**** */ MongoDB Connection
// // const client = new MongoClient(process.env.MONGODB_URI, {
// //   serverApi: {
// //     version: ServerApiVersion.v1,
// //     strict: true,
// //     deprecationErrors: true,
// //   },
// // });****




// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6dxtinj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);



// // middleware/auth.js


// // const verifyFirebaseToken = async (req, res, next) => {
// //   const authHeader = req.headers.authorization;

// //   if (!authHeader || !authHeader.startsWith('Bearer ')) {
// //     return res.status(401).json({ message: 'Unauthorized: No token provided' });
// //   }

// //   const idToken = authHeader.split(' ')[1];

// //   try {
// //     const decodedToken = await admin.auth().verifyIdToken(idToken);
// //     req.firebaseUser = decodedToken; // You can access user info like uid, email, etc.
// //     next();
// //   } catch (error) {
// //     return res.status(401).json({ message: 'Unauthorized: Invalid token from catch' });
// //   }
// // };



// // async function run() {
// //   try {
// //     await client.connect();
// //     const db = client.db("db_name");
// //     const events = db.collection("collection");
// //   } finally {
// //   }
// // }

// // run().catch(console.dir);

// // const m1 = (req, res, next) =>{
// //   console.log("first")
// //   console.log("name ", req.name);
// //   req.name = "AR Arzu";

// //   next();
// // }

// // const m2 = (req, res, next) =>{
// //   console.log("name from m2 ", req.name);
// //   console.log("m2")
// // next();
// // }

// // Root route


// app.get("/", async (req, res) => {
// // console.log(req.firebaseUser);

//   res.send("Server is running!");
// });



// app.listen(PORT, () => {
//   console.log(`Server is listening on port ${PORT}`);
// });


// /*
// 1. send token from client side
// 2. receive from server
// 3. decode the token from server
// */




const express = require("express");
const cors = require("cors");


const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

const admin = require("firebase-admin");
const serviceAccount = require("./firebase-admin-service-key.json");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();


// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6dxtinj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Collections
let foodsCollection;
let foodRequestsCollection;
let blogsCollection;





admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// // middleware/auth.js


const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decodedToken; // You can access user info like uid, email, etc.
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token from catch' });
  }
};

// Connect to MongoDB
async function run() {
  try {
    // await client.connect();
    const db = client.db("foodsCollection");

    foodsCollection = db.collection("foods");
    foodRequestsCollection = db.collection("foodRequests");
    blogsCollection = db.collection("blogs");
    newsletterCollection = db.collection("newsletterSubscribers");

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
run().catch(console.dir);

// Root endpoint
app.get("/",  (req, res) => {
  res.send("Community Food Sharing Server is Running!");
});


// ==========================
// ✅ FOODS APIs
// ==========================

// Get all foods
app.get("/foods", async (req, res) => {

  try {
    const allFoods = await foodsCollection.find().toArray();
    res.send(allFoods);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch foods" });
  }
});

// Get featured foods (most quantity)
app.get("/featured-foods", async (req, res) => {
  try {
    const featuredFoods = await foodsCollection
      .find({ status: "available" })
      .sort({ quantity: -1 })
      .limit(8)
      .toArray();
    res.send(featuredFoods);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch featured foods" });
  }
});

// Get single food by ID
app.get("/foods/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const food = await foodsCollection.findOne({ _id: new ObjectId(id) });

    if (!food) {
      return res.status(404).send({ message: "Food not found" });
    }

    res.send(food);
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Get only available foods
app.get("/available-foods", verifyFirebaseToken, async (req, res) => {

  try {
    const foods = await foodsCollection.find({ status: "available" }).toArray();
    res.send(foods);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch available foods" });
  }
});

// Add new food
app.post("/add-food", async (req, res) => {
  const food = req.body;
    

  // Set default values
  food.createdAt = new Date();
  food.status = "available";

  // Basic validation
  if (!food.name || !food.image || !food.quantity || !food.location || !food.addedBy) {
    return res.status(400).send({ error: "Missing required food fields" });
  }

  try {
    const result = await foodsCollection.insertOne(food);
    res.send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).send({ error: "Failed to add food" });
  }
});

// PATCH route
app.patch("/foods/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const result = await foodsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    res.send(result);
  } catch (error) {
    console.error("Error updating food:", error);
    res.status(500).send({ error: "Failed to update food" });
  }
});

// DELETE route
app.delete("/foods/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await foodsCollection.deleteOne({ _id: new ObjectId(id) });

    res.send(result);
  } catch (error) {
    console.error("Error deleting food:", error);
    res.status(500).send({ error: "Failed to delete food" });
  }
});



// ==========================
// ✅ FOOD REQUEST APIs
// ==========================

// Submit food request
app.post("/food-requests", async (req, res) => {
  const requestData = req.body;

  if (
    !requestData.foodId ||
    !requestData.foodName ||
    !requestData.foodImage ||
    !requestData.userEmail ||
    !requestData.donorName ||
    !requestData.pickupLocation ||
    !requestData.expireDate
  ) {
    return res.status(400).send({ error: "Missing required request fields" });
  }

  try {
    // Insert food request
    const result = await foodRequestsCollection.insertOne({
      ...requestData,
      requestDate: new Date(),
    });

    // Mark food as requested
    await foodsCollection.updateOne(
      { _id: new ObjectId(requestData.foodId) },
      { $set: { status: "requested" } }
    );

    res.send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).send({ error: "Failed to submit food request" });
  }
});

// Get food requests by user email
app.get("/food-requests", async (req, res) => {
  const userEmail = req.query.userEmail;

  if (!userEmail) {
    return res.status(400).send({ error: "User email is required" });
  }

  try {
    const requests = await foodRequestsCollection
      .find({ userEmail })
      .sort({ requestDate: -1 })
      .toArray();

    res.send(requests);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch food requests" });
  }
}); 

// Delete food request
app.delete("/food-requests/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await foodRequestsCollection.deleteOne({ _id: new ObjectId(id) });

    res.send(result);
  } catch (error) {
    console.error("Error deleting food request:", error);
    res.status(500).send({ error: "Failed to delete food request" });
  }
});


// ==========================
// BLOG APIs
// ==========================

// Add a new blog
app.post("/blogs",async (req, res) => {
  try {
    const newBlog = req.body;
    if (!newBlog.title || !newBlog.image || !newBlog.content || !newBlog.author) {
      return res.status(400).json({ message: "All blog fields are required" });
    }

    newBlog.createdAt = new Date();
    const result = await blogsCollection.insertOne(newBlog);
    res.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("POST /blogs error:", error);
    res.status(500).json({ message: "Failed to add blog" });
  }
});

// Get all blogs
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await blogsCollection.find().sort({ createdAt: -1 }).toArray();
    res.json(blogs);
  } catch (error) {
    console.error("GET /blogs error:", error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

// Get single blog
app.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid blog ID" });

    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (error) {
    console.error("GET /blogs/:id error:", error);
    res.status(500).json({ message: "Failed to fetch blog" });
  }
});

// PATCH: update a blog
app.patch("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    // Only allow certain fields to be updated
    const { title, content, image, author } = req.body;
    const updatedBlog = { title, content, image, author };

    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedBlog }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("PATCH /blogs/:id error:", error);
    res.status(500).json({ message: "Failed to update blog", error: error.message });
  }
});
// Delete blog
app.delete("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid blog ID" });

    const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Blog not found" });

    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("DELETE /blogs/:id error:", error);
    res.status(500).json({ message: "Failed to delete blog" });
  }
});



// ==========================
// ✅ Contact Form API
// ==========================



// Setup Nodemailer transporter with your email service credentials
// Example uses Gmail — you need to allow less secure apps or create an App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jahananey90@gmail.com", // replace with your email
    pass: "suxh ebsa yoek gajy", // replace with your password/app password
  },
});

// POST /contact endpoint
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  // Simple validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Prepare email options
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: "jahananey90@gmail.com", // replace with your email to receive messages
    subject: `New Contact Message from ${name}`,
    text: `You have a new message from ${name} (${email}):\n\n${message}`,
    html: `<p>You have a new message from <strong>${name}</strong> (${email}):</p><p>${message}</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ message: "Failed to send message" });
    }
    console.log("Email sent: " + info.response);
    res.json({ message: "Message sent successfully" });
  });
});



// ==========================
// ✅ Newsletter Subscription API
// ==========================
app.post("/newsletter", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Check if already exists
  const existing = await newsletterCollection.findOne({ email });
  if (existing) {
    return res.json({ message: "You’re already subscribed!" });
  }

  const result = await newsletterCollection.insertOne({
    email,
    subscribedAt: new Date(),
  });

  res.json(result);
});

// ==========================
// ✅ Start the Server
// ==========================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
