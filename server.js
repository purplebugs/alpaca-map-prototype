import fetch from "node-fetch";
import dotenv from "dotenv";
const config = dotenv.config();
import express from "express";
import { Client } from "@elastic/elasticsearch";

const app = express();
const port = 3000;

const client = new Client({
  cloud: {
    id: process.env.ELASTIC_CLOUD_ID,
  },
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
});

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/hello", (req, res) => {
  res.json({ name: "cutest alpaca" });
});

app.get("/api/closestAlpacasByRadius", (req, res) => {
  // TODO use lat,long, radius in kilometres from request to query Elastic for fixed radius, return list of alpacas
  // Returning mock list of alpaca locations while building up solution
  res.json([
    { lat: 60.391262, lng: 5.322054 },
    { lat: 63.430515, lng: 10.395053 },
  ]);
});

app.get("/api/all", async (req, res) => {
  // send list of all public alpaca farms"
  const result = await client.search({
    index: "alpaca-public-farms",
    query: { match_all: {} },
    sort: [{ "name.keyword": { order: "asc" } }],
  });

  res.json(result.hits.hits);
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

// Example use elasticsearch client
// Ref: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/introduction.html

async function run() {
  // Let's start by indexing some data
  await client.index({
    index: "game-of-thrones",
    document: {
      character: "Ned Stark",
      quote: "Winter is coming.",
    },
  });

  await client.index({
    index: "game-of-thrones",
    document: {
      character: "Daenerys Targaryen",
      quote: "I am the blood of the dragon.",
    },
  });

  await client.index({
    index: "game-of-thrones",
    document: {
      character: "Tyrion Lannister",
      quote: "A mind needs books like a sword needs a whetstone.",
    },
  });

  // here we are forcing an index refresh, otherwise we will not
  // get any result in the consequent search
  await client.indices.refresh({ index: "game-of-thrones" });

  // Let's search!
  const result = await client.search({
    index: "game-of-thrones",
    query: {
      match: { quote: "winter" },
    },
  });

  console.log("-------- Elasticsearch quick start: data from cloud ----------");
  console.log(result.hits.hits);
}

run().catch(console.log);
