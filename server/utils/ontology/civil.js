/**
 * CIVIL ONTOLOGY - Civil Engineering
 */

const civilGraph = {
    // Design & Modeling Softwares (BIM/CAD)
    "autocad": "cad_software",
    "revit": "bim_software",
    "staad pro": "structural_analysis_software",
    "etabs": "structural_analysis_software",
    "sap2000": "structural_analysis_software",
    "bim": "construction_management",
    "bim_software": "bim",

    // Core Subjects & Domains
    "structural analysis": "structural_engineering",
    "concrete technology": "structural_engineering",
    "rcc design": "structural_engineering",
    "steel structures": "structural_engineering",
    "geotechnical engineering": "civil_domain",
    "soil mechanics": "geotechnical_engineering",
    "fluid mechanics": "hydraulics",
    "hydraulics": "civil_domain",
    "environmental engineering": "civil_domain",
    "water resource engineering": "environmental_engineering",
    "transportation engineering": "civil_domain",
    "surveying": "civil_domain",
    "gis": "surveying",
    "gps": "surveying",

    // Construction Management
    "project planning": "construction_management",
    "estimation & costing": "construction_management",
    "ms project": "project_planning",
    "primavera": "project_planning",
    "p6": "primavera"
};

const civilSiblings = [
    ["revit", "staad pro", "etabs", "sap2000"],
    ["structural analysis", "concrete technology", "rcc design", "steel structures"],
    ["soil mechanics", "geotechnical engineering"],
    ["surveying", "gis", "gps"],
    ["ms project", "primavera"]
];

const civilDomains = {
    "autocad": "cad",
    "revit": "bim",
    "staad pro": "structural",
    "surveying": "surveying",
    "gis": "surveying",
    "p6": "management",
    "primavera": "management",
    "concrete": "structural"
};

const civilAliases = {
    "staadpro": "staad pro",
    "staad-pro": "staad pro",
    "microsoft project": "ms project",
    "gis (geographic information systems)": "gis",
    "structural design": "structural analysis",
    "building information modeling": "bim"
};

module.exports = {
    civilGraph,
    civilSiblings,
    civilDomains,
    civilAliases
};
