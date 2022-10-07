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
  const response = await fetch("http://localhost:3000/api/all?size=150");

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
    const latitude = item?._source?.location?.coordinates[1];
    const longitude = item?._source?.location?.coordinates[0];

    if (latitude !== null && latitude !== undefined) {
      if (longitude !== null && longitude !== undefined) {
        const key = `${latitude}:${longitude}`;
        const obj = {
          lat: item?._source?.location?.coordinates[1],
          lng: item?._source?.location?.coordinates[0],
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
  getLocations.forEach((location) => {
    map.fitBounds(bounds.extend(location));
    markersArray.push(
      new google.maps.Marker({
        map,
        position: location,
        label: "Alpaca",
      })
    );
  });
};

window.initMap = initMap;
