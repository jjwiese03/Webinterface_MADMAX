import discplot from "./discplot.js";
import { buildBoostplot } from "./boostplot.js";
import { transfer_matrix } from "./transfer_matrix.js";

discplot.onchange = function(event) {
  // function to call when a change in the settings occurs
  switch (event.type) {
    case "disc_change":
        
        const freq = Array.from({ length: 100 }, (_, i) => (1 + i) * 1e9);
        const { reflectivity, boostfactor } = transfer_matrix(freq, discplot.discs.map(d => d.x), discplot.discs.map(d => d.width));
        
        const data = Array.from(boostfactor, (val, i) => ({ x: freq[i], y: val }));
        buildBoostplot(data);
        break;
    case "scale_change":
        console.log("scale changed")
        break;
    default:
        console.log("unknown change")
  }
};

let state = true;
export default state;