// Declare the chart dimensions and margins.
const width = 550;
const height = 500;
const marginTop = 60;
const marginRight = 80;
const marginBottom = 60;
const marginLeft = 80;

element_.width = width+marginRight+marginLeft
element_.height = height+marginBottom+marginTop



// Declare the x (horizontal position) scale.
var x = d3.scaleLinear([0, 5], [marginLeft, width - marginRight])

// Declare the y (vertical position) scale.
var y = d3.scaleLinear([0, 100], [height - marginBottom, marginTop])
var y2 = d3.scaleLinear([0, 2], [height - marginBottom, marginTop])

// Create the SVG container.
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height);

// Add the x-axis
var x_axis = svg.append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .attr("stroke-width", 1.5)
    .call(d3.axisBottom(x));

// Add the y-axis
var y_axis_1 = svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .attr("stroke-width", 1.5)
    .attr("stroke", "steelblue")
    .call(d3.axisLeft(y));

var y_axis_2 = svg.append("g")
    .attr("transform", `translate(${width - marginRight},0)`)
    .attr("stroke-width", 1.5)
    .attr("stroke", 'rgb(155, 38, 38)')
    .call(d3.axisRight(y2));

// Add grid

var grid = svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .attr("stroke-width", 0.7)
    .attr("opacity", 0.3)
    .call(d3.axisRight(y).tickSizeInner(width-marginLeft-marginRight));

grid.selectAll(".tick text").remove();

// Zoom-Linie

const zoomline = svg.append("g")
    .append("line")
    .attr("y1", height-marginTop)
    .attr("y2", marginBottom)
    .attr("x1", marginLeft)
    .attr("x2", marginLeft)
    .attr("stroke", "black");

svg.append("text")
    .text("frequency [GHz]")
    .attr("y", height-marginBottom+40)
    .attr("x", width/2-50)

svg.append("text")
    .text("boostfactor")
    .attr("transform", "rotate(-90)")
    .attr("stroke", "steelblue")
    .attr("y", 25)
    .attr("x", -height/2-50)

svg.append("text")
    .text("reflectivity")
    .attr("transform", "rotate(90)")
    .attr("stroke", 'rgb(155, 38, 38)')
    .attr("y", -width+25)
    .attr("x", height/2-50)

const line = d3.line()
    .x(d=>x(d[0]))
    .y(d=>y(d[1]));

const line_ref = d3.line()
    .x(d=>x(d[0]))
    .y(d=>y2(d[2]));

var path = svg.append("path")
    .attr("id", "svg")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)

var path_ref = svg.append("path")
    .attr("id", "svg")
    .attr("fill", "none")
    .attr("stroke", 'rgb(155, 38, 38)')
    .attr("stroke-width", 2)

function update_boostplot(data){
    // filtere die Nullen, da sonst die log-Achsengrenzen Fehler machen
    data = data.filter(d => (d[1] != 0 && d[2] != 0))

    const max = d3.max(data.map(d => d[1]));
    const min = d3.min(data.map(d => d[1]))
    const max_ref = d3.max(data.map(d => d[2]))
    var min_ref = d3.min(data.map(d => d[2]))
    
    x.domain([data[0][0], data[data.length - 1][0]]);
    y.domain([min, max+(max-min)*0.2]);
    if (boostplot_chkbx_2.checked){
        y2.domain([min_ref, max_ref+(max_ref-min_ref)*0.2])
    }
    else{
        y2.domain([0, 1.1*max_ref])
    }

    x_axis.transition()
        .duration(750)
        .call(d3.axisBottom(x));

    y_axis_1.call(d3.axisLeft(y));
    y_axis_2.call(d3.axisRight(y2));

    grid.call(d3.axisRight(y).tickSizeInner(width-marginLeft-marginRight));
    grid.selectAll(".tick text").remove();


    path.attr("d", line(data));
    path_ref.attr("d", line_ref(data));
}


