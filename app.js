const MASTER_INDEX_URL = "exoatom.all.json";
const DATA_DIR = "data";
const FILE_PREVIEW_LIMIT = 2 * 1024 * 1024;

const ELEMENTS = [
  ["H", "Hydrogen", 1, 1], ["He", "Helium", 1, 18],
  ["Li", "Lithium", 2, 1], ["Be", "Beryllium", 2, 2], ["B", "Boron", 2, 13], ["C", "Carbon", 2, 14], ["N", "Nitrogen", 2, 15], ["O", "Oxygen", 2, 16], ["F", "Fluorine", 2, 17], ["Ne", "Neon", 2, 18],
  ["Na", "Sodium", 3, 1], ["Mg", "Magnesium", 3, 2], ["Al", "Aluminium", 3, 13], ["Si", "Silicon", 3, 14], ["P", "Phosphorus", 3, 15], ["S", "Sulfur", 3, 16], ["Cl", "Chlorine", 3, 17], ["Ar", "Argon", 3, 18],
  ["K", "Potassium", 4, 1], ["Ca", "Calcium", 4, 2], ["Sc", "Scandium", 4, 3], ["Ti", "Titanium", 4, 4], ["V", "Vanadium", 4, 5], ["Cr", "Chromium", 4, 6], ["Mn", "Manganese", 4, 7], ["Fe", "Iron", 4, 8], ["Co", "Cobalt", 4, 9], ["Ni", "Nickel", 4, 10], ["Cu", "Copper", 4, 11], ["Zn", "Zinc", 4, 12], ["Ga", "Gallium", 4, 13], ["Ge", "Germanium", 4, 14], ["As", "Arsenic", 4, 15], ["Se", "Selenium", 4, 16], ["Br", "Bromine", 4, 17], ["Kr", "Krypton", 4, 18],
  ["Rb", "Rubidium", 5, 1], ["Sr", "Strontium", 5, 2], ["Y", "Yttrium", 5, 3], ["Zr", "Zirconium", 5, 4], ["Nb", "Niobium", 5, 5], ["Mo", "Molybdenum", 5, 6], ["Tc", "Technetium", 5, 7], ["Ru", "Ruthenium", 5, 8], ["Rh", "Rhodium", 5, 9], ["Pd", "Palladium", 5, 10], ["Ag", "Silver", 5, 11], ["Cd", "Cadmium", 5, 12], ["In", "Indium", 5, 13], ["Sn", "Tin", 5, 14], ["Sb", "Antimony", 5, 15], ["Te", "Tellurium", 5, 16], ["I", "Iodine", 5, 17], ["Xe", "Xenon", 5, 18],
  ["Cs", "Caesium", 6, 1], ["Ba", "Barium", 6, 2], ["La", "Lanthanum", 8, 4], ["Ce", "Cerium", 8, 5], ["Pr", "Praseodymium", 8, 6], ["Nd", "Neodymium", 8, 7], ["Pm", "Promethium", 8, 8], ["Sm", "Samarium", 8, 9], ["Eu", "Europium", 8, 10], ["Gd", "Gadolinium", 8, 11], ["Tb", "Terbium", 8, 12], ["Dy", "Dysprosium", 8, 13], ["Ho", "Holmium", 8, 14], ["Er", "Erbium", 8, 15], ["Tm", "Thulium", 8, 16], ["Yb", "Ytterbium", 8, 17], ["Lu", "Lutetium", 8, 18],
  ["Hf", "Hafnium", 6, 4], ["Ta", "Tantalum", 6, 5], ["W", "Tungsten", 6, 6], ["Re", "Rhenium", 6, 7], ["Os", "Osmium", 6, 8], ["Ir", "Iridium", 6, 9], ["Pt", "Platinum", 6, 10], ["Au", "Gold", 6, 11], ["Hg", "Mercury", 6, 12], ["Tl", "Thallium", 6, 13], ["Pb", "Lead", 6, 14], ["Bi", "Bismuth", 6, 15], ["Po", "Polonium", 6, 16], ["At", "Astatine", 6, 17], ["Rn", "Radon", 6, 18],
  ["Fr", "Francium", 7, 1], ["Ra", "Radium", 7, 2], ["Ac", "Actinium", 9, 4], ["Th", "Thorium", 9, 5], ["Pa", "Protactinium", 9, 6], ["U", "Uranium", 9, 7], ["Np", "Neptunium", 9, 8], ["Pu", "Plutonium", 9, 9], ["Am", "Americium", 9, 10], ["Cm", "Curium", 9, 11], ["Bk", "Berkelium", 9, 12], ["Cf", "Californium", 9, 13], ["Es", "Einsteinium", 9, 14], ["Fm", "Fermium", 9, 15], ["Md", "Mendelevium", 9, 16], ["No", "Nobelium", 9, 17], ["Lr", "Lawrencium", 9, 18],
  ["Rf", "Rutherfordium", 7, 4], ["Db", "Dubnium", 7, 5], ["Sg", "Seaborgium", 7, 6], ["Bh", "Bohrium", 7, 7], ["Hs", "Hassium", 7, 8], ["Mt", "Meitnerium", 7, 9], ["Ds", "Darmstadtium", 7, 10], ["Rg", "Roentgenium", 7, 11], ["Cn", "Copernicium", 7, 12], ["Nh", "Nihonium", 7, 13], ["Fl", "Flerovium", 7, 14], ["Mc", "Moscovium", 7, 15], ["Lv", "Livermorium", 7, 16], ["Ts", "Tennessine", 7, 17], ["Og", "Oganesson", 7, 18]
];

