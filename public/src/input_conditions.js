function control_tand_condition(){
    const element = document.getElementById('tan_delta')
    if (isNaN(element.value) || element.value<0){
        element.value = 0
    }
}

function control_freq_condition(min_zoom=0.01){
    if(freq_min_field.value != "" ){
        if(isNaN(freq_min_field.value) || parseFloat(freq_min_field.value)<0){
            freq_min_field.value = 0;
        }
        if(parseFloat(freq_min_field.value)+min_zoom >= parseFloat(freq_max_field.value)){
            freq_max_field.value = Round(parseFloat(freq_min_field.value) + min_zoom, 10)
        }
    }
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