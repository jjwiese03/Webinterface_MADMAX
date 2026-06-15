/**
 * 
 * @file clickEvent.js
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


import discplot from "./discplot.js"


function onDisc(event) {
    /** Returns the disc which is targeted the event. If no disc is targeted it returns null. 
     * 
     * Function: Implements Binary search to find the disc.
    *    
    *   @param {Event} event 
    */ 

    const X = event.clientX

    // start binary search
    var start = 0;
    var end = discplot.discConfig.discs.length - 1;
    var mid = Math.floor((end - start) / 2);

    var midDisc;
    var discLeftSide;
    var discRightSide;
    while (start != end) {
        mid = Math.floor((end - start) / 2);

        midDisc = discplot.discConfig.discs[mid]

        discLeftSide = discplot.cm_to_pixel(midDisc.position) + discplot.padd[3]
        discRightSide = discplot.cm_to_pixel(midDisc.position + midDisc.width) + discplot.padd[3]

        if (X < discLeftSide) {
            end = mid;
        }
        else if (X > discRightSide) {
            start = mid;
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

discplot.discCanvas.addEventListener("click", (event) => {
    const disc = onDisc(event)
    
    if (disc != null) disc.selected = true;
    else discplot.discConfig.clearFocus();

    discplot.draw();
})


const Status = true;
export default Status;