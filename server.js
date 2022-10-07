import fetch from "node-fetch";
import dotenv from "dotenv";
const config = dotenv.config();
import express from "express";
import { Client } from "@elastic/elasticsearch";

const app = express();
const port = 3000;

// Ref https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/introduction.html
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
  // send list of all public alpacas, eg /api/all?from=0&size=25
  const from = req.query.from ? req.query.from : 0;
  const size = req.query.size ? req.query.size : 25;

  const result = await client.search({
    index: "alpacas-enriched-with-public-farm-flag",
    from: from,
    size: size,
    query: {
      match: {
        "farmType.public": true,
      },
    },
  });

  const response = result.hits.hits;
  //console.log(response);
  res.json(response);
});

app.get("/api/farm", async (req, res) => {
  // send list of all public alpaca farms, eg /api/farm?from=0&size=25
  const from = req.query.from ? req.query.from : 0;
  const size = req.query.size ? req.query.size : 25;

  const result = await client.search({
    index: "alpaca-public-farms",
    from: from,
    size: size,
    query: { match_all: {} },
    sort: [{ "name.keyword": { order: "asc" } }],
  });

  const response = result.hits.hits;
  // console.log(response);
  res.json(response);
});

app.get("/api/country/:countryCode", async (req, res) => {
  // send list of all public alpacas by country
  // eg /api/country/NO?from=0&size=25, /api/country/SE, /api/country/AU

  const from = req.query.from ? req.query.from : 0;
  const size = req.query.size ? req.query.size : 25;
  const country = req.params.countryCode;

  const result = await client.search({
    index: "alpacas-enriched-with-public-farm-flag",
    from: from,
    size: size,
    query: {
      bool: {
        must: [
          {
            match: {
              country: country,
            },
          },
          {
            match: {
              "farmType.public": true,
            },
          },
        ],
      },
    },
    sort: [{ "name.keyword": { order: "asc" } }],
  });

  const response = result.hits.hits;
  // console.log(response);
  res.json(response);
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
