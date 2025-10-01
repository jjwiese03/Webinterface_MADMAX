

// Declare the chart dimensions and margins.
const noise_plot_width = 500;
const noise_plot_height = 300;
const noise_plot_marginTop = 30;
const noise_plot_marginRight = 60;
const noise_plot_marginBottom = 30;
const noise_plot_marginLeft = 60;

const element = document.getElementById("noise_plot")
element.width = noise_plot_width+noise_plot_marginRight+noise_plot_marginLeft
element.height = noise_plot_height+noise_plot_marginBottom+noise_plot_marginTop

    
// Declare the x (horizontal position) scale.
var noise_x = d3.scaleLinear([0, 5], [noise_plot_marginLeft, noise_plot_width - noise_plot_marginRight])

// Declare the y (vertical position) scale.
var noise_y = d3.scaleLinear([0, 100], [noise_plot_height - noise_plot_marginBottom, noise_plot_marginTop])

// Create the SVG container.
const noise_svg = d3.create("svg")
    .attr("width", noise_plot_width)
    .attr("height", noise_plot_height);

// Add the x-axis
var x_axis = noise_svg.append("g")
    .attr("transform", `translate(0,${noise_plot_height - noise_plot_marginBottom})`)
    .attr("stroke-width", 1.5)
    .call(d3.axisBottom(noise_x));

// Add the y-axis
var y_axis_1 = noise_svg.append("g")
    .attr("transform", `translate(${noise_plot_marginLeft},0)`)
    .attr("stroke-width", 1.5)
    .call(d3.axisLeft(noise_y));

var y_axis_2 = noise_svg.append("g")
    .attr("transform", `translate(${noise_plot_width - noise_plot_marginRight},0)`)
    .attr("stroke-width", 1.5)
    .call(d3.axisRight(noise_y));

// Add grid

var grid = noise_svg.append("g")
    .attr("transform", `translate(${noise_plot_marginLeft},0)`)
    .attr("stroke-width", 0.7)
    .attr("opacity", 0.3)
    .call(d3.axisRight(noise_y).tickSizeInner(noise_plot_width-noise_plot_marginLeft-noise_plot_marginRight));

grid.selectAll(".tick text").remove();


noise_svg.append("text")
    .text("frequency [GHz]")
    .attr("y", noise_plot_height-noise_plot_marginBottom+40)
    .attr("x", noise_plot_width/2-50)

var noise_path = svg.append("path")
    .attr("id", "svg")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)

noise_plot.append(noise_svg.node())

function update_noiseplot(){
    console.log("test")
    
}
