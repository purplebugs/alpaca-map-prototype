const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/hello", (req, res) => {
  res.json({ name: "cutest alpaca" });
});

app.use(express.static("static"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

var axios = require("axios");

// NB: There is also a Directions API https://developers.google.com/maps/documentation/directions/get-directions
// eg: https://maps.googleapis.com/maps/api/directions/json?origin=Boston%2C%20MA&destination=Concord%2C%20MA&waypoints=via%3ACharlestown%2CMA%7Cvia%3ALexington%2CMA&key=YOUR_API_KEY'

// Ref: https://developers.google.com/maps/documentation/distance-matrix?hl=en_GB
// Ref: https://developers.google.com/maps/documentation/distance-matrix/start

const searchParamsDistanceMatrix = new URLSearchParams();
searchParamsDistanceMatrix.set("origins", "Washington DC");
searchParamsDistanceMatrix.set("destinations", "New York City");
searchParamsDistanceMatrix.set("key", process.env.GOOGLE_MAPS_API_KEY);
const searchParamsDistanceMatrixPath = "distancematrix";

var distanceMatrixAPI = {
  method: "get",
  url: `https://maps.googleapis.com/maps/api/${searchParamsDistanceMatrixPath}/json?${searchParamsDistanceMatrix}`,
  headers: {},
};

axios(distanceMatrixAPI)
  .then(function (response) {
    console.log("-------- distanceMatrixAPI ----------");
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
