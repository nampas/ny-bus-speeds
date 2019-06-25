const accessToken = "pk.eyJ1IjoibmFtcGFzIiwiYSI6ImNqeDlzOHl1OTBwamg0M3Q4Y2Y5aTIyNGoifQ.rZgZRQYxhVvWlqp7PZLP2Q";

// https://coolors.co/d1faff-475f69-445b6f-284c35-0a3420
const colors = [
  'D1FAFF',
  '5EB1BF',
  '6a8eae',
  '57a773',
  '157145',
  '284C35',
  '475F69',
  '445B6F',
  '0A3420'
];

function initialize() {
  var theMap = L.map('theMap').setView([40.712, -74.006], 11);

  L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${accessToken}`, {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'your.mapbox.access.token'
  }).addTo(theMap);

  L.geoJSON(window.busData, {
    style: function (feature) {
      return {color: routeToColor(feature.properties.route_id)};
    }
  }).bindPopup(function (layer) {
    return layer.feature.properties.route_id;
  }).addTo(theMap);
}

function routeToColor(route) {
  if (!route) {
    return '#3388ff';
  }

  var routeNum = route.substring(route.match(/^[A-Z]+/)[0].length);
  var hash = routeNum
    .split("")
    .reduce((acc, num) => acc + parseInt(num), 0);
  console.log(hash);
  return '#' + colors[hash % colors.length];
};

window.onload = initialize;
