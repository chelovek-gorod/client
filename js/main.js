'use strict'

const container = document.getElementById('container');

let myWs = new WebSocket('wss:mars-chat-server.herokuapp.com:55798');
myWs.onopen = function () {
  console.log('подключился');
};


/*
// обработчик сообщений от сервера
myWs.onmessage = function (message) {
  console.log('Message: %s', message.data);
};
// функция для отправки echo-сообщений на сервер
function wsSendEcho(value) {
  myWs.send(JSON.stringify({action: 'ECHO', data: value.toString()}));
}
// функция для отправки команды ping на сервер
function wsSendPing() {
  myWs.send(JSON.stringify({action: 'PING'}));
}
*/
