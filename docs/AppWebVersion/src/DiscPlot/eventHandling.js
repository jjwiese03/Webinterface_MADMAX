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
import updateBoostplot from "../boostplot.js";
import { transfer_matrix } from "../transfer_matrix.js";


// Section Material:
const mirror_checkbox = document.getElementById("mirror_checkbox");
const epsilon_input = document.getElementById("eps");
const tan_delta_input = document.getElementById("tand");


// Section Positioning:
const discNumberString = document.getElementById("discNumberString");
const counter_field = document.getElementById("disc-number-input");
const position_input = document.getElementById("position-input");
const rel_poisition_input = document.getElementById("rel-position-input");
const width_input = document.getElementById("width-input");


discplot.discConfig.on("disc:position", function ()  {
    const selection = this.selectedDiscs
    position_input.value = (selection.length > 0) ? selection[0].position : "-";
    rel_poisition_input.value = (selection.length > 0 && selection[0].before != null) ? selection[0].position - selection[0].before.rightEdge : "-";
    
    updateBoostplot(this);
    discplot.draw();
})


discplot.discConfig.on("disc:selected", function (selection) {
    if (selection.length > 0) {
        position_input.value = selection[0].position;
        rel_poisition_input.value = (selection[0].before != null) ? selection[0].position - selection[0].before.rightEdge : selection[0].position;
        width_input.value = selection[0].width

        discNumberString.innerHTML = (selection.length == 1) ? "selected disc: " + String(selection[0].index + 1) : "selected disc" + String(selection[0].index + 1) + " - " + String(selection[selection.length-1].index + 1)
    }
    else {
        position_input.value = "-";
        rel_poisition_input.value = "-";
        width_input.value = "-";
        discNumberString.innerHTML = "no disc selected"
    }

    discplot.draw();
})

discplot.discConfig.on(["disc:removed", "disc:added"], function () {
    counter_field.value = String(this.discs.length);
    
    updateBoostplot(this);
    discplot.draw();
})

discplot.discConfig.on("disc:property", function () {
    window.discplot.draw();
})

window.discplot.discConfig.addDiscs(4)


let compilationStatus = true;
export default compilationStatus;