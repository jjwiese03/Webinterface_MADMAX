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
document.getElementById("mirror_checkbox").addEventListener("change", function() {discplot.draw()});

/* Plot Checkbox */
document.getElementById("graph_dist_chkbx").addEventListener("change", function() {discplot.draw()});
document.getElementById("graph_pos_chkbx").addEventListener("change", function() {discplot.draw()});
document.getElementById("deleteDisc").addEventListener("click", (e) => {discplot.discConfig.deleteSelectedDiscs(); discplot.discConfig.emit("disc:removed")});


/* Positioning Inputs */
document.getElementById("disc-number-input").onchange = function(event) {
    if(isNaN(event.target.value)) ;
    const diff =  parseFloat(event.target.value) - discplot.discConfig.length;
    if (diff > 0) {
        discplot.discConfig.addDiscs(Math.abs(diff));
    } else {
        discplot.discConfig.deleteDiscs(Math.abs(diff));
    }
};

document.getElementById("position-input").onchange = function(event) {
    try {
        let dx = parseFloat(event.target.value) - window.discplot.discConfig.firstSelectedDisc.position

        window.discplot.discConfig.loopSelection((disc, i, kwargs) => {
            disc.move(kwargs.dx, true)
        }, {dx})
    } catch (error) {
        console.log("no position change possible: ", error)
    }
};

document.getElementById("rel-position-input").onchange = function(event) {
    try {
        let dx = parseFloat(event.target.value) - (window.discplot.discConfig.firstSelectedDisc.position - window.discplot.discConfig.firstSelectedDisc.before.rightEdge)

        window.discplot.discConfig.loopSelection((disc, i, kwargs) => {
            disc.move(kwargs.dx, true)
        }, {dx})
    } catch (error) {
        console.log("no relative position change possible: ", error)
    }
};

document.getElementById("width-input").onchange = function(event) {
    try {
        let width = parseFloat(event.target.value)
        window.discplot.discConfig.loopSelection((disc, i, kwargs) => {
            disc.changeProperty(kwargs)
        }, {width})
    }catch (error) {
        console.log("no relative position change possible: ", error)
    }
};



let compilationStatus = true;
export default compilationStatus;