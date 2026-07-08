#!/usr/bin/env python3
import argparse
import json
import re
import shutil
import sys
import tempfile
import urllib.request
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


DEFAULT_URL = "https://drive.usercontent.google.com/download?id=1zdXifnTArdfQfG_KmD-PY3okJjWzP7BG&export=download&authuser=0"
DATASET = "Kurucz"

ELEMENTS = [
    ("H", "Hydrogen"), ("He", "Helium"), ("Li", "Lithium"), ("Be", "Beryllium"),
    ("B", "Boron"), ("C", "Carbon"), ("N", "Nitrogen"), ("O", "Oxygen"),
    ("F", "Fluorine"), ("Ne", "Neon"), ("Na", "Sodium"), ("Mg", "Magnesium"),
    ("Al", "Aluminium"), ("Si", "Silicon"), ("P", "Phosphorus"), ("S", "Sulfur"),
    ("Cl", "Chlorine"), ("Ar", "Argon"), ("K", "Potassium"), ("Ca", "Calcium"),
    ("Sc", "Scandium"), ("Ti", "Titanium"), ("V", "Vanadium"), ("Cr", "Chromium"),
    ("Mn", "Manganese"), ("Fe", "Iron"), ("Co", "Cobalt"), ("Ni", "Nickel"),
    ("Cu", "Copper"), ("Zn", "Zinc"), ("Ga", "Gallium"), ("Ge", "Germanium"),
    ("As", "Arsenic"), ("Se", "Selenium"), ("Br", "Bromine"), ("Kr", "Krypton"),
    ("Rb", "Rubidium"), ("Sr", "Strontium"), ("Y", "Yttrium"), ("Zr", "Zirconium"),
    ("Nb", "Niobium"), ("Mo", "Molybdenum"), ("Tc", "Technetium"), ("Ru", "Ruthenium"),
    ("Rh", "Rhodium"), ("Pd", "Palladium"), ("Ag", "Silver"), ("Cd", "Cadmium"),
    ("In", "Indium"), ("Sn", "Tin"), ("Sb", "Antimony"), ("Te", "Tellurium"),
    ("I", "Iodine"), ("Xe", "Xenon"), ("Cs", "Caesium"), ("Ba", "Barium"),
    ("La", "Lanthanum"), ("Ce", "Cerium"), ("Pr", "Praseodymium"), ("Nd", "Neodymium"),
    ("Pm", "Promethium"), ("Sm", "Samarium"), ("Eu", "Europium"), ("Gd", "Gadolinium"),
    ("Tb", "Terbium"), ("Dy", "Dysprosium"), ("Ho", "Holmium"), ("Er", "Erbium"),
    ("Tm", "Thulium"), ("Yb", "Ytterbium"), ("Lu", "Lutetium"), ("Hf", "Hafnium"),
    ("Ta", "Tantalum"), ("W", "Tungsten"), ("Re", "Rhenium"), ("Os", "Osmium"),
    ("Ir", "Iridium"), ("Pt", "Platinum"), ("Au", "Gold"), ("Hg", "Mercury"),
    ("Tl", "Thallium"), ("Pb", "Lead"), ("Bi", "Bismuth"), ("Po", "Polonium"),
    ("At", "Astatine"), ("Rn", "Radon"), ("Fr", "Francium"), ("Ra", "Radium"),
    ("Ac", "Actinium"), ("Th", "Thorium"), ("Pa", "Protactinium"), ("U", "Uranium"),
    ("Np", "Neptunium"), ("Pu", "Plutonium"), ("Am", "Americium"), ("Cm", "Curium"),
    ("Bk", "Berkelium"), ("Cf", "Californium"), ("Es", "Einsteinium"), ("Fm", "Fermium"),
    ("Md", "Mendelevium"), ("No", "Nobelium"), ("Lr", "Lawrencium"), ("Rf", "Rutherfordium"),
    ("Db", "Dubnium"), ("Sg", "Seaborgium"), ("Bh", "Bohrium"), ("Hs", "Hassium"),
    ("Mt", "Meitnerium"), ("Ds", "Darmstadtium"), ("Rg", "Roentgenium"), ("Cn", "Copernicium"),
    ("Nh", "Nihonium"), ("Fl", "Flerovium"), ("Mc", "Moscovium"), ("Lv", "Livermorium"),
    ("Ts", "Tennessine"), ("Og", "Oganesson"),
]

ELEMENT_NAMES = dict(ELEMENTS)
ELEMENT_ORDER = {symbol: index for index, (symbol, _) in enumerate(ELEMENTS)}
ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]


