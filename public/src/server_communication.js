// Websocket Connection Daten verarbeiten
window.parse_payload = function(WebSocket, payload) {
    console.log(JSON.parse(payload))
    try{
        update_boostplot(JSON.parse(payload))
    }
    catch(error){
        console.log("drawing Boostplot failed!!!", error)
    }
}
