# alpaca-map 🦙 🗺

Visualising alpacas on a map

## Install app 🐣

```
npm install
```

## First time users only 🪴

Create a .env file in the root of your project containing the google maps API key

```
GOOGLE_MAPS_API_KEY="YOURSECRETKEYGOESHERE"
```

## Start app 🚀

```
npm start
```

## Use app 🎷

- Navigate to [http://localhost:3030/](http://localhost:3030/) - Check console for API messages

- http://localhost:3030/api - Shows message

## Status 🚜

Done:

- Local server up and running
- Calculation of fixed distance using Google maps distance matrix API to console
- Client side calculation of fixed distance using Google maps distance matrix, render map in browser
- Use browser Geolocation API to get and show current location when user clicks button on homepage

Not done:

- Map showing location of alpacas based on GeoJSON
- Calculation distance of alpaca from my current location

## Credits 👏

- [Google maps distance matrix API](https://developers.google.com/maps/documentation/distance-matrix?hl=en_GB)
- [Browser Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

## License 📝

The work is under exclusive copyright by default.
