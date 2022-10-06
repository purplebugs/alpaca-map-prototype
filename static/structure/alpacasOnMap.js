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

const readData = async () => {
  const response = await fetch(
    "http://localhost:3000/api/closestAlpacasByRadius"
  );

  /* Example response:
  [
    { lat: 60.391262, lng: 5.322054 },
    { lat: 63.430515, lng: 10.395053 },
  ]; */

  const responseJSON = await response.json();
  return responseJSON;
};

const readAll = async () => {
  const response = await fetch("http://localhost:3000/api/all");

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

    console.log(latitude);
    console.log(longitude);
    if (latitude !== null && latitude !== undefined) {
      if (longitude !== null && longitude !== undefined)
        myOutput.push({
          lat: item?._source?.location?.coordinates[1],
          lng: item?._source?.location?.coordinates[0],
        });
    }
  }

  console.log("myOutput", myOutput);
  return myOutput;
};

// Ref: https://developers.google.com/maps/documentation/javascript/examples/distance-matrix#try-sample
/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

const deleteMarkers = (markersArray) => {
  for (let i = 0; i < markersArray.length; i++) {
    markersArray[i].setMap(null);
  }

  markersArray = [];
};

const initMap = async () => {
  const getPosition = await getGeoPosition();
  console.log(getPosition);

  const getClosestAlpacasByRadius = await readData();
  console.log("/api/closestAlpacasByRadius", getClosestAlpacasByRadius);

  const getAll = await readAll();
  console.log("/api/all", getAll);
  const getLocations = extractLocations(getAll);

  const bounds = new google.maps.LatLngBounds();
  const markersArray = [];
  const map = new google.maps.Map(document.getElementById("map"), {
    center: getPosition,
    zoom: 8,
  });

  // initialize services
  const geocoder = new google.maps.Geocoder();
  const service = new google.maps.DistanceMatrixService();
  // build request
  const origin1 = getPosition;
  const request = {
    origins: [origin1],
    destinations: getLocations, // getClosestAlpacasByRadius,
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false,
  };

  // put request on page
  document.getElementById("request").innerText = JSON.stringify(
    request,
    null,
    2
  );
  // get distance matrix response
  service.getDistanceMatrix(request).then((response) => {
    // put response
    document.getElementById("response").innerText = JSON.stringify(
      response,
      null,
      2
    );

    // show on map
    const originList = response.originAddresses;
    const destinationList = response.destinationAddresses;

    deleteMarkers(markersArray);

    const showGeocodedAddressOnMap = (asDestination) => {
      const handler = ({ results }) => {
        map.fitBounds(bounds.extend(results[0].geometry.location));
        markersArray.push(
          new google.maps.Marker({
            map,
            position: results[0].geometry.location,
            label: asDestination ? "Alpaca" : "My location",
          })
        );
      };
      return handler;
    };

    for (let i = 0; i < originList.length; i++) {
      const results = response.rows[i].elements;

      geocoder
        .geocode({ address: originList[i] })
        .then(showGeocodedAddressOnMap(false));

      for (let j = 0; j < results.length; j++) {
        geocoder
          .geocode({ address: destinationList[j] })
          .then(showGeocodedAddressOnMap(true));
      }
    }
  });
};

window.initMap = initMap;