const form = document.querySelector("#search-form");
const speciesInput = document.querySelector("#species-input");
const allStagesInput = document.querySelector("#all-stages-input");
const clearButton = document.querySelector("#clear-button");
const resultsList = document.querySelector("#results-list");

let masterIndex = null;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await search();
});

clearButton.addEventListener("click", () => {
  speciesInput.value = "";
  allStagesInput.checked = false;
  history.pushState({}, "", location.pathname);
  showHome();
  speciesInput.focus();
});

window.addEventListener("popstate", () => {
  routeFromUrl();
});

routeFromUrl();

async function routeFromUrl() {
  const params = new URLSearchParams(location.search);
  const fileUrl = params.get("file");
  const finalSpecies = params.get("qf");
  const isotopeSlug = params.get("iso");
  const speciesQuery = params.get("q");

  if (fileUrl) {
    await showFileViewer(fileUrl, params.get("label") || fileUrl.split("/").pop());
    return;
  }

  if (finalSpecies) {
    await showDatasets(finalSpecies, isotopeSlug);
    return;
  }

  if (speciesQuery) {
    await showSpeciesChoices(speciesQuery, true);
    return;
  }

  await showHome();
}

async function search() {
  const query = speciesInput.value.trim();

  if (!query) {
    renderMessage("Enter a species symbol first.");
    return;
  }

  const params = new URLSearchParams({ q: query });
  history.pushState({}, "", `${location.pathname}?${params}`);
  await showSpeciesChoices(query, allStagesInput.checked);
}

async function showHome() {
  try {
    const index = await getMasterIndex();
    renderPeriodicTable(index.atoms || []);
  } catch (error) {
    renderError(error.message);
  }
}

async function showSpeciesChoices(query, includeAllStages) {
  try {
    const index = await getMasterIndex();
    const matches = findSpecies(index.atoms || [], query, includeAllStages);

    if (matches.length === 0) {
      renderMessage(`No species found for ${query}.`);
      return;
    }

    speciesInput.value = query;
    renderSpeciesChoices(matches);
  } catch (error) {
    renderError(error.message);
  }
}

