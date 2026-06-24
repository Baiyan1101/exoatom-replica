# Development Guide

This project is designed for a simple Git-based development workflow in WSL.

## Repository Setup

```bash
mkdir exoatom-replica
cd exoatom-replica
git init
```

If the files are created from Windows, copy or clone them into your WSL working
directory before continuing.

## Run Locally

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

## Data Update Workflow

For each new species or ionization stage:

1. Add `.states`, `.trans`, and `.pf` files into `data/`.
2. Add the matching `.adef.json` file into `data/`.
3. Add or update the species entry in `exoatom.all.json`.
4. Refresh the website and search for the species.
5. Commit the change.

