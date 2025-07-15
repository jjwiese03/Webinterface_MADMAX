function control_tand_condition(){
    const element = document.getElementById('tan_delta')
    if (isNaN(element.value) || element.value<0){
        element.value = 0
    }
}

function control_freq_condition(){
    
    
    if (freq_min_field.value != "" && (parseFloat(freq_min_field.value) >= parseFloat(freq_max_field.value) || isNaN(freq_max_field.value))){
        freq_max_field.value = Round(parseFloat(freq_min_field.value) + 0.1, 10)
    }
    else if(isNaN(freq_max_field.value)){
        freq_max_field.value = 0
    }
}