async function showDatasets(speciesSlug, isotopeSlug = "") {
  try {
    const index = await getMasterIndex();
    const atom = findAtomBySlug(index.atoms || [], speciesSlug);
    const normalizedIsotopeSlug = normalizeFormulaSlug(isotopeSlug);
    const canonicalSpeciesSlug = canonicalFormulaSlug(speciesSlug);
    const canonicalIsotopeSlug = isotopeSlug ? canonicalFormulaSlug(isotopeSlug) : "";

    if (!atom) {
      renderMessage(`No datasets found for ${speciesSlug}.`);
      return;
    }

    if (speciesSlug !== canonicalSpeciesSlug || isotopeSlug !== canonicalIsotopeSlug) {
      const params = new URLSearchParams({ qf: canonicalFormulaSlug(atom.formula) });
      if (canonicalIsotopeSlug) {
        params.set("iso", canonicalIsotopeSlug);
      }
      history.replaceState({}, "", `${location.pathname}?${params}`);
    }

    speciesInput.value = atom.formula;
    resultsList.innerHTML = `<h2>${escapeHtml(speciesTitle(atom))}</h2>`;
    const isotopes = isotopeSlug
      ? (atom.isotopes || []).filter((isotope) => normalizeFormulaSlug(isotope.iso_slug) === normalizedIsotopeSlug)
      : atom.isotopes || [];

    if (isotopeSlug && isotopes.length === 0) {
      renderMessage(`No datasets found for ${isotopeSlug}.`);
      return;
    }

    for (const isotope of isotopes) {
      const definition = await loadDefinition(isotope);
      resultsList.appendChild(renderDatasetCard(definition));
    }
  } catch (error) {
    renderError(error.message);
  }
}

function renderPeriodicTable(atoms) {
  const available = new Set(atoms.map((atom) => baseElement(atom.formula)));
  const section = document.createElement("section");
  section.className = "periodic-section";
  section.innerHTML = "<h2>Select an element:</h2>";

  const table = document.createElement("div");
  table.className = "periodic-table";

  for (const [symbol, name, row, column] of ELEMENTS) {
    const button = document.createElement("button");
    button.className = "element-tile";
    button.type = "button";
    button.style.gridRow = String(row);
    button.style.gridColumn = String(column);
    button.title = name;
    button.innerHTML = `<span>${escapeHtml(symbol)}</span><small>${escapeHtml(name)}</small>`;

    if (available.has(symbol)) {
      button.addEventListener("click", () => navigateToSpecies(symbol));
    } else {
      button.disabled = true;
      button.setAttribute("aria-label", `${name} is not available`);
    }

    table.appendChild(button);
  }

  section.appendChild(table);
  resultsList.replaceChildren(section);
}

function renderSpeciesChoices(atoms) {
  const section = document.createElement("section");
  section.className = "species-section";
  section.innerHTML = "<h2>Select a species:</h2>";

  const grid = document.createElement("div");
  grid.className = "species-grid";

  for (const choice of speciesChoiceItems(atoms)) {
    const labels = speciesChoiceLabels(choice);
    const button = document.createElement("button");
    button.className = "species-card";
    button.type = "button";
    button.innerHTML = `
      <span>${labels.primary}</span>
      <small>(${labels.secondary})</small>
    `;
    button.addEventListener("click", () => navigateToDatasets(choice.atom.formula, choice.isoSlug));
    grid.appendChild(button);
  }

  section.appendChild(grid);
  resultsList.replaceChildren(section);
}

function renderDatasetCard(definition) {
  const species = definition.species;
  const dataset = definition.dataset;
  const files = definition.files || {};
  const article = document.createElement("article");
  article.className = "dataset-card";

  article.innerHTML = `
    <h3>${escapeHtml(species.spectroscopic_notation)}: ${escapeHtml(dataset.name)} Data Set version ${escapeHtml(String(dataset.version))}</h3>
    <div class="dataset-summary">
      <p>${escapeHtml(speciesSummary(species))}</p>
      <p>${escapeHtml(maxTemperatureSummary(dataset))}</p>
      <p>${escapeHtml(datasetDescription(dataset.name))}</p>
    </div>
    <div class="file-list"></div>
  `;

  const fileList = article.querySelector(".file-list");
  for (const type of ["pf", "states", "definition", "trans"]) {
    if (files[type]) {
      fileList.appendChild(renderFileCard(files[type], type === "definition" ? "adef" : type, definition));
    }
  }

  if (!fileList.children.length) {
    fileList.innerHTML = '<p class="empty">No local data files are available for this dataset.</p>';
  }

  return article;
}

