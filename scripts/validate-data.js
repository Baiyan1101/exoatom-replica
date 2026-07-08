const fs = require("fs");
const path = require("path");

const masterPath = "exoatom.all.json";
const dataDir = "data";

const master = JSON.parse(fs.readFileSync(masterPath, "utf8"));
const missing = [];

for (const atom of master.atoms || []) {
  for (const isotope of atom.isotopes || []) {
    const definitionName = `${isotope.iso_slug}__${isotope.dataset}.adef.json`;
    const definitionPath = path.join(dataDir, definitionName);

    if (!fs.existsSync(definitionPath)) {
      missing.push(definitionPath);
      continue;
    }

    const definition = JSON.parse(fs.readFileSync(definitionPath, "utf8"));
    for (const filename of Object.values(definition.files || {})) {
      const filePath = path.join(dataDir, filename);
      if (!fs.existsSync(filePath)) {
        missing.push(filePath);
      }
    }
  }
}

if (missing.length > 0) {
  console.error("Missing referenced files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("All ExoAtom metadata references are valid.");

