const cache = new Map();

const getGeoPosition = () => {
  return new Promise((resolve, reject) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API
    // Wrap navigator.geolocation browser API in a promise because it returns asynchronously
    // however was written before Promises, therefore it does not return a Promise
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

const readAll = async () => {
  const response = await fetch("http://localhost:3000/api/all?size=5000");

  /* Example response, snip:
    "location":{"kommunenavn":"NESBYEN","coordinates":[9.19248180144522,60.48698436178697],
  */

  const responseJSON = await response.json();
  return responseJSON;
};

const extractLocations = (listOfAlpacas) => {
  const myOutput = [];
  for (const item of listOfAlpacas) {
    // Transform from [9.19248180144522,60.48698436178697] to { lat: 60.391262, lng: 5.322054 }
    const lat = item?._source?.location?.coordinates[1];
    const lng = item?._source?.location?.coordinates[0];

    if (lat !== null && lat !== undefined) {
      if (lng !== null && lng !== undefined) {
        const key = `${lat}:${lng}`;
        const obj = {
          lat,
          lng,
        };

        if (cache.has(key)) {
          console.log(`[LOG] Using location from cache: ${key}`);
        } else {
          myOutput.push(obj);
          cache.set(key, obj);
          console.log(`[LOG] Location added to cache: ${key}`);
        }
      }
    }
  }

  console.log("[LOG] myOutput", myOutput);
  return myOutput;
};

const deleteMarkers = (markersArray) => {
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }

  markersArray = [];
};

const initMap = async () => {
  const getPosition = await getGeoPosition();
  const getAll = await readAll();
  const getLocations = extractLocations(getAll);
  const bounds = new google.maps.LatLngBounds();
  const markersArray = [];

  // Create an info window to share between markers.
  const infoWindow = new google.maps.InfoWindow();

  // Draw my position on map
  const map = new google.maps.Map(document.getElementById("map"), {
    center: getPosition,
    zoom: 8,
  });

  map.fitBounds(bounds.extend(getPosition));
  markersArray.push(
    new google.maps.Marker({
      map,
      position: getPosition,
      label: "My location",
    })
  );

  // Draw alpacas on map
  getLocations.forEach((location, i) => {
    map.fitBounds(bounds.extend(location));

    // Make markers accessible https://developers.google.com/maps/documentation/javascript/markers#accessible
    const marker = new google.maps.Marker({
      map,
      position: location,
      title: `${i + 1}. TODO add accessible readable info like Farm name`,
      label: `${i + 1}. Alpaca`,
      optimized: false,
    });

    // Add a click listener for each marker, and set up the info window.
    marker.addListener("click", () => {
      infoWindow.close();
      infoWindow.setContent(marker.getTitle());
      infoWindow.open(marker.getMap(), marker);
    });

    markersArray.push(marker);
  });
};

window.initMap = initMap;