function renderFileCard(filename, type, definition) {
  const card = document.createElement("div");
  card.className = "file-card";

  const file = resolveFile(filename);
  const lines = fileDescription(type, definition);
  card.innerHTML = `
    <a href="${escapeHtml(file.viewerUrl)}">${escapeHtml(file.name)}</a>
    ${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
  `;

  card.querySelector("a").addEventListener("click", (event) => {
    event.preventDefault();
    history.pushState({}, "", file.viewerUrl);
    showFileViewer(file.url, file.name);
  });

  updateFileSize(file.url, card.querySelector("a"));
  return card;
}

async function showFileViewer(fileUrl, label) {
  if (!isSafeDataUrl(fileUrl)) {
    renderError(`Cannot show ${fileUrl}. Only local data files can be previewed.`);
    return;
  }

  resultsList.innerHTML = `
    <section class="raw-file-view">
      <div class="raw-file-toolbar">
        <button class="secondary" type="button">Back</button>
        <span>${escapeHtml(label)}</span>
      </div>
      <pre>Loading ${escapeHtml(label)}...</pre>
    </section>
  `;

  resultsList.querySelector("button").addEventListener("click", () => history.back());

  try {
    const { text, truncated, size } = await fetchFilePreview(fileUrl);
    resultsList.querySelector("pre").textContent = truncated
      ? `${text}\n\n[Preview truncated at ${formatBytes(FILE_PREVIEW_LIMIT)} of ${formatBytes(size)}.]`
      : text;
  } catch (error) {
    resultsList.querySelector("pre").textContent = error.message;
  }
}

function findSpecies(atoms, query, includeAllStages) {
  const normalized = normalizeQuery(query);
  const normalizedSymbol = normalizeSymbol(query);
  const normalizedSpectroscopic = normalizeSpectroscopic(query);

  return atoms.filter((atom) => {
    const base = normalizeSymbol(baseElement(atom.formula));
    const exactFormula = normalizeFormulaSlug(atom.formula) === normalizeFormulaSlug(query) || normalizeSpectroscopic(displayFormula(atom.formula)) === normalizedSpectroscopic;
    const exactName = normalizeQuery(atom.name) === normalized;
    const sameElement = base === normalizedSymbol;
    const neutralElement = sameElement && ionStage(atom.formula) === "I";

    if (includeAllStages) {
      return sameElement || exactName || exactFormula;
    }

    return neutralElement || exactFormula || exactName;
  });
}

function findAtomBySlug(atoms, speciesSlugValue) {
  const normalized = normalizeFormulaSlug(speciesSlugValue);
  return atoms.find((atom) => normalizeFormulaSlug(atom.formula) === normalized || normalizeSpectroscopic(displayFormula(atom.formula)) === normalizeSpectroscopic(speciesSlugValue));
}

function navigateToSpecies(symbol) {
  const params = new URLSearchParams({ q: symbol });
  history.pushState({}, "", `${location.pathname}?${params}`);
  showSpeciesChoices(symbol, true);
}

function navigateToDatasets(formula, isotopeSlug = "") {
  const params = new URLSearchParams({ qf: canonicalFormulaSlug(formula) });
  if (isotopeSlug) {
    params.set("iso", canonicalFormulaSlug(isotopeSlug));
  }
  history.pushState({}, "", `${location.pathname}?${params}`);
  showDatasets(formula, isotopeSlug);
}

async function loadDefinition(isotope) {
  const filename = `${canonicalFormulaSlug(isotope.iso_slug)}__${isotope.dataset}.adef.json`;
  return fetchJson(`${DATA_DIR}/${filename}`);
}

async function getMasterIndex() {
  masterIndex = masterIndex || await fetchJson(MASTER_INDEX_URL);
  return masterIndex;
}