function update_log_lin_1(){
    if (boostplot_chkbx_1.checked){
        y = d3.scaleLog()
            .domain([1, 100])
            .range([height - marginBottom, marginTop])
            .nice();
        y_axis_1.call(d3.axisLeft(y))

    }
    else{
        y = d3.scaleLinear()
            .domain([1, 100])
            .range([height - marginBottom, marginTop])
            .nice();
        y_axis_1.call(d3.axisLeft(y))           
    }
}
function update_log_lin_2(){
    if (boostplot_chkbx_2.checked){
        y2 = d3.scaleLog()
            .domain([0.1, 1])
            .range([height - marginBottom, marginTop])
            .nice();
        y_axis_2.call(d3.axisRight(y2))

    }
    else{
        y2 = d3.scaleLinear()
            .domain([0, 2])
            .range([height - marginBottom, marginTop])
            .nice();
        y_axis_2.call(d3.axisRight(y2))           
    }
}


// Zoom über Maus implementieren

var mouse_x;
var rect_x;
var mouse_status = false;       // speichert den clickzustand der Maus
var sel_rect;
var sel_rect_left_border;

svg.on("mousemove touchmove", (event)=> {
    mouse_x = d3.pointer(event)[0]
    if (mouse_x>marginLeft && mouse_x<width-marginRight){
        zoomline.attr("x1", mouse_x)
                .attr("x2", mouse_x);

        if (mouse_status){
            sel_rect.attr("x", Math.min(rect_x, mouse_x)).attr("width", Math.abs(mouse_x-rect_x))
        }
    }
    else {
        zoomline.attr("x1", width-marginRight)
            .attr("x2", width-marginRight)
    }
});

svg.on("mousedown touchstart", (event) => {
    rect_x = d3.pointer(event)[0]

    if (mouse_x>marginLeft && mouse_x<width-marginRight){
        mouse_status = true;
        sel_rect = svg.append("rect").attr("x", rect_x).attr("y", marginTop).attr("height", height-marginBottom-marginTop).attr("width", 0).attr('fill', 'rgba(145, 163, 209, 0.27)');
        sel_rect_left_border = svg.append("line").attr("x1", rect_x).attr("x2", mouse_x).attr("y1", height-marginBottom).attr("y2", marginTop).attr("stroke", "black");
    }
});
d3.select("body").on("mouseup touchcancel", () => {
    if (mouse_status){
        console.log("mouseup on body (boostplot.js)")
        mouse_status = false;
        const x_min = Round(x.invert(parseFloat(sel_rect.attr("x"))),2);
        const x_max = Round(x.invert(parseFloat(sel_rect.attr("x"))+parseInt(sel_rect.attr("width"))),2);
        
        if(x_max-x_min>0.1){
            freq_min_field.value = x_min
            freq_max_field.value = x_max
        }
        else{
            freq_min_field.value = Round(x_min-(0.1+x_min-x_max)/2, 10)
            freq_max_field.value = Round(x_max+(0.1+x_min-x_max)/2, 10)
        }
        sel_rect.remove();
        sel_rect_left_border.remove();
        ax.send_settings_to_backend();
    }
});


// Zoom mit Scrollrad
document.addEventListener("keydown", (key_event) => {
    if(key_event.shiftKey){
        svg.on("wheel", (event) => {
            mousepos = d3.pointer(event)[0]
            var f_min = parseFloat(freq_min_field.value)
            var f_max = parseFloat(freq_max_field.value)

            if (event.deltaY>0){
                freq_max_field.value = Round(f_max+(f_max-x.invert(mousepos))*0.1, 3)
                freq_min_field.value = Round(f_min-(x.invert(mousepos)-f_min)*0.1, 3)
                if (freq_min_field.value<0){
                    freq_min_field.value = 0
                }
            }
            else if(f_min+0.01<f_max){
                freq_max_field.value = Round(f_max-(f_max-x.invert(mousepos))*0.1, 3)
                freq_min_field.value = Round(f_min+(x.invert(mousepos)-f_min)*0.1, 3)
            }
            ax.send_settings_to_backend()
        })
    }
});

// schalte den Zoom aus, wenn Shift nicht mehr gedrückt wird
document.addEventListener("keyup", (event) => {
    if(event.key == "Shift"){
        svg.on("wheel", null);
    }
});

// Append the SVG element.
boost_plot.append(svg.node());
update_log_lin_1();
update_log_lin_2();

