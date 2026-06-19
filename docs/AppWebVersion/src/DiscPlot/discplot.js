/**
 * 
 * @file discplot.js
 * @author Jan Wiesmann
 * @version 0.0.1
 * @created 2026-06-05
 *
 * Discplot Module
 * 
 * This file implements the discplot, which is used to visualize and manage the configuration of the discs. It also implements the interaction with the discplot (f.e. click on a disc, drag and drop etc.).
 * 
 * Usage:
 * A public API is exposed by this module. It is used internally by the Discplot component to manage user interactions and update the plot accordingly.
 */


import { Round, colors } from "../utils.js";
import { updateBoostplot } from "../boostplot.js";
import { Disc, DiscCollection } from "./DiscCollection.js";
import { Axis } from "./Axis.js";
import MarqueeSelection from "./MarqueeSelection.js";



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

function setCanvasSize() {
    /**
     * sets the canvas size of the discplot to the size of its wrapper div
     */
    const discCanvas = document.getElementById("discs");
    const Parent = discCanvas.parentElement

    discCanvas.width = Parent.clientWidth; // passt die Canvas-Breite an die tatsächliche Größe im Layout an
    discCanvas.height = Parent.clientHeight; // passt die Canvas-Größe an die tatsächliche Größe im Layout an

    const axisCanvas = document.getElementById("axis");
    axisCanvas.width = Parent.clientWidth; // passt die Canvas-Breite an die tatsächliche Größe im Layout an
    axisCanvas.height = Parent.clientHeight; // passt die Canvas-Größe an die tatsächliche Größe im Layout an

    return null;    //returns nothing
}
setCanvasSize();

window.addEventListener('resize', setCanvasSize());


const graph_pos_chkbx = document.getElementById("graph_pos_chkbx");
const graph_dist_chkbx = document.getElementById("graph_dist_chkbx");

