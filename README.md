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

