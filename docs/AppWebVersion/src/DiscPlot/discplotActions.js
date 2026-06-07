import discplot from "./discplot.js";
import { buildBoostplot } from "../boostplot.js";
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

    function updateBoostplot() {
        // calculate the boostfactor for the current disc settings and update the boostplot
        const freq = Array.from({ length: 100 }, (_, i) => (1 + i) * 1e9);
        const { reflectivity, boostfactor } = transfer_matrix(freq, discplot.discs.map(d => d.x), discplot.discs.map(d => d.width));
        
        const data = Array.from(boostfactor, (val, i) => ({ x: freq[i], y: val }));
        buildBoostplot(data);
    }

    switch (event.type) {
        case "disc_position_change":
            position_input.value = discplot.focus_disc[0].x;
            

            updateBoostplot()
            break;
        case "disc_selection_change":
            console.log("disc selection changed")
            break;
        default:
            console.log("unknown change")
    }
};

let compilationStatus = true;
export default compilationStatus;