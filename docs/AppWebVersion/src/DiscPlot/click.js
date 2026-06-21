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

// rect einmal außerhalb berechnen (oder bei resize aktualisieren)
const rect = discplot.discCanvas.getBoundingClientRect();
let mouseX = 0;
let mouseY = 0;

// Handler als echte Closure mit disc im Scope
let mouseMoveHandler = null;

const handleMouseMove = (disc, offset) => (event) => {
    mouseY = event.clientY - rect.top;
    
    disc.move(discplot.pixel_to_cm(event.clientX - rect.left - offset))
};

discplot.discCanvas.addEventListener("mousedown", (event) => {
    // const disc = onDisc(event);
    const X = discplot.pixel_to_cm(event.clientX, false);
    const disc = discplot.discConfig.onDisc(X)

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