class Plot{
    constructor(discCanvas, axisCanvas){
        this.discCanvas = discCanvas
        this.axisCanvas = axisCanvas
        this.discContext = discCanvas.getContext("2d");
        this.axisContext = axisCanvas.getContext("2d");

        this.padd = [discCanvas.height * 0.3, discCanvas.width * 0.1, discCanvas.height * 0.3, innerHeight * 0.05]
        this.discContext.font = "15px Poppins";
        this.axisContext.font = "15px Poppins";

        this.discConfig = new DiscCollection();

        this.axis = new Axis();

        this.marqueeSelection = new MarqueeSelection();   // speichert die Koordinaten des Marquee Selection Rechtecks (multiselect)
        
        this.init();
    }
    init(){
        this.updateScale(10, "cm");     // initiiert die Achse mit einem Standard Intervall von 10cm und der Einheit cm
        this.discConfig.addDisc();
        this.discConfig.addDisc();
        this.discConfig.addDisc({"width": 0.7});
        const disc = this.discConfig.addDisc();
        disc.move(7, true)

        this.draw(true);
    }
    draw(axis = false, discs = true) {

        if (axis) {
            // ── Achse ────────────────────────────────────────────────────────────────
            this.axisContext.clearRect(0, 0, this.axisCanvas.width, this.axisCanvas.height);

            this.axisContext.beginPath();
            this.axisContext.strokeStyle = colors.color_dark_gray;
            this.axisContext.fillStyle   = colors.color_dark_gray;
            this.axisContext.lineWidth   = 0.5;

            this.axisContext.moveTo(this.padd[3], this.axisCanvas.height - this.padd[2]);
            this.axisContext.lineTo(this.axisCanvas.width - this.padd[1], this.axisCanvas.height - this.padd[2]);

            this.axis.ticks.forEach(tick => {
                const x = this.padd[3] + this.cm_to_pixel(tick);
                const y = this.axisCanvas.height - this.padd[2];
                this.axisContext.moveTo(x, y);
                this.axisContext.lineTo(x, y + 8);
            });
            this.axisContext.stroke(); // einmal für Achslinie + alle Ticks

            // Tick-Labels
            this.axisContext.fillStyle = colors.color_dark_gray;
            this.axisContext.textAlign = "center";
            this.axis.ticks.forEach(tick => {
                const x = this.padd[3] + this.cm_to_pixel(tick);
                this.axisContext.fillText(tick, x, this.axisCanvas.height - this.padd[2] + 25);
            });

            // Achsbeschriftung
            this.axisContext.fillText(
                "Position [" + this.axis.unit + "]",
                this.padd[3] + (this.axisCanvas.width - this.padd[1] - this.padd[3]) / 2,
                this.axisCanvas.height - this.padd[2] + this.axisContext.measureText("Position").emHeightAscent * 4.5
            );

            this.axisContext.stroke();
            this.axisContext.fill();
        }

        if (discs) {
            // ── Scheiben ─────────────────────────────────────────────────────────────
            this.discContext.clearRect(0, 0, this.discCanvas.width, this.discCanvas.height);

            var prev_disc  = { position: 0, width: 0 };
            var arrow_y    = this.discCanvas.height / 2;

            this.discConfig.discs.forEach(disc => {
                const x = this.padd[3] + this.cm_to_pixel(disc.position);
                const bodyH = this.discCanvas.height - this.padd[0] - this.padd[2];

                // Scheibenkörper
                this.discContext.beginPath();
                this.discContext.strokeStyle = colors.line_color_1
                this.discContext.rect(x, this.padd[0], this.cm_to_pixel(disc.width), bodyH);
                this.discContext.fillStyle = disc.selected ? "rgba(133, 144, 170, 0.54)" : "rgba(133, 144, 170, 0.19)";
                this.discContext.fill();
                this.discContext.stroke();

                // Scheiben-Header (dunkles Rechteck oben)
                this.discContext.beginPath();
                this.discContext.rect(x, this.padd[0] - 15, this.cm_to_pixel(disc.width), 15);
                this.discContext.fillStyle = "rgb(52, 71, 122)";
                this.discContext.fill();
                this.discContext.stroke();

                // Abstandspfeil zur vorherigen Scheibe
                if (graph_dist_chkbx.checked) {
                    const gap = parseFloat(-(prev_disc.position + prev_disc.width - disc.position).toFixed(3));
                    if (gap !== 0) {
                        const arrow_start = this.cm_to_pixel(prev_disc.position + prev_disc.width) + this.padd[3];
                        const arrow_end   = this.cm_to_pixel(disc.position) + this.padd[3];
                        const label       = String(gap) + this.axis.unit;

                        this.discContext.beginPath();
                        this.discContext.strokeStyle = colors.color_dark_gray;
                        this.discContext.lineWidth   = 0.5;
                        // Pfeilspitze links
                        this.discContext.moveTo(arrow_start + 5, arrow_y + 5);
                        this.discContext.lineTo(arrow_start,     arrow_y);
                        this.discContext.lineTo(arrow_start + 5, arrow_y - 5);
                        // Linie
                        this.discContext.moveTo(arrow_start, arrow_y);
                        this.discContext.lineTo(arrow_end,   arrow_y);
                        // Pfeilspitze rechts
                        this.discContext.moveTo(arrow_end - 5, arrow_y + 5);
                        this.discContext.lineTo(arrow_end,     arrow_y);
                        this.discContext.lineTo(arrow_end - 5, arrow_y - 5);
                        this.discContext.stroke();

                        // Abstandszahl
                        this.discContext.fillStyle = colors.color_dark_gray;
                        const labelWidth = this.discContext.measureText(label).width;
                        if (arrow_end - arrow_start < labelWidth) {
                            this.discContext.save();
                            this.discContext.translate(arrow_start + (arrow_end - arrow_start) / 2, arrow_y - 10);
                            this.discContext.rotate(-Math.PI / 2);
                            this.discContext.textBaseline = "middle";
                            this.discContext.textAlign    = "left";
                            this.discContext.fillText(label, 0, 0);
                            this.discContext.restore();
                        } else {
                            this.discContext.textAlign    = "center";
                            this.discContext.textBaseline = "alphabetic";
                            this.discContext.fillText(label, arrow_start + (arrow_end - arrow_start) / 2, arrow_y - 10);
                        }
                    }
                }

                // Positionsbeschriftung
                if (graph_pos_chkbx.checked) {
                    const posLabel = String(parseFloat(disc.position.toFixed(3))) + this.axis.unit;
                    this.discContext.save();
                    this.discContext.translate(
                        this.cm_to_pixel(disc.position + disc.width / 2) + this.padd[3],
                        this.padd[0] - this.discContext.measureText(posLabel).width / 2 - 25
                    );
                    this.discContext.rotate(-Math.PI / 2);
                    this.discContext.textBaseline = "middle";
                    this.discContext.fillStyle    = colors.color_dark_gray;
                    this.discContext.fillText(posLabel, 0, 0);
                    this.discContext.restore();
                }

                prev_disc = disc;
            });

            // ── Marquee-Selektion ─────────────────────────────────────────────────────
            if (this.marqueeSelection.active) {
                this.discContext.beginPath();
                this.discContext.rect(
                    this.marqueeSelection.start[0] + this.padd[3],
                    this.discCanvas.height - this.marqueeSelection.start[1] - this.padd[2],
                    this.marqueeSelection.end[0]   - this.marqueeSelection.start[0],
                    this.marqueeSelection.start[1] - this.marqueeSelection.end[1]
                );
                this.discContext.strokeStyle = "rgba(39, 51, 161, 0.35)";
                this.discContext.lineWidth   = 0.5;
                this.discContext.fillStyle   = "rgba(145, 163, 209, 0.27)";
                this.discContext.fill();
                this.discContext.stroke();
            }

            // ── Spiegel ───────────────────────────────────────────────────────────────
            if (mirror_checkbox.checked) {
                this.discContext.beginPath();
                this.discContext.fillStyle = colors.madmax_yellow_light;
                this.discContext.fillRect(
                    this.padd[3], this.discCanvas.height - this.padd[2],
                    -10, -(this.discCanvas.height - this.padd[0] - this.padd[2])
                );
            }
        }
        
    }
    updateScale(xmax=10, unit="cm"){
        if (xmax != null) {this.axis.setXmax(xmax)};
        if (unit != null) {this.axis.setUnit(unit)};
        this.axis.updateTicks();

        this.draw();
    }
    pixel_to_cm(x_pixel, leftPadding = true) {
        const usableWidth = this.axisCanvas.width - (leftPadding ? this.padd[1] + this.padd[3] : 0) - 20;
        return (x_pixel / usableWidth) * this.axis.xmax;
    }
    cm_to_pixel(x){
        return Math.trunc(x*(this.axisCanvas.width-this.padd[1]-this.padd[3]-20)/this.axis.xmax)
    }
}


const discCanvas = document.getElementById("discs")
const axisCanvas = document.getElementById("axis")
const discplot = new Plot(discCanvas, axisCanvas);   
export default discplot;
