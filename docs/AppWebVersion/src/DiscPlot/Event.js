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



discplot.onchange = function(event) {
  // function is called when a change in the settings occurs

    switch (event.type) {
        case "disc_position_change":
            position_input.value = discplot.focusDiscs[0].position;
            
            discplot.draw();
            // updateBoostplot();
            break;
        case "disc_selection_change":
            
            break;
        default:
            throw new Error("event type not recognized: " + event.type);  
    }
};


let compilationStatus = true;
export default compilationStatus;