function fileDescription(type, definition) {
  const species = definition.species;
  const dataset = definition.dataset;
  const label = species.charge === 0 ? species.atom : species.ordinary_formula;

  if (type === "pf") {
    return [
      `Partition function for ${label} from the ${dataset.name} dataset.`,
      `Max temperature: ${dataset.partition_function.max_partition_function_temperature} K`
    ];
  }

  if (type === "states") {
    return [
      `Energy levels for ${label} from the ${dataset.name} dataset.`,
      `Number of states: ${dataset.states.number_of_states}`,
      `Max energy: ${dataset.states.max_energy} cm-1`
    ];
  }

  if (type === "trans") {
    return [
      `Transitions for ${label} from the ${dataset.name} dataset.`,
      `Number of transitions: ${dataset.transitions.number_of_transitions}`,
      `Max wavenumber: ${dataset.transitions.max_wavenumber} cm-1`
    ];
  }

  return [`Metadata definition file for ${label} from the ${dataset.name} dataset.`];
}

async function updateFileSize(url, anchor) {
  try {
    const size = await getFileSize(url);
    if (Number.isFinite(size) && size > 0) {
      anchor.insertAdjacentText("afterend", ` [${formatBytes(size)}]`);
    }
  } catch {
    // Size is helpful but not required for rendering.
  }
}

async function fetchFilePreview(url) {
  const size = await getFileSize(url);
  const isLarge = Number.isFinite(size) && size > FILE_PREVIEW_LIMIT;
  const headers = isLarge ? { Range: `bytes=0-${FILE_PREVIEW_LIMIT - 1}` } : {};
  const response = await fetch(url, { headers });

  if (!response.ok && response.status !== 206) {
    throw new Error(`Could not load ${url}.`);
  }

  if (isLarge && response.status !== 206) {
    return {
      text: "This file is too large to preview safely, and the server did not return a byte range.",
      truncated: false,
      size
    };
  }

  const buffer = await response.arrayBuffer();
  return {
    text: new TextDecoder("utf-8").decode(buffer),
    truncated: isLarge,
    size: Number.isFinite(size) ? size : buffer.byteLength
  };
}

async function getFileSize(url) {
  const response = await fetch(url, { method: "HEAD" });
  if (!response.ok) return NaN;
  return Number(response.headers.get("content-length"));
}

