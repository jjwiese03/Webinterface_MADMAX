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

    console.log(discplot.discConfig.discs)
    if (X > discLeftSide && X < discRightSide) {
        return leftOver;
    }

    return null;
}

var actionIntervall;

discplot.discCanvas.addEventListener("mousedown", (event) => {
    const disc = onDisc(event)
    
    if (disc != null) disc.selected = true;
    if (disc != null) console.log(disc.index);

    else discplot.discConfig.clearSelection();

    // actionIntervall = setInterval( (disc) => {

    // }, 16, disc)

    discplot.draw();
})

discplot.discCanvas.addEventListener("click", (event) => {
    // clearIntervall(action)
})


const Status = true;
export default Status;