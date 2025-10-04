// WebChannel initialisieren 
const wc_Efield = Genie.initWebChannel('Efield');
const wc_boost = Genie.initWebChannel('Boost');
const wc_noise = Genie.initWebChannel('Noise');

// Websocket Connection Daten verarbeiten
window.parse_payload = function(WebSocket, payload) {

    // Verarbeite eingehende Boostdaten 
    if (WebSocket.channel == "Boost"){
        try{
            update_boostplot(JSON.parse(payload))
            // update_noiseplot(JSON.parse(payload))
        }
        catch(error){
            console.log("drawing Boostplot failed!!!", error)
        }
    }

    // Verarbeite Daten über E-Feld
    else if (WebSocket.channel == "Efield"){
        try{
            ax.draw_E_field(JSON.parse(payload))
        }
        catch(error){
            console.log("drawing Efield failed!!!", error)
        }
    }
    // Verarbeite Daten über Noise
    else if (WebSocket.channel == "Noise"){
        try{
            update_noiseplot(JSON.parse(payload))
        }
        catch(error){
            console.log("drawing Efield failed!!!", error)
        }
    }
}