function datasetDescription(datasetName) {
  if (datasetName.toLowerCase() === "nist") {
    return "This data collection is critically evaluated and recommended for accuracy.";
  }

  if (datasetName.toLowerCase() === "kurucz") {
    return "This data collection is designed for completeness.";
  }

  return "This data collection is provided in ExoMol atomic format.";
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${url}. Run a local web server and check that the file exists.`);
  }

  return response.json();
}

function renderMessage(message) {
  resultsList.innerHTML = `<p class="empty">${escapeHtml(message)}</p>`;
}

function renderError(message) {
  resultsList.innerHTML = `<p class="error">${escapeHtml(message)}</p>`;
}

function resolveFile(fileRef) {
  const name = typeof fileRef === "string" ? fileRef : fileRef.path || fileRef.name;
  const url = typeof fileRef === "object" && fileRef.url ? fileRef.url : `${DATA_DIR}/${name}`;
  const params = new URLSearchParams({ file: url, label: name });
  return {
    name,
    url,
    viewerUrl: `${location.pathname}?${params}`
  };
}

function isSafeDataUrl(url) {
  return !url.includes("://") && !url.startsWith("//") && url.startsWith(`${DATA_DIR}/`);
}

function baseElement(formula) {
  return String(formula).split(/[-_+]/)[0];
}

function displayFormula(formula) {
  return String(formula).replace(/[-_]+/g, " ");
}

function speciesTitle(atom) {
  return `${displayFormula(atom.formula)} Datasets`;
}

function speciesChoiceItems(atoms) {
  const choices = [];

  for (const atom of atoms) {
    const isotopeChoices = uniqueIsotopeChoices(atom);
    if (isotopeChoices.length <= 1) {
      choices.push({
        atom,
        isoFormula: isotopeChoices[0] ? isotopeChoices[0].iso_formula : "",
        isoSlug: ""
      });
      continue;
    }

    for (const isotope of isotopeChoices) {
      choices.push({
        atom,
        isoFormula: isotope.iso_formula,
        isoSlug: isotope.iso_slug
      });
    }
  }

  return choices;
}

function uniqueIsotopeChoices(atom) {
  const choices = new Map();
  for (const isotope of atom.isotopes || []) {
    const formula = isotope.iso_formula || "";
    if (formula && !choices.has(formula)) {
      choices.set(formula, isotope);
    }
  }

  return Array.from(choices.values());
}

function speciesChoiceLabels(choice) {
  const primaryFormula = choice.isoFormula || firstIsoFormula(choice.atom) || ionFormulaFromSlug(choice.atom.formula);
  const secondaryFormula = isotopeBaseFormula(primaryFormula);

  return {
    primary: formulaHtml(primaryFormula),
    secondary: `${formulaHtml(secondaryFormula)} ${escapeHtml(ionStage(choice.atom.formula))}`
  };
}

function firstIsoFormula(atom) {
  const isotope = (atom.isotopes || []).find((item) => item.iso_formula);
  return isotope ? isotope.iso_formula : "";
}

function ionFormulaFromSlug(formula) {
  const symbol = baseElement(formula);
  const charge = ionStageNumber(formula) - 1;

  if (charge <= 0) return symbol;
  if (charge === 1) return `${symbol}+`;
  return `${symbol}${charge}+`;
}

function isotopeBaseFormula(formula) {
  return String(formula).replace(/(?:\d+)?\+$/, "");
}

function formulaHtml(formula) {
  const match = String(formula).match(/^(\d+)?([A-Z][a-z]?)(?:(\d+)?\+)?$/);
  if (!match) {
    return escapeHtml(formula);
  }

  const [, mass, symbol, charge] = match;
  const massHtml = mass ? `<sup>${escapeHtml(mass)}</sup>` : "";
  const chargeHtml = formula.endsWith("+") ? `<sup>${escapeHtml(charge || "")}+</sup>` : "";
  return `${massHtml}${escapeHtml(symbol)}${chargeHtml}`;
}

function speciesSummary(species) {
  if (species.mass_in_Da === null || species.mass_in_Da === undefined || species.mass_in_Da === "") {
    return species.spectroscopic_notation;
  }

  return `${species.spectroscopic_notation} | mass = ${species.mass_in_Da} u`;
}

function maxTemperatureSummary(dataset) {
  if (dataset.max_temperature === null || dataset.max_temperature === undefined || dataset.max_temperature === "") {
    return "Max temperature: unavailable";
  }

  return `Max temperature: ${dataset.max_temperature} K`;
}

function spectroscopicLabel(formula) {
  return `${baseElement(formula)} ${ionStage(formula)}`;
}

function ionStage(formula) {
  const match = String(formula).match(/[-_]([IVXLCDM]+)$/);
  return match ? match[1] : "I";
}

function ionStageNumber(formula) {
  return romanToInt(ionStage(formula)) || 1;
}

function normalizeQuery(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, "").replace(/[-_]+/g, "");
}

function normalizeFormulaSlug(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, "_").replace(/-+/g, "_");
}

function canonicalFormulaSlug(value) {
  return String(value).trim().replace(/\s+/g, "_").replace(/-+/g, "_");
}

function normalizeSymbol(value) {
  return String(value).trim().toLowerCase();
}

function normalizeSpectroscopic(value) {
  return String(value).trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

function romanToInt(value) {
  const numerals = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
  ];
  let index = 0;
  let total = 0;
  const roman = String(value).toUpperCase();

  for (const [amount, numeral] of numerals) {
    while (roman.slice(index, index + numeral.length) === numeral) {
      total += amount;
      index += numeral.length;
    }
  }

  return index === roman.length ? total : 0;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
