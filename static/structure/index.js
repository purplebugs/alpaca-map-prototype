const functionReturnsAPromise = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("hello anita");
    }, 1000);
  });
};

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
  const response = await fetch("http://localhost:3000/api/hello");
  const responseJSON = await response.json();
  return responseJSON;
};

const initMap = async () => {
  console.log("inside initMap");

  const getPosition = await getGeoPosition();
  console.log(getPosition);

  const data = await readData();
  console.log(data);

  const aPromise = await functionReturnsAPromise();
  console.log(aPromise);

  const map = new google.maps.Map(document.getElementById("map"), {
    center: getPosition,
    zoom: 8,
  });
};

window.initMap = initMap;
