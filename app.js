const MASTER_INDEX_URL = "exoatom.all.json";
const DATA_DIR = "data";

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
  resultsList.innerHTML = '<p class="empty">Search for a species such as Mg.</p>';
  speciesInput.focus();
});

async function search() {
  const query = speciesInput.value.trim();

  if (!query) {
    resultsList.innerHTML = '<p class="empty">Enter a species symbol first.</p>';
    return;
  }

  try {
    masterIndex = masterIndex || await fetchJson(MASTER_INDEX_URL);
    const matches = findSpecies(masterIndex.atoms, query, allStagesInput.checked);

    if (matches.length === 0) {
      resultsList.innerHTML = `<p class="empty">No datasets found for ${escapeHtml(query)}.</p>`;
      return;
    }

    resultsList.innerHTML = "";
    for (const atom of matches) {
      for (const isotope of atom.isotopes) {
        const definition = await loadDefinition(isotope);
        resultsList.appendChild(renderDatasetCard(definition));
      }
    }
  } catch (error) {
    resultsList.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
}

function findSpecies(atoms, query, includeAllStages) {
  const normalized = normalize(query);
  return atoms.filter((atom) => {
    const base = atom.formula.split("_")[0];
    const exactFormula = normalize(atom.formula) === normalized;
    const exactName = normalize(atom.name) === normalized;
    const sameElement = normalize(base) === normalized;

    if (includeAllStages) {
      return sameElement || exactName;
    }

    return exactFormula || exactName;
  });
}

async function loadDefinition(isotope) {
  const filename = `${isotope.iso_slug}__${isotope.dataset}.adef.json`;
  return fetchJson(`${DATA_DIR}/${filename}`);
}

function renderDatasetCard(definition) {
  const species = definition.species;
  const dataset = definition.dataset;
  const files = definition.files || {};
  const article = document.createElement("article");
  article.className = "dataset-card";

  const titleName = species.charge === 0 ? species.atom : `${species.atom}_p`;
  article.innerHTML = `
    <h3>${escapeHtml(titleName)}: ${escapeHtml(dataset.name)} Data Set version ${escapeHtml(String(dataset.version))}</h3>
    <div class="dataset-summary">
      <p>${escapeHtml(species.spectroscopic_notation)} | mass = ${escapeHtml(String(species.mass_in_Da))} u</p>
      <p>Max temperature: ${escapeHtml(String(dataset.max_temperature))} K</p>
      <p>${escapeHtml(datasetDescription(dataset.name))}</p>
    </div>
    <div class="file-list"></div>
  `;

  const fileList = article.querySelector(".file-list");
  fileList.appendChild(renderFileCard(files.pf, "pf", definition));
  fileList.appendChild(renderFileCard(files.states, "states", definition));
  fileList.appendChild(renderFileCard(files.definition, "adef", definition));
  fileList.appendChild(renderFileCard(files.trans, "trans", definition));

  return article;
}

function renderFileCard(filename, type, definition) {
  const card = document.createElement("div");
  card.className = "file-card";

  const url = `${DATA_DIR}/${filename}`;
  const lines = fileDescription(type, definition);
  card.innerHTML = `
    <a href="${escapeHtml(url)}" download>${escapeHtml(filename)}</a>
    ${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
  `;

  updateFileSize(url, card.querySelector("a"));
  return card;
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
    const response = await fetch(url);
    if (!response.ok) return;
    const blob = await response.blob();
    anchor.insertAdjacentText("afterend", ` [${formatBytes(blob.size)}]`);
  } catch {
    // Size is helpful but not required for rendering.
  }
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

function normalize(value) {
  return String(value).trim().toLowerCase();
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

