# ExoAtom Replica

A lightweight, static replica of the ExoAtom data catalogue workflow.

The site follows the file structure described in the ExoAtom paper:

- `exoatom.all.json` is the master index.
- Each dataset has one `<AtomSlug>__<Dataset>.adef.json` definition file.
- Raw ExoMol-format files are stored as `.states`, `.trans`, and `.pf`.
- The web page reads the JSON metadata and renders searchable download cards.

This project intentionally does not scrape NIST or Kurucz online. The processed
`.states`, `.trans`, and `.pf` files are expected to be provided by collaborators,
then added manually together with their metadata definition files.

## Quick Start

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Search for `Mg` to see the included NIST and Kurucz sample datasets. Tick
`All ionization stages?` to include entries such as `Mg_II`.

## Validation

```bash
node --check app.js
node scripts/validate-data.js
```

## Syncing Data Archives

The NIST and Kurucz data files are expected to be supplied outside Git. Species
slugs use underscores, for example `Si_I`, `Mg_II`, and isotope slugs such as
`3He_II`.

If the Kurucz Google Drive file is shared as "Anyone with the link can view",
run:

```bash
python3 scripts/sync-kurucz-drive.py
```

The script downloads the archive, copies any available `.states`, `.trans`, and
`.pf` files into `data/`, then generates matching `*.adef.json` files and
`exoatom.all.json`. Missing file types are allowed and are simply omitted from
the generated metadata. Existing entries for the same dataset are replaced;
entries for other datasets are preserved.

For a local archive or extracted folder:

```bash
python3 scripts/sync-kurucz-drive.py --source /path/to/kurucz-data.zip
python3 scripts/sync-kurucz-drive.py --source /path/to/extracted-folder
```

For the local NIST archive:

```bash
python3 scripts/sync-kurucz-drive.py --dataset NIST --source data/NIST-data.zip
```

## Adding a Dataset

Add the processed files into `data/`:

```text
<AtomSlug>__<Dataset>.states
<AtomSlug>__<Dataset>.trans
<AtomSlug>__<Dataset>.pf
<AtomSlug>__<Dataset>.adef.json
```

Then add the dataset entry to `exoatom.all.json`. The website will pick it up
automatically on refresh.
