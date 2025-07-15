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

function pos_chkbx(){
    document.getElementById('pos_input_chbx').style.backgroundColor = 'rgba(53, 134, 53, 0.82)'
    document.getElementById('dis_input_chbx').style.backgroundColor = 'rgba(191, 197, 191, 0.97)'
    dis_pos_switch = true
    synch_graphtoinput()
}
function dis_chkbx(){
    document.getElementById('pos_input_chbx').style.backgroundColor = 'rgba(191, 197, 191, 0.97)'
    document.getElementById('dis_input_chbx').style.backgroundColor = 'rgba(53, 134, 53, 0.82)'
    dis_pos_switch = false
    synch_graphtoinput()
}