def main():
    parser = argparse.ArgumentParser(description="Download Kurucz ExoAtom files and generate metadata.")
    parser.add_argument("--url", default=DEFAULT_URL, help="Google Drive direct download URL.")
    parser.add_argument("--source", help="Use an existing zip file or extracted directory instead of downloading.")
    parser.add_argument("--data-dir", default="data", help="Directory where data files and adef JSON files are written.")
    parser.add_argument("--master", default="exoatom.all.json", help="Master index JSON path.")
    parser.add_argument("--version", default=datetime.now(timezone.utc).strftime("%Y%m%d"), help="Dataset/index version.")
    parser.add_argument("--keep-existing", action="store_true", help="Do not remove existing Kurucz data files first.")
    args = parser.parse_args()

    root = Path.cwd()
    data_dir = root / args.data_dir
    data_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="exoatom-kurucz-") as tmp:
        tmp_dir = Path(tmp)
        source = Path(args.source) if args.source else download(args.url, tmp_dir / "kurucz-download")

        if not args.keep_existing:
            remove_existing_kurucz(data_dir)

        atoms = []
        if source.is_dir():
            groups = discover_files_from_dir(source)
            atoms = process_groups(groups, data_dir, int(args.version), None)
        elif zipfile.is_zipfile(source):
            with zipfile.ZipFile(source) as archive:
                groups = discover_files_from_archive(archive)
                atoms = process_groups(groups, data_dir, int(args.version), archive)
        else:
            raise SystemExit(f"{source} is not a directory or zip archive.")

        if not atoms:
            raise SystemExit("No .states, .trans, or .pf files were found in the source.")

        master = {
            "ExoAtom": {
                "ID": Path(args.master).name,
                "version": str(args.version),
            },
            "atoms": atoms,
        }
        write_json(root / args.master, master)
        print(f"Generated {len(atoms)} Kurucz species in {data_dir}.")


def download(url, destination):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request) as response:
        data = response.read()

    if looks_like_google_signin(data):
        raise SystemExit(
            "Google Drive returned a sign-in page, not the data file. "
            "Set the file sharing to 'Anyone with the link can view' or pass --source to a local zip/directory."
        )

    destination.write_bytes(data)
    return destination


def looks_like_google_signin(data):
    head = data[:200000].decode("utf-8", errors="ignore").lower()
    return "<html" in head and ("sign in" in head or "accounts.google.com" in head)


def discover_files_from_dir(base_dir):
    groups = defaultdict(dict)
    for path in Path(base_dir).rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {".states", ".trans", ".pf"}:
            continue

        slug, kind = parse_source_file(path.name)
        if not slug:
            print(f"Skipping unrecognized filename: {path}", file=sys.stderr)
            continue

        groups[slug][kind] = path
    return groups


def discover_files_from_archive(archive):
    groups = defaultdict(dict)
    for info in archive.infolist():
        if info.is_dir():
            continue

        slug, kind = parse_source_file(Path(info.filename).name)
        if not slug:
            continue

        groups[slug][kind] = info.filename
    return groups


def parse_source_file(filename):
    match = re.match(r"^(?P<slug>.+?)__Kurucz\.(?P<kind>states|trans|pf)$", filename, re.IGNORECASE)
    if not match:
        return None, None

    slug = match.group("slug")
    if not is_valid_species_slug(slug):
        return None, None

    return slug, match.group("kind").lower()


def is_valid_species_slug(slug):
    return re.match(r"^[A-Z][a-z]?(?:-[IVXLCDM]+)?$", slug) is not None


def remove_existing_kurucz(data_dir):
    for path in data_dir.glob("*__Kurucz.*"):
        path.unlink()


def process_groups(groups, data_dir, version, archive):
    atoms = []
    for slug in sorted(groups, key=sort_key):
        files = copy_group_files(slug, groups[slug], data_dir, archive)
        definition = build_definition(slug, files, data_dir, version)
        definition_path = data_dir / f"{slug}__{DATASET}.adef.json"
        definition["files"]["definition"] = definition_path.name
        write_json(definition_path, definition)
        atoms.append(build_master_entry(slug, version))
    return atoms


def copy_group_files(slug, source_files, data_dir, archive):
    copied = {}
    for kind, source in source_files.items():
        target = data_dir / f"{slug}__{DATASET}.{kind}"
        if archive is None:
            shutil.copyfile(source, target)
        else:
            with archive.open(source) as src, target.open("wb") as dst:
                shutil.copyfileobj(src, dst)
        copied[kind] = target.name
    return copied


