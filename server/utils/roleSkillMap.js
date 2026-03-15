/**
 * Static Role → Skill Map for readiness computation.
 * All skills must be lowercase (normalized).
 */

const roleSkillMap = {
    // --- TECH / CS ROLES ---
    frontend: ['react', 'javascript', 'css', 'html', 'typescript'],
    backend: ['node.js', 'express', 'postgresql', 'sql', 'rest api'],
    data_analyst: ['python', 'pandas', 'sql', 'excel', 'tableau'],
    fullstack: ['react', 'javascript', 'node.js', 'express', 'postgresql'],
    devops: ['docker', 'kubernetes', 'linux', 'ci/cd', 'aws'],

    // --- MECHANICAL ROLES ---
    design_engineer: ['autocad', 'solidworks', 'mechanical_design', 'som', 'tom'],
    thermal_engineer: ['thermodynamics', 'heat transfer', 'fluid mechanics', 'ansys'],
    production_engineer: ['manufacturing processes', 'cnc programming', 'industrial engineering', 'cad_software'],
    automotive_engineer: ['ic engines', 'ev technology', 'vehicle dynamics', 'mechanical_design'],

    // --- ECE / EEE ROLES ---
    embedded_engineer: ['embedded c', 'microcontrollers', 'rtos', 'arm cortex', 'embedded_systems'],
    vlsi_designer: ['verilog', 'vhdl', 'fpga', 'innovus', 'vlsi_design'],
    signal_processing: ['dsp', 'matlab', 'digital communication', 'signal_processing'],
    electrical_engineer: ['power systems', 'electrical machines', 'power electronics', 'control systems'],

    // --- CIVIL ROLES ---
    structural_engineer: ['staad pro', 'etabs', 'structural analysis', 'concrete technology', 'surveying'],
    bim_modeler: ['revit', 'autocad', 'bim', 'bim_software', 'construction_management'],
    site_engineer: ['surveying', 'estimation & costing', 'construction_management', 'geotechnical engineering'],
    environmental_engineer: ['environmental engineering', 'water resource engineering', 'hydraulics', 'gis']
};

module.exports = roleSkillMap;
