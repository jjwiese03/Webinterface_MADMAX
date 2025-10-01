// discplot elements
const canvas = document.getElementById("Graph");
const position_field = document.getElementById("pos");
const width_field = document.getElementById("width");
const dielectric_field = document.getElementById("dielectric");
const counter_field = document.getElementById("counter_txt_id");
const import_button = document.getElementById("input_select");
const mirror_checkbox = document.getElementById("mirror_checkbox");
const boostfactor_plot = document.getElementById("boostfactor");
const graph_pos_chkbx = document.getElementById("graph_pos_chkbx");
const graph_dist_chkbx = document.getElementById("graph_dist_chkbx");

// boostplot elements
const element_ = document.getElementById("boost_plot")
const boostplot_chkbx_1 = document.getElementById("scale_checkbox_1")
const boostplot_chkbx_2 = document.getElementById("scale_checkbox_2")
const freq_min_field = document.getElementById("freq_min")
const freq_max_field = document.getElementById("freq_max")
const tan_delta_field = document.getElementById("tan_delta")
const slider_resolution = document.getElementById("slider_resolution");


function resize_font(element){
    let font_size = 21;
    element.style.fontSize = String(font_size)+"px";
    
    while(element.scrollWidth > element.clientWidth){
        element.style.fontSize = String(font_size)+"px";
        font_size -= 1;
    }
}

function arange(start, stop, step){
    let arr = []
    while(start<=stop){
        arr.push(start)
        start+=step
    }
    return arr
}

function find_closest_value(arr, val){
    // finds arrayvalue, which is closest to val
    arr = arr.sort((a, b) => Math.abs(val-a)-Math.abs(val-b))
    return arr[0]
};

function find_stepvalue(start, stop, num){
    // finds the right stepsize for an Intervall [start, stop] an the approximately wanted number of ticks num so that the steps are beautifully spaced
    let step = (stop-start)/num
    let decimals = Math.floor(Math.log10(step));

    return find_closest_value([1,2,5], step*10**-decimals)*10**decimals
}


function Round(value, decimals){
    return parseFloat(value.toFixed(decimals))
} 



const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}