/**
 * ECE/EEE ONTOLOGY - Electronics & Electrical Engineering
 */

const eceGraph = {
    // Embedded Systems
    "embedded c": "embedded_programming",
    "embedded_programming": "embedded_systems",
    "microcontrollers": "embedded_systems",
    "8051": "microcontrollers",
    "arm cortex": "microcontrollers",
    "arduino": "microcontrollers",
    "raspberry pi": "microcontrollers",
    "esp32": "microcontrollers",
    "rtos": "embedded_systems",
    "free_rtos": "rtos",

    // VLSI Design
    "verilog": "hdl",
    "vhdl": "hdl",
    "hdl": "vlsi_design",
    "fpga": "vlsi_design",
    "asic design": "vlsi_design",
    "cadence virtuoso": "vlsi_tools",
    "vivado": "vlsi_tools",
    "vlsi_tools": "vlsi_design",

    // Communication & Signal Processing
    "digital signal processing": "dsp",
    "dsp": "electronics_domain",
    "analog communication": "communication_systems",
    "digital communication": "communication_systems",
    "communication_systems": "electronics_domain",
    "wireless communication": "communication_systems",
    "5g": "wireless communication",
    "iot": "electronics_domain",

    // Electrical Engineering
    "power systems": "electrical_domain",
    "electrical machines": "electrical_domain",
    "power electronics": "electrical_domain",
    "control systems": "electrical_domain",
    "renewable energy": "electrical_domain",
    "solar energy": "renewable energy",
    "energy management": "electrical_domain",

    // Simulation & Software for ECE/EEE
    "matlab": "simulation_software",
    "simulink": "matlab",
    "pspice": "simulation_software",
    "multisim": "simulation_software",
    "simulation_software": "electronics_design"
};

const eceSiblings = [
    ["8051", "arm cortex", "esp32", "arduino", "raspberry pi"],
    ["verilog", "vhdl"],
    ["matlab", "simulink", "pspice", "multisim"],
    ["analog communication", "digital communication", "wireless communication"],
    ["power systems", "power electronics", "electrical machines"]
];

const eceDomains = {
    "arduino": "embedded",
    "esp32": "embedded",
    "verilog": "vlsi",
    "vhdl": "vlsi",
    "matlab": "simulation",
    "dsp": "signal_processing",
    "iot": "electronics",
    "power systems": "electrical",
    "renewable energy": "electrical"
};

const eceAliases = {
    "vls": "vlsi",
    "mat lab": "matlab",
    "digital signal processing": "dsp",
    "internet of things": "iot",
    "esp-32": "esp32",
    "micro-controllers": "microcontrollers",
    "rtos (real time operating systems)": "rtos"
};

module.exports = {
    eceGraph,
    eceSiblings,
    eceDomains,
    eceAliases
};
