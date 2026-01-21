// WebChannel initialisieren 
wc_Efield = Genie.initWebChannel('Efield');
wc_boost = Genie.initWebChannel('Boost');

// Websocket Connection Daten verarbeiten
window.parse_payload = function(WebSocket, payload) {
    if (WebSocket.channel == "Boost"){
        try{
            update_boostplot(JSON.parse(payload))
        }
        catch(error){
            console.log("drawing Boostplot failed!!!", error)
        }
    }
    else if (WebSocket.channel == "Efield"){
        try{
            ax.draw_E_field(JSON.parse(payload))
        }
        catch(error){
            console.log("drawing Efield failed!!!", error)
        }
    }
    
}