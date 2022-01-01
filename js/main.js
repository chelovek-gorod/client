'use strict'

// CONNECTION

const socketURL = 'wss://mars-chat-server.herokuapp.com' // 'ws://localhost:9000'
const connectionTimeout = 6000;

let connectionIs = false;
let registrationIs = false;

function connection() {
  console.log('--connection request--');

  let socket = new WebSocket(socketURL);

  socket.onopen = function () {
    console.log('socket on open');
    connectionIs = true;
    connectionShow(connectionIs);

    socket.send(JSON.stringify({ action: 'firstConnect' }));
  
    setTimeout(connectionTest, connectionTimeout);
  };
  
  socket.onmessage = function (message) {
    let { action, data } = JSON.parse(message.data);
    switch (action) {
      case 'firstConnect' : getConnectionStart(data); break;
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

function getConnectionStart(usedAvatarsArr) {
  console.group('--connection start--');
  console.log('used avatars array:');
  console.log(usedAvatarsArr);
  console.groupEnd();

  registration(usedAvatarsArr);
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

const connectionDiv = document.getElementById('connection');
const containerDiv = document.getElementById('container');

let userNickName = '';
let avatarImgPath = 'src/avatars/';
let avatarImgType = '.png';
let avatarsArr = ['antman', 'captan', 'dragonfly', 'draks', 'falcon', 'hawkeye', 'gamora', 'groot', 'halk',
  'ironman', 'loki', 'mantis', 'marvel', 'mech', 'mercury', 'nebula', 'panther', 'piter', 'rocket',
  'romanov', 'spiderman', 'strange', 'tanas', 'thor', 'vision', 'wanda', 'yondu'
];

let avatarsNames = ['Человек-Муровей', 'Капитан Америка', 'Стрекоза', 'Дракс', 'Сокол', 'Ястребиный глаз', 'Гамора', 'Грут', 'Халк',
  'Тони Старк', 'Локи', 'Мантис', 'Капитан Марвел', 'Альтрон', 'Ртуть', 'Небула', 'Черноя Пантера', 'Звездный лорд', 'Ракета',
  'Наташа Романов', 'Человек-Паук', 'Доктор Стрендж', 'Танас', 'Тор', 'Вижен', 'Ванда', 'Йонду'
];

setTimeout(() => {
  document.getElementById('logo').remove();
  connectionShow(connectionIs);
  connection();
}, 6000);

function connectionShow(status) {
  if (status) {
    connectionDiv.style.display = 'none';
    containerDiv.style.display = 'block';
  }
  else {
    connectionDiv.style.display = 'block';
    containerDiv.style.display = 'none';
  }
}

function registration (usedAvatarsArr) {
  let titleDiv = document.createElement("div");
  titleDiv.id = 'avatarsTitle';
  titleDiv.innerText = 'Выберете Аватарку';
  containerDiv.append(titleDiv);

  let avatarsDiv = document.createElement("div");
  avatarsDiv.id = 'avatars';
  containerDiv.append(avatarsDiv);

  let nickNameInput = document.createElement("input");
  nickNameInput.id = 'nickName';
  containerDiv.append(nickNameInput);

  let registrationButton = document.createElement("button");
  registrationButton.id = 'registration';
  registrationButton.innerHTML = 'Регистрация';
  containerDiv.append(registrationButton);

  fillAvatarsDiv(avatarsDiv, nickNameInput, usedAvatarsArr);

}

function fillAvatarsDiv(div, input, disableAvatars) {
  div.innerHTML = '';

  let avatarsImgArr = [];
  let chosenAvatar;

  avatarsArr.forEach((img, index) => {
    let disable = ~disableAvatars.indexOf(img);
    
    let avatarImg = document.createElement('img');
    avatarImg.src = avatarImgPath + img + avatarImgType;
    if (disable) avatarImg.className = 'disable';
    else avatarImg.onclick = function() {
      if (chosenAvatar) chosenAvatar.classList.remove('choose');
      chosenAvatar = this;
      this.classList.add('choose');
      input.value = avatarsNames[index];
    };
    avatarsImgArr.push(avatarImg);
    div.append(avatarImg);
  });
}
