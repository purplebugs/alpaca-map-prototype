import fetch from "node-fetch";
import dotenv from "dotenv";
const config = dotenv.config();
import express from "express";

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

// Ref: https://developers.google.com/maps/documentation/distance-matrix?hl=en_GB
// Ref: https://developers.google.com/maps/documentation/distance-matrix/start

const searchParamsDistanceMatrix = new URLSearchParams();
searchParamsDistanceMatrix.set("origins", "Washington DC");
searchParamsDistanceMatrix.set("destinations", "New York City");
searchParamsDistanceMatrix.set("key", process.env.GOOGLE_MAPS_API_KEY);

const distanceMatrixRequest = `https://maps.googleapis.com/maps/api/distancematrix/json?${searchParamsDistanceMatrix}`;

// Ref: https://www.npmjs.com/package/node-fetch#handling-exceptions
class HTTPResponseError extends Error {
  constructor(response, ...args) {
    super(
      `HTTP Error Response: ${response.status} ${response.statusText}`,
      ...args
    );
    this.response = response;
  }
}

const checkStatus = (response) => {
  if (response.ok) {
    // response.status >= 200 && response.status < 300
    console.log("-------- response.ok: distanceMatrixAPI ----------");
    return response;
  } else {
    throw new HTTPResponseError(response);
  }
};

const response = await fetch(distanceMatrixRequest);

try {
  const data = await checkStatus(response);

  /*
  Example response:

  {
  destination_addresses: [ 'New York, NY, USA' ],
  origin_addresses: [ 'Washington, DC, USA' ],
  rows: [ { elements: [Array] } ],
  status: 'OK'
  }

  */

  console.log(await data.json());
} catch (error) {
  console.error(error);
  const errorBody = await error.response.text();
  console.error(`Error body: ${errorBody}`);
}
