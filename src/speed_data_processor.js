const request = require('request');
const writeFile = require("fs").writeFile;

const SOURCE_URL = "http://api.busturnaround.nyc/api/v1/speed?years=2016&weekend=0&periods=1,2,3&groups=route_id,stop_id&order=speed";
const TARGET_PATH = "./target/speed_by_stop.json";

const fetchData = (callback) => {
  request(SOURCE_URL, function (error, response, body) {
    const code = (response || {}).statusCode;
    if (code === 200) {
      callback(JSON.parse(body));
    } else {
      console.log(error);
      console.log(code);
    }
  });
}

const toGeoJson = (data) => {
  // Bucket by stop id
  const routesByStop = data.reduce((acc, datum) => {
    // Skip stops with no speed info. They're probably
    // the last stop of the route?
    if (datum.speed) {
      const routesAtStop = acc[datum.stop_id] || [];
      routesAtStop.push(datum);
      acc[datum.stop_id] = routesAtStop;
    }

    return acc;
  }, {});

  let maxSpeed = -1;
  let minSpeed = Number.MAX_VALUE;
  return {
    type: "FeatureCollection",
    features: Object.keys(routesByStop).map(stopId => {
      const routesAtStop = routesByStop[stopId];

      // Average the speeds, and keep track of max and min
      const speed = routesAtStop.reduce((acc, route) => {
        const s = route.speed;
        // Do a sanity check on max, buses really aren't ever going above 60
        if (maxSpeed < s && s < 60) maxSpeed = s;
        if (minSpeed > s) minSpeed = s;
        return acc + route.speed;
      }, 0) / routesAtStop.length;

      // All entries in list are same stop, so treat the first
      // one as the source of truth for stop metadata
      const canonical = routesAtStop[0];

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [canonical.stop_lon, canonical.stop_lat]
        },
        properties: {
          speed: speed,
          stop_id: canonical.stop_id,
          routes: routesAtStop.map(r => r.route_id)
        }
      };
    }),
    properties: {
      max_speed: maxSpeed,
      min_speed: minSpeed
    }
  };
}

const writeData = (data) => {
  writeFile(TARGET_PATH, JSON.stringify(data), err => {
    console.log("Wrote geojson. Error: " + err);
  });
}

const execute = () => {
  fetchData(data => {
    const geoJson = toGeoJson(data);
    writeData(geoJson);    
  });
}

execute();
