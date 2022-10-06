# alpaca-map 🦙 🗺

Visualising alpacas on a map

## Install app 🐣

```
npm install
```

## First time users only 🪴

1. Indexes should be created in Elasticsearch. Tip: this [elastic-data-tool](https://github.com/purplebugs/elastic-data-tool)
   was used
2. Create an .env file in the root of your project containing the keys

```
ELASTIC_CLOUD_ID="UPDATE-ME"
ELASTIC_USERNAME="UPDATE-ME"
ELASTIC_PASSWORD="UPDATE-ME"
```

3. Create a GOOGLE_MAPS_API_KEY and insert it in all relevant locations in the client side code. Tip: search code base for `maps.googleapis.com/maps/api/js?key`

## Start app 🚀

```
npm start
```

## Use app 🎷

Front end

- Navigate to [http://localhost:3000/](http://localhost:3000/) and follow links in UI
- Navigate to http://localhost:3000/api/ and try using the API

Examples to navigate to

- http://localhost:3000/api - Shows message, outputs logs to console
- http://localhost:3000/api/all
- http://localhost:3000/api/hello

## Status 🚜

Done:

- Local server up and running
- Calculation of fixed distance using Google maps distance matrix API to console
- Client side calculation of fixed distance using Google maps distance matrix, render map in browser
- Use browser Geolocation API to get and show current location when user clicks button on homepage
- Map showing location of alpacas based on GeoJSON - uses mock alpaca data
- Calculate distance of alpaca from my current location - uses mock alpaca data

In progress:

- Create APIs that get data from Elasticsearch

Not done:

- Map showing location of alpacas based on GeoJSON - using data from Elasticsearch
- Calculate distance of alpaca from my current location - using data from Elasticsearch

## Credits 👏

- [Google maps distance matrix API](https://developers.google.com/maps/documentation/distance-matrix?hl=en_GB)
- [Browser Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

## License 📝

The work is under exclusive copyright by default.
