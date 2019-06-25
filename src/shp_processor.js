const shapefile = require("shapefile");
const writeFile = require("fs").writeFile;

const sourcePath = "./Bus_Shapefiles/NYCT Bus Routes";
const targetPath = "./target/bus_geo.json";

const handleResult = (result) => {
  console.log(result);
  writeFile(targetPath, JSON.stringify(result), err => {
    console.log("Wrote geojson. Error: " + err);
  });
};

shapefile.open(sourcePath, sourcePath)
  .then(source => source.read()
    .then(function log(result, acc = []) {
      if (result.done) return handleResult(acc);

      acc.push(result.value);
      return source.read().then(res => log(res, acc));
    }))
  .catch(error => console.error(error.stack));

