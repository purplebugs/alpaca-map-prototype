const alpacaFarms = new Map();

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
  console.log("responseJSON", responseJSON);
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
        // Add farm and first alpaca from farm
        const obj = {
          lat,
          lng,
          name: item?._source?.name,
          street: item?._source?.street,
          city: item?._source?.city,
          zip: item?._source?.zip,
          alpacas: [
            {
              alpacaShortName: item?._source?.alpacaShortName,
              gender: item?._source?.gender,
            },
          ],
        };

        if (alpacaFarms.has(key)) {
          console.log(`[LOG] Using location from alpacaFarms: ${key}`);
          // Do not add new farm, add next alpaca from farm
          const currentFarm = alpacaFarms.get(key);
          currentFarm.alpacas.push({
            alpacaShortName: item?._source?.alpacaShortName,
            gender: item?._source?.gender,
          });
          alpacaFarms.set(key, currentFarm);
        } else {
          // Add new farm with first alpaca found
          myOutput.push(obj);
          alpacaFarms.set(key, obj);
          console.log(`[LOG] Location added to alpacaFarms: ${key}`);
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
  getLocations.forEach((farm, i) => {
    map.fitBounds(bounds.extend(farm));

    // Make markers accessible https://developers.google.com/maps/documentation/javascript/markers#accessible
    const marker = new google.maps.Marker({
      map,
      position: farm,
      title: `${i + 1}. ${farm.street} ${farm.city} ${farm.zip}`,
      label: `${i + 1}. ${farm.name}`,
      optimized: false,
    });

    // Add a click listener for each marker, and set up the info window.
    marker.addListener("click", () => {
      console.log("farm", farm);
      infoWindow.close();
      infoWindow.setContent(marker.getTitle());
      infoWindow.open(marker.getMap(), marker);
      const sidebar = document.getElementById("sidebar");
      sidebar.innerHTML = `${i + 1} There are ${
        farm.alpacas.length
      } alpacas on this farm`;
    });

    markersArray.push(marker);
  });
};

window.initMap = initMap;
