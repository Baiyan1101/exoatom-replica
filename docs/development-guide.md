# WSL Development Guide

This project is designed for a simple Git-based development workflow in WSL.

## 1. Create the GitHub Repository

Create an empty repository on GitHub first, for example:

```text
exoatom-replica
```

Do not initialize it with a README if you already have this local project.

Alternatively, if GitHub CLI is installed and authenticated in WSL:

```bash
gh repo create exoatom-replica --public --source=. --remote=origin
```

Use `--private` instead of `--public` if the project should not be public.

## 2. Move This Project Into WSL

If the files were generated in Windows under `C:\Users\...`, copy them into a
WSL path such as:

```bash
mkdir -p ~/projects
cp -r /mnt/c/Users/YEKINDAR/Documents/Codex/2026-06-12/files-mentioned-by-the-user-exoatom ~/projects/exoatom-replica
cd ~/projects/exoatom-replica
```

Using a native WSL path is better than developing directly under `/mnt/c`
because file watching, permissions, and Git operations are usually more stable.

## 3. Repository Setup

```bash
git init
git status
```

If this repository already contains the commits created during the prototype,
`git init` is not needed.

## 4. Connect to GitHub

If you created the remote repository manually on GitHub:

```bash
git remote add origin git@github.com:<your-user-name>/exoatom-replica.git
git branch -M main
git push -u origin main
```

If you use HTTPS instead of SSH:

```bash
git remote add origin https://github.com/<your-user-name>/exoatom-replica.git
git branch -M main
git push -u origin main
```

## 5. Run Locally

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

Search for:

```text
Mg
```

Tick `All ionization stages?` to show both `Mg` and `Mg_p`.

## 6. Commit Flow Used in This Prototype

The development history is intentionally split into small commits:

```bash
git log --oneline
```

Expected structure:

```text
Initialize ExoAtom replica project
Add ExoAtom master index and Mg sample datasets
Build static ExoAtom search interface
Document WSL and GitHub workflow
```

This gives you a realistic development narrative for reports or supervision
meetings.

## 7. Data Update Workflow

For each new species or ionization stage:

1. Add `.states`, `.trans`, and `.pf` files into `data/`.
2. Add the matching `.adef.json` file into `data/`.
3. Add or update the species entry in `exoatom.all.json`.
4. Refresh the website and search for the species.
5. Commit the change.

Example for Mg III:

```text
data/Mg_2p__NIST.states
data/Mg_2p__NIST.trans
data/Mg_2p__NIST.pf
data/Mg_2p__NIST.adef.json
```

Then add a matching `Mg_2p` entry to `exoatom.all.json`.

## 8. Validation Commands

Check JavaScript syntax:

```bash
node --check app.js
```

Check that each `exoatom.all.json` entry points to existing files:

```bash
node scripts/validate-data.js
```