def build_definition(slug, files, data_dir, version):
    symbol, stage_number, charge = parse_species_slug(slug)
    states_stats = stats_states(data_dir / files["states"]) if "states" in files else {}
    trans_stats = stats_trans(data_dir / files["trans"]) if "trans" in files else {}
    pf_stats = stats_pf(data_dir / files["pf"]) if "pf" in files else {}

    return {
        "species": {
            "atom": symbol,
            "ordinary_formula": ion_formula(symbol, charge),
            "spectroscopic_notation": f"{symbol} {roman(stage_number)}",
            "charge": charge,
            "name": species_name(symbol, charge),
            "mass_in_Da": None,
        },
        "dataset": {
            "name": DATASET,
            "version": version,
            "doi": "",
            "max_temperature": pf_stats.get("max_temperature"),
            "n_L_default": 0.5,
            "num_pressure_broadeners": 0,
            "nxsec_files": 0,
            "nkcoeff_files": 0,
            "dipole_available": False,
            "cooling_function_available": False,
            "specific_heat_available": False,
            "uncertainty_available": True,
            "Ionisation": None,
            "states": {
                "number_of_states": states_stats.get("count", 0),
                "max_energy": states_stats.get("max_energy"),
                "lifetime_available": False,
                "lande_g_available": False,
                "num_quanta": None,
                "states_file_fields": [
                    {"name": "ID", "desc": "Unique integer identifier for the energy level"},
                    {"name": "E", "desc": "State energy in cm^-1"},
                    {"name": "gtot", "desc": "State degeneracy"},
                    {"name": "J", "desc": "Total angular momentum quantum number"},
                ],
            },
            "transitions": {
                "number_of_transitions": trans_stats.get("count", 0),
                "number_of_transition_files": 1 if "trans" in files else 0,
                "max_wavenumber": trans_stats.get("max_wavenumber"),
                "transitions_file_fields": [
                    {"name": "i", "desc": "Upper state ID"},
                    {"name": "f", "desc": "Lower state ID"},
                    {"name": "A", "desc": "Einstein A coefficient in s^-1"},
                    {"name": "Wavenumber", "desc": "Transition wavenumber in cm^-1"},
                ],
            },
            "partition_function": {
                "max_partition_function_temperature": pf_stats.get("max_temperature"),
                "partition_function_step_size": pf_stats.get("step_size"),
                "fields": [
                    {"name": "T", "desc": "Temperature in Kelvin"},
                    {"name": "Q(T)", "desc": "Partition function, dimensionless"},
                ],
            },
        },
        "files": dict(sorted(files.items())),
    }


def build_master_entry(slug, version):
    symbol, stage_number, charge = parse_species_slug(slug)
    return {
        "name": species_name(symbol, charge),
        "formula": slug,
        "num_isotopes": 1,
        "isotopes": [
            {
                "iso_slug": slug,
                "iso_formula": ion_formula(symbol, charge),
                "dataset": DATASET,
                "version": version,
            }
        ],
    }


def stats_states(path):
    count = 0
    max_energy = None
    for columns in iter_columns(path):
        count += 1
        max_energy = max_float(max_energy, columns, 1)
    return {"count": count, "max_energy": max_energy}


def stats_trans(path):
    count = 0
    max_wavenumber = None
    for columns in iter_columns(path):
        count += 1
        max_wavenumber = max_float(max_wavenumber, columns, 3)
    return {"count": count, "max_wavenumber": max_wavenumber}


def stats_pf(path):
    temperatures = []
    for columns in iter_columns(path):
        value = parse_float(columns, 0)
        if value is not None:
            temperatures.append(value)

    step = None
    if len(temperatures) >= 2:
        step = round(temperatures[1] - temperatures[0], 6)
    return {"max_temperature": max(temperatures) if temperatures else None, "step_size": step}


def iter_columns(path):
    with Path(path).open("r", encoding="utf-8", errors="ignore") as handle:
        for line in handle:
            stripped = line.strip()
            if stripped and not stripped.startswith("#"):
                yield stripped.split()


def max_float(current, columns, index):
    value = parse_float(columns, index)
    if value is None:
        return current
    return value if current is None else max(current, value)


def parse_float(columns, index):
    if len(columns) <= index:
        return None
    try:
        return float(columns[index])
    except ValueError:
        return None


def base_symbol(slug):
    return parse_species_slug(slug)[0]


def parse_species_slug(slug):
    match = re.match(r"^(?P<symbol>[A-Z][a-z]?)(?:-(?P<roman>[IVXLCDM]+))?$", slug)
    if not match:
        raise SystemExit(f"Invalid species slug: {slug}")

    symbol = match.group("symbol")
    stage_number = roman_to_int(match.group("roman") or "I")
    charge = stage_number - 1
    return symbol, stage_number, charge


def species_name(symbol, charge):
    name = ELEMENT_NAMES.get(symbol, symbol)
    return f"{name} Ion ({roman(charge + 1)})" if charge else name


def roman(number):
    return ROMAN[number] if number < len(ROMAN) else str(number)


def ion_formula(symbol, charge):
    if charge <= 0:
        return symbol
    if charge == 1:
        return f"{symbol}+"
    return f"{symbol}{charge}+"


def roman_to_int(value):
    numerals = {
        "I": 1,
        "II": 2,
        "III": 3,
        "IV": 4,
        "V": 5,
        "VI": 6,
        "VII": 7,
        "VIII": 8,
        "IX": 9,
        "X": 10,
        "XI": 11,
        "XII": 12,
        "XIII": 13,
        "XIV": 14,
        "XV": 15,
        "XVI": 16,
        "XVII": 17,
        "XVIII": 18,
        "XIX": 19,
        "XX": 20,
    }
    try:
        return numerals[value]
    except KeyError:
        raise SystemExit(f"Unsupported ionization stage: {value}")


def sort_key(slug):
    symbol, stage_number, _ = parse_species_slug(slug)
    return (ELEMENT_ORDER.get(symbol, 999), stage_number, slug)


def write_json(path, data):
    Path(path).write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
