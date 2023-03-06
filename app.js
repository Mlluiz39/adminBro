// ========== server.js ==============
// Requirements
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const AdminBro = require("admin-bro");
const AdminBroExpressjs = require("admin-bro-expressjs");

// We have to tell AdminBro that we will manage mongoose resources with it
AdminBro.registerAdapter(require("admin-bro-mongoose"));

// express server definition
const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || "8080";

// Resources definitions
const User = mongoose.model("User", {
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "restricted"], required: true },
  name: String,
  firstName: String,
});
var recipesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  yeld: { type: String, required: true },
  ingredients: [{ name: String, quantity: String }],
  preparation: { type: String, required: true },
  preparationTime: { type: String, required: true },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

const Recipes = mongoose.model("Recipes", recipesSchema);

// Routes definitions
app.get("/", (req, res) => res.send("Hello World!"));

// Route which returns users
app.get("/users", async (req, res) => {
  const users = await User.find({}).limit(10);
  res.send(users);
});

// Route which creates new user
app.post("/users", async (req, res) => {
  const user = await new User(req.body.user).save();
  res.send(user);
});

// Route whick retuns articles
app.get("/recipes", async (req, res) => {
  const recipes = await Recipes.find({}).limit(10);
  res.send(recipes);
});

// Pass all configuration settings to AdminBro
const adminBro = new AdminBro({
  resources: [User, Recipes],
  rootPath: "/admin",
  branding: {
    companyName: "Mlluiz devBook",
  },
});

// Build and use a router which will handle all AdminBro routes
const router = AdminBroExpressjs.buildRouter(adminBro);
app.use(adminBro.options.rootPath, router);

// Running the server
const run = async () => {
  await mongoose.connect("mongodb://164.152.48.202/admin-bro", {
    useNewUrlParser: true,
  });
  app.listen(port, () =>
    console.log(`AdminBro is under http://localhost:${port}/admin`)
  );
};

run();
