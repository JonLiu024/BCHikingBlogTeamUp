const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

const app = express();
app.use(bodyParser.json());

const dbUrl = "mongodb://localhost:27017";
const dbName = "trailsDB";
let db;

MongoClient.connect(dbUrl, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Dialogflow webhook route
app.post("/webhook", async (req, res) => {
  const parameters = req.body.queryResult.parameters;
  const difficulty = parameters.difficulty;
  const location = parameters.location;
  const length = parameters.length;

  // Generate the MongoDB query based on the extracted parameters
  const query = {};
  if (difficulty) query.difficulty = difficulty;
  if (location) query.location = location;
  if (length) query.length = { $gte: length };

  try {
    const trails = await db.collection("trails").find(query).toArray();
    const responseText = trails.length
      ? `Here are some trails matching your criteria: ${trails
          .map((trail) => trail.name)
          .join(", ")}`
      : "No trails found matching your criteria.";

    // Send response back to Dialogflow
    res.json({
      fulfillmentText: responseText,
    });
  } catch (err) {
    console.error("Error querying the database:", err);
    res.json({
      fulfillmentText: "There was an error processing your request.",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
