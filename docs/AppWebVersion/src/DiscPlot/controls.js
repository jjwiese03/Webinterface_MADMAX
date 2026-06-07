/**
 * @file controls.js
 * @author Jan Wiesmann
 * @version 0.0.1
 * @created 2026-06-05
 *
 * Discplot Controls Module
 *
 * This file implements control of the Discplot via the control elements (f.e. input fields, checkboxes).
 *
 *
 * Usage:
 * No public API is exposed by this module. It is used internally by the Discplot component to manage user interactions and update the plot accordingly.
 */

import discplot from "./discplot.js";

/* Mirror Checkbox */
document.getElementById("mirror_checkbox").addEventListener("change", discplot.draw());


/* Positioning Inputs */
document.getElementById("disc-number-input").onchange = function() {
    console.log("disc number input changed")
    const diff =  parseFloat(document.getElementById('disc-number-input').value) - discplot.discs.length;
    if (diff > 0) {
        discplot.add_disc(Math.abs(diff));
    } else {
        discplot.pop_disc(Math.abs(diff));
    }
};

const position_input = document.getElementById("position-input");
const rel_poisition_input = document.getElementById("rel_position-input");  
const width_input = document.getElementById("width-input");

// const diff =  parseFloat(document.getElementById('disc-number-input').value) - discplot.discs.length; if (diff>0) {discplot.add_disc(Math.abs(diff))} else {discplot.pop_disc(Math.abs(diff))};


let compilationStatus = true;
export default compilationStatus;