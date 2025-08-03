WS.socket.onmessage = (event) => {
    // console.log(event)
}
// Websocket Connection Daten verarbeiten
window.parse_payload = function(WebSocket, payload) {
    try{update_boostplot(JSON.parse(payload))}catch(error){console.log("drawing Boostplot failed!!!")};
    // console.log(window.Genie.AllWebChannels)
}