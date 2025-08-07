var session_id = '____'


// Websocket Connection Daten verarbeiten
window.parse_payload = function(WebSocket, payload) {
    try{
        update_boostplot(JSON.parse(payload))
    }
    catch(error){
        console.log("drawing Boostplot failed!!!")
    }
}

function session(){
    if(session_btn1.checked){
        // starte eine session
        session_id = generateString(7)
        WS = Genie.initWebChannel(session_id)
    }
    else{
        // beende die session
    }
}