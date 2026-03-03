/**
 * MECH ONTOLOGY - Mechanical Engineering
 */

const mechGraph = {
    // Design Softwares (CAD/CAE)
    "autocad": "cad_software",
    "solidworks": "cad_software",
    "catia": "cad_software",
    "creo": "cad_software",
    "nx cad": "cad_software",
    "ansys": "cae_software",
    "abaqus": "cae_software",
    "comsol": "cae_software",
    "cad_software": "mechanical_design",
    "cae_software": "mechanical_analysis",

    // Core Subjects
    "thermodynamics": "thermal_engineering",
    "heat transfer": "thermal_engineering",
    "fluid mechanics": "thermal_engineering",
    "strength of materials": "structural_engineering",
    "som": "structural_engineering",
    "theory of machines": "mechanical_design",
    "tom": "mechanical_design",
    "machine design": "mechanical_design",
    "engineering mechanics": "mechanical_design",
    "manufacturing processes": "production_engineering",
    "industrial engineering": "production_engineering",

    // Manufacturing Tools
    "cnc programming": "manufacturing_processes",
    "lathe machine": "manufacturing_processes",
    "milling machine": "manufacturing_processes",
    "additive manufacturing": "manufacturing_processes",
    "3d printing": "additive manufacturing",

    // Automotive
    "internal combustion engines": "automotive_engineering",
    "ic engines": "automotive_engineering",
    "ev technology": "automotive_engineering",
    "electric vehicles": "automotive_engineering",
    "vehicle dynamics": "automotive_engineering"
};

const mechSiblings = [
    ["autocad", "solidworks", "catia", "creo", "nx cad"],
    ["ansys", "abaqus", "comsol"],
    ["thermodynamics", "heat transfer", "fluid mechanics"],
    ["cnc programming", "3d printing", "lathe machine", "milling machine"],
    ["strength of materials", "theory of machines", "machine design"]
];

const mechDomains = {
    "autocad": "cad",
    "solidworks": "cad",
    "ansys": "cae",
    "thermodynamics": "thermal",
    "heat transfer": "thermal",
    "som": "structural",
    "strength of materials": "structural",
    "cnc": "manufacturing",
    "manufacturing": "manufacturing",
    "ic engines": "automotive",
    "ev": "automotive"
};

const mechAliases = {
    "solid works": "solidworks",
    "autodesk autocad": "autocad",
    "strength of materials": "som",
    "theory of machines": "tom",
    "heat and mass transfer": "heat transfer",
    "additive manufacturing": "3d printing",
    "electric vehicles": "ev technology"
};

module.exports = {
    mechGraph,
    mechSiblings,
    mechDomains,
    mechAliases
};
