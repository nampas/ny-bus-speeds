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

const severityColors = [
  0xCC0000,
  0x0A3420,
];

const handlerByParam = {
  r: renderBusRoutes,
  s: renderBusSpeeds
};

function initialize() {
  const theMap = L.map('theMap').setView([40.712, -74.006], 11);

  L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${accessToken}`, {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'your.mapbox.access.token'
  }).addTo(theMap);

  const params = new URLSearchParams(window.location.search);
  const renderHandler = handlerByParam[params.get('mode')];
  if (renderHandler) renderHandler(theMap);
}

function renderBusRoutes(map) {
  L.geoJSON(window.busData, {
    style: function (feature) {
      return {color: routeToColor(feature.properties.route_id)};
    }
  }).bindPopup(function (layer) {
    return layer.feature.properties.route_id;
  }).addTo(map);
}

function renderBusSpeeds(map) {
  L.geoJSON(window.stopSpeeds, {
    pointToLayer: function (feature, latlng) {
      const severity = 1 - (feature.properties.speed / 30)
      const color = interpolateColor(Math.min(severity * 100, 99));
      console.log(`Speed: ${feature.properties.speed}, Sev: ${severity}, Col: ${color}`);
      return L.circleMarker(latlng, {
        radius: 2,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 1,
        fillOpacity: 1
      });
    }
  }).bindPopup(function (layer) {
    const p = layer.feature.properties;
    const routes = p.routes.join(", ");
    return `<div><div>Stop: ${p.stop_id}</div><div>Routes: ${routes}</div><div>Speed: ${p.speed}</div>`;
  }).addTo(map);
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


// Adapted form https://stackoverflow.com/a/5533339
function interpolateColor(amount) {
  let r, g;
  if (amount < 50) {
    // green to yellow
    r = Math.min(255 * (amount / 50));
    g = 255;

  } else {
    // yellow to red
    r = 255;
    g = Math.min(255 * ((50-amount % 50) / 50));
  }
  b = 0;

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b | 0).toString(16).slice(1);
}

window.onload = initialize;
