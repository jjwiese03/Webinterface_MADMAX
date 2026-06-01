// colors
export const colors = {
    line_color_1: "rgba(196, 196, 196, 0.733)",
    color_dark_gray: "#808080",
    color_light_gray: "rgba(229, 229, 229, 0.285)",
    alert_red: "rgb(194, 140, 140)",
    madmax_yellow: "#f5a623",
    madmax_yellow_light: "#eccd9b"
};

export function resize_font(element){
    let font_size = 21;
    element.style.fontSize = String(font_size)+"px";
    
    while(element.scrollWidth > element.clientWidth){
        element.style.fontSize = String(font_size)+"px";
        font_size -= 1;
    }
}

export function arange(start, stop, step){
    let arr = []
    while(start<=stop){
        arr.push(start)
        start+=step
    }
    return arr
}

export function find_closest_value(arr, val){
    // finds arrayvalue, which is closest to val
    arr = arr.sort((a, b) => Math.abs(val-a)-Math.abs(val-b))
    return arr[0]
};

export function find_stepvalue(start, stop, num){
    // finds the right stepsize for an Intervall [start, stop] an the approximately wanted number of ticks num so that the steps are beautifully spaced
    let step = (stop-start)/num
    let decimals = Math.floor(Math.log10(step));

    return find_closest_value([1,2,5], step*10**-decimals)*10**decimals
}


export function Round(value, decimals){
    return parseFloat(value.toFixed(decimals))
} 


function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

console.log("utils loaded")
