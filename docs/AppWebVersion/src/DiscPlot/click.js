/**
 * 
 * @file click.js
 * @author Jan Wiesmann
 * @version 0.0.1
 * @created 2026-06-05
 *
 * Click Event Module
 * 
 * This file handles the click Events on the discplot
 * 
 * Usage:
 * A public API is not exposed by this module. 
 */


import { Disc } from "./DiscCollection.js";
import discplot from "./discplot.js"


function onDisc(event) {
    /** Returns the disc which is targeted by the event. If no disc is targeted it returns null. 
     * 
     * Function: Implements Binary search to find the disc.
    *    
    *   @param {Event} event 
    */ 

    const X = event.clientX

    // start binary search
    var start = 0;
    var end = discplot.discConfig.discs.length - 1;
    var mid = start + Math.floor((end - start) / 2);

    var midDisc;
    var discLeftSide;
    var discRightSide;

    let safety = 0;
    while (start != end) {
        if (++safety > 100000) {
            throw new Error("Possible infinite loop detected");
        }

        mid = start + Math.floor((end - start) / 2);
        

        midDisc = discplot.discConfig.discs[mid]

        discLeftSide = discplot.cm_to_pixel(midDisc.position) + discplot.padd[3]
        discRightSide = discplot.cm_to_pixel(midDisc.position + midDisc.width) + discplot.padd[3]

        if (X < discLeftSide) {
            end = mid - 1;
        }
        else if (X > discRightSide) {
            start = mid + 1;
        }
        else {
            return midDisc;
        }
    }

    // check the left over disc
    const leftOver = discplot.discConfig.discs[start]
    discLeftSide = discplot.cm_to_pixel(leftOver.position) + discplot.padd[3]
    discRightSide = discplot.cm_to_pixel(leftOver.position + leftOver.width) + discplot.padd[3]

    if (X > discLeftSide && X < discRightSide) {
        return leftOver;
    }

    return null;
}

// rect einmal außerhalb berechnen (oder bei resize aktualisieren)
const rect = discplot.discCanvas.getBoundingClientRect();
let mouseX = 0;
let mouseY = 0;

// Handler als echte Closure mit disc im Scope
let mouseMoveHandler = null;

const handleMouseMove = (disc, offset) => (event) => {
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    
    disc.move(discplot.pixel_to_cm(mouseX - offset))
};

discplot.discCanvas.addEventListener("mousedown", (event) => {
    const disc = onDisc(event);
    if (disc != null) {
        disc.selectDisc()

        // Alten Listener entfernen, falls noch aktiv
        if (mouseMoveHandler) {
            discplot.discCanvas.removeEventListener("mousemove", mouseMoveHandler);
        }

        // Neue Closure mit aktuellem disc erstellen und speichern
        mouseMoveHandler = handleMouseMove(disc, (event.clientX - rect.left) - discplot.cm_to_pixel(disc.position));
        discplot.discCanvas.addEventListener("mousemove", mouseMoveHandler);
        }
    else discplot.discConfig.clearSelection();

    
});

discplot.discCanvas.addEventListener("mouseup", () => {
    if (mouseMoveHandler) {
        discplot.discCanvas.removeEventListener("mousemove", mouseMoveHandler);
        mouseMoveHandler = null;
    }
});

const Status = true;
export default Status;