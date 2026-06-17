/**
 * @file discplotActions.js
 * @author Jan Wiesmann
 * @version 0.0.1
 * @created 2026-06-05
 *
 * Discplot Actions Module
 *
 * This file implements actions triggered by changes in the discplot (f.e. update input fields etc.).
 *
 *
 * Usage:
 * No public API is exposed by this module. It is used internally by the Discplot component to manage user interactions and update the plot accordingly.
 */

import discplot from "./discplot.js";
import { updateBoostplot } from "../boostplot.js";
import { transfer_matrix } from "../transfer_matrix.js";


// Section Material:
const mirror_checkbox = document.getElementById("mirror_checkbox");
const epsilon_input = document.getElementById("dielectric-input");
const tan_delta_input = document.getElementById("tan-delta-input");


// Section Positioning:
const discNumberString = document.getElementById("discNumberString");
const counter_field = document.getElementById("disc-number-input");
const position_input = document.getElementById("position-input");
const rel_poisition_input = document.getElementById("rel_position-input");
const width_input = document.getElementById("width-input");


discplot.discConfig.on("change:position", (event) => {
    position_input.value = this.selectedDiscs[0].position;
    console.log("eventhit")
    discplot.draw();
})



let compilationStatus = true;
export default compilationStatus;