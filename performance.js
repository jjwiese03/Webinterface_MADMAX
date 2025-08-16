import http from 'k6/http';
import ws from 'k6/ws';
import { sleep } from 'k6';

export const options = {
  vus: 1,
  duration: "30s",
};

export default function () {
  http.get('http://127.0.0.1:8000/');

  let channel = '____'
  let message = 'echo'
  let payload = {
    "disc_data": [],
    "f_min": 2e9,
    "f_max": 24e9,
    "n": 50,
    "mirror": true,
    "tan_delta": 5e-6
  }

  let msg = JSON.stringify({
      'channel': channel,
      'message': message,
      'payload': payload
    });

  const url = 'ws://127.0.0.1:8000/';
  const res = ws.connect(url, {}, function (socket) {
    socket.on('open', () => {
      var received = 0;
      var total = 100;
      for (var sent = 0; sent<=total; sent++){
        while (sent<received){
          console.log("while:", sent, received)
        }
        socket.setTimeout(() => {socket.send(msg);}, 20);

        socket.on('message', () => {received++; console.log("received:", received, "sent:", sent)})
      }
    }); 
    socket.setTimeout(() => {socket.close()}, 1000)
  });

}

export function handleSummary(data) {
  return {
    "stdout": textSummary(data, { indent: " ", enableColors: true }),
    "results.json": JSON.stringify(data), // Als JSON speichern
  };
}