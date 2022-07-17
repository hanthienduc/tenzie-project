const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("./tenzies-game/public"));

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(bodyParser.json());

const playerSchema = new mongoose.Schema({
  name: { type: String, require: true },
  log: [
    {
      score: { type: Number, require: true },
      date: { type: Date, require: true },
    },
  ],
});

const Player = mongoose.model("Player", playerSchema);

app.get("/", function (req, res) {
  res.send("GET request to homepage");
});

app.post("/api/add-new-player", function (req, res) {
  let playerName = req.body.name;
  if (!playerName) {
    return res.status(404).json({ message: "name not provided" });
  }
  const newPlayer = new Player({ name: playerName });
  newPlayer.save(function (err, addedPlayer) {
    if (err) console.log(err);
    res.json({
      name: addedPlayer.name,
      message: "user created successfully",
    });
  });
});

app.post("/api/add-score", function (req, res) {
  const name = req.body.name;
  const score = req.body.score;
  const date = new Date();

  Player.findOne({ name: name }, function (err, playerFound) {
    if (err) console.log(err);
    playerFound.log.push({
      score: score,
      date: date,
    });
    playerFound.save(function (err, updatedPlayer) {
      if (err) console.log(err);
      res.json({ message: "You gain +1 score" });
    });
  });
});

app.get("/players", function (req, res) {
  res.json("Players list");
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
