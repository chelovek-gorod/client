'use strict'

// CONNECTION

const socketURL = 'wss://mars-chat-server.herokuapp.com'; // 'ws://localhost:9000'
const connectionTimeout = 6000;

let connectionIs = false;
let registrationIs = false;

setTimeout(connection, 6000);

function connection() {
  console.log('--connection request--');

  let socket = new WebSocket(socketURL);

  socket.onopen = function () {
    console.log('socket on open');
    connectionIs = true;
    connectionShow(connectionIs)
    connectionStart();
    setTimeout(connectionTest, connectionTimeout);
  };
  
  socket.onmessage = function (message) {
    let { action, data } = JSON.parse(message.data);
    switch (action) {
      case 'registration' : getRegistrationResponse(data); break;
      case 'onConnect' : getOnConnectResponse(data); break;
      case 'newUser' : getNewUserResponse(data); break;
      case 'disconnectionUser' : getDisconnectionUserResponse(data); break;
      case 'newMessage' : getNewMessageResponse(data); break;
      default : getWrongActionInResponse(action, data);
    }
  };

  socket.onclose = function(event) {
    if (event.wasClean) {
      console.group('socket on close');
      console.log('clean close connection');
      console.log('code: ${event.code}');
      console.log('reason: ${event.reason}');
      console.groupEnd();
    } else {
      console.group('socket on close');
      console.log('connection terminated:');
      console.log(event);
      console.groupEnd();
    }
    connectionIs = false;
    connectionShow(connectionIs)
    connection();
  };
  
  socket.onerror = function(error) {
    console.group('socket on error');
    console.log('connection error:');
    console.log(error);
    console.groupEnd();
  };

  function connectionTest() {
    socket.send(JSON.stringify({ action: 'onConnect', data: Date.now() }));
    if (connectionIs) setTimeout(connectionTest, connectionTimeout);
  }

}

function connectionStart() {
  console.log('--connection start--');
}

function getOnConnectResponse(data) {
  let {clientSendTime, serverSendTime} = data;
  console.log(`--PingPong[client -> server : ${serverSendTime - clientSendTime}ms; server -> client: ${Date.now() - serverSendTime}ms]--`);
}

function getRegistrationResponse(data) {
  console.log(`--registration data: ${data}--`);
}

function getNewUserResponse(data) {
  console.log(`--new user: ${data}--`);
}

function getDisconnectionUserResponse(data) {
  console.log(`--user disconnect: ${data}--`);
}

function getNewMessageResponse(data) {
  console.log(`--new message: ${data}--`);
}

function getWrongActionInResponse(action, data) {
  console.log(`--wrong action: ${action} (data: ${data})--`);
}

// INTERFACE

const shellDiv = document.getElementById('shell');
const logoDiv = document.getElementById('logo');
const connectionDiv = document.getElementById('connection');
const containerDiv = document.getElementById('container');

let userNickName = '';
let avatarsArr = [
  'src/avatars/antman.png',
  'src/avatars/captan.png',
  'src/avatars/draks.png',
  'src/avatars/falcon.png',
  'src/avatars/gamora.png',
  'src/avatars/groot.png',
  'src/avatars/halk.png',
  'src/avatars/ironman.png',
  'src/avatars/mantis.png',
  'src/avatars/marvel.png',
  'src/avatars/mech.png',
  'src/avatars/mercury.png',
  'src/avatars/nebula.png',
  'src/avatars/panther.png',
  'src/avatars/piter.png',
  'src/avatars/rocket.png',
  'src/avatars/romanov.png',
  'src/avatars/spiderman.png',
  'src/avatars/strange.png',
  'src/avatars/tanas.png',
  'src/avatars/thor.png',
  'src/avatars/vision.png',
  'src/avatars/wanda.png',
  'src/avatars/yondu.png'
];

shellDiv.style.opacity = 1;
setTimeout(() => {logoDiv.style.opacity = 1;}, 1200);
setTimeout(() => {logoDiv.style.opacity = 0;}, 4800);
setTimeout(() => {logoDiv.remove();}, 6000);

setTimeout(connectionShow, 3600, connectionIs);

function connectionShow(status) {
  if (status) {
    connectionDiv.style.zIndex = 0;
    connectionDiv.style.opacity = 0;
  } else {
    connectionDiv.style.zIndex = 2;
    connectionDiv.style.opacity = 1;
  }
}

setTimeout(() => {
  containerDiv.style.display = 'block';
  containerDiv.style.opacity = 1;
  avatarsArr.forEach(img => {
    containerDiv.innerHTML += `<img src="${img}">`;
  })
}, 6000);
