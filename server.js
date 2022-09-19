const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.use(express.static("static"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

var axios = require("axios");

var config = {
  method: "get",
  url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=Washington%2C%20DC&destinations=New%20York%20City%2C%20NY&units=imperial&key=${process.env.GOOGLE_MAPS_API_KEY}`,
  headers: {},
};

axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
