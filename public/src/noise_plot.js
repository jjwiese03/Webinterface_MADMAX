

// Declare the chart dimensions and margins.
const width = 500;
const height = 300;
const marginTop = 30;
const marginRight = 60;
const marginBottom = 30;
const marginLeft = 60;

const element = document.getElementById("noise_plot")
element.width = width+marginRight+marginLeft
element.height = height+marginBottom+marginTop

    
// Declare the x (horizontal position) scale.
var x = d3.scaleLinear([0, 5], [marginLeft, width - marginRight])

// Declare the y (vertical position) scale.
var y = d3.scaleLinear([0, 100], [height - marginBottom, marginTop])
var y2 = d3.scaleLinear([0, 2], [height - marginBottom, marginTop])

// Create the SVG container.
const noise_svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

// Add the x-axis
var x_axis = noise_svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .attr("stroke-width", 1.5)
    .call(d3.axisBottom(x));

// Add the y-axis
var y_axis_1 = noise_svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .attr("stroke-width", 1.5)
    .call(d3.axisLeft(y));

var y_axis_2 = noise_svg.append("g")
    .attr("transform", `translate(${width - marginRight},0)`)
    .attr("stroke-width", 1.5)
    .call(d3.axisRight(y2));

// Add grid

var grid = noise_svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .attr("stroke-width", 0.7)
    .attr("opacity", 0.3)
    .call(d3.axisRight(y).tickSizeInner(width-marginLeft-marginRight));

grid.selectAll(".tick text").remove();

// Zoom-Linie

const zoomline = noise_svg.append("g")
    .append("line")
    .attr("y1", height-marginTop)
    .attr("y2", marginBottom)
    .attr("x1", marginLeft)
    .attr("x2", marginLeft)
    .attr("stroke", "black");

noise_svg.append("text")
    .text("frequency [GHz]")
    .attr("y", height-marginBottom+40)
    .attr("x", width/2-50)

var path = svg.append("path")
    .attr("id", "svg")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)

noise_plot.append(noise_svg.node())

function update_noiseplot(){
    console.log("test")
    
}
