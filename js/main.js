'use strict'

// CONNECTION

const socketURL = 'wss://mars-chat-server.herokuapp.com'; // 'ws://localhost:9000' 
const connectionTimeout = 6000;

let connectionIs = false;
let registrationIs = false;

let author = null;

class Message {
  constructor(author, target, message, sticker) {
    this.author = author; // {nickName, avatar}
    this.target = target; // {nickName, avatar}
    this.message = message; // string
    this.sticker = sticker; // data
    this.date = Date.now();
  }
};

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
      case 'firstConnect' : getConnectionStart(data, socket); break;
      case 'registration' : getRegistrationResponse(data, socket); break;
      case 'onConnect' : getOnConnectResponse(data); break;
      case 'newMessage' : getNewMessage(data); break;
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

function getConnectionStart(usedAvatarsArr, socket) {
  console.group('--connection start--');
  console.log('used avatars array:');
  console.log(usedAvatarsArr);
  console.groupEnd();

  registration(usedAvatarsArr, socket);
}

function getOnConnectResponse(data) {
  let {clientSendTime, serverSendTime} = data;
  console.log(`--PingPong[client -> server : ${serverSendTime - clientSendTime}ms; server -> client: ${Date.now() - serverSendTime}ms]--`);
}

function getRegistrationResponse(data, socket) {
  let { registrationIs, avatarIs, nickNameIs, messages } = data;

  if (!registrationIs) {
    socket.send(JSON.stringify({ action: 'firstConnect' }));
    if (!avatarIs) showModalMessage('???????????? ?????? ??????????');
    else if (!nickNameIs) showModalMessage('??????-???????? ?????? ??????????');
    else showModalMessage('???????????? ??????????????????????');
  } else {
    containerDiv.innerHTML = '';

    messageListDiv = document.createElement("div");
    messageListDiv.id = 'messages';
    containerDiv.append(messageListDiv);

    let messageInput = document.createElement("textarea");
    messageInput.id = 'messageInput';
    containerDiv.append(messageInput);
    messageInput.onchange = function() { testInputSticker(this); console.log('--onchange--'); };

    let sendButton = document.createElement("button");
    sendButton.id = 'sendButton';
    sendButton.innerHTML = '??????????????????';
    sendButton.onclick = function() { console.log('--onclick--');
      let messageText = messageInput.value.trim();
      if (!messageText) showModalMessage('???? ???? ?????????? ??????????????????');
      else {
        let message = new Message(author, null, messageText, null);
        messageInput.value = '';
        socket.send(JSON.stringify({ action: 'newMessage', data: message}));
      }
    };
    containerDiv.append(sendButton);

    console.log(messages);
    messages.forEach(messageData => {
      getNewMessage(messageData);
    });
  }
}

let messageListDiv;

function getNewMessage(messageData) {
  let { author, target, message, sticker, date } = messageData;

  let messageDiv = document.createElement("div");

  if(!author) {
    // SYSTEM MESSAGE
    messageDiv.className = 'notification';

    let messageImg = document.createElement("img");
    messageImg.src = avatarImgPath + target.avatar + avatarImgType;
    messageDiv.append(messageImg);

    let messageTxt = document.createElement("span");
    let messageSystemText;
    switch(message) {
      case 'newConnect' : messageSystemText = '???????????? ?? ????????'; break;
      case 'disconnect' : messageSystemText = '??????????????(??) ??????'; break;
      default : messageSystemText = '--';
    }
    console.log(messageSystemText);
    messageTxt.innerHTML = `<span class="nick-name">${target.nickName}</span> ${messageSystemText}`;
    messageDiv.append(messageTxt);

  } else {
    // USER MESSAGE
    messageDiv.className = 'message';
    let messageAuthorAvatar = document.createElement("img");
    messageAuthorAvatar.src = avatarImgPath + author.avatar + avatarImgType;
    messageAuthorAvatar.className = 'avatar';
    messageDiv.append(messageAuthorAvatar);

    let messageAuthorNickName = document.createElement("div");
    messageAuthorNickName.innerText = author.nickName;
    messageAuthorNickName.className = 'nick-name';
    messageDiv.append(messageAuthorNickName);

    let messageContent = document.createElement("div");
    // test sticker code
    if (message[0] === '[' && message[3] === ']') {
      let stickerCode = parseInt(message.substring(1, 3));
      if (stickerCode > -1 && stickerCode < 20) {
        messageContent.innerHTML = `<img src="${stickersPath + stickersCollection[stickerCode] + stickersType}">`;
      } else messageContent.innerText = message;
    } else messageContent.innerText = message;
    // messageContent.innerText = message;
    messageContent.className = 'message-text';
    messageDiv.append(messageContent);

    let messageDate = document.createElement("div");
    messageDate.innerHTML = getDateFromMilliSeconds(date);
    messageDate.className = 'message-date';
    messageDiv.append(messageDate);

  }

  messageListDiv.append(messageDiv);
  /* */
  messageListDiv.scrollTop = messageListDiv.scrollHeight - messageListDiv.clientHeight;
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
let avatarsArr = ['antman', 'captan', 'dragonfly', 'draks', 'falcon', 'fury', 'hawkeye',
  'gamora', 'groot', 'halk', 'ironman', 'loki', 'mantis', 'marvel', 'mech', 'mercury',
  'nebula', 'panther', 'piter', 'rocket', 'romanov', 'spiderman', 'strange', 'tanas',
  'thor', 'vision', 'wanda', 'yondu'
];

let avatarsNames = ['??????????????-??????????????', '?????????????? ??????????????', '????????????????', '??????????', '??????????', '?????? ??????????', '???????????????????? ????????',
  '????????????', '????????', '????????', '???????? ??????????', '????????', '????????????', '?????????????? ????????????', '??????????????', '??????????',
  '????????????', '???????????? ??????????????', '???????????????? ????????', '????????????', '???????????? ??????????????', '??????????????-????????', '???????????? ??????????????', '??????????',
  '??????', '??????????', '??????????', '??????????'
];

let stickersPath = 'src/stickers/';
let stickersType = '.png';
let stickersCollection = ['are-you-sure', 'dont-understand', 'im-a-miracle', 'indeed', 'it-is-funny', 'not-interesting',
  'oh-no', 'really', 'run-away', 'so-it-was', 'this-is-serious', 'time-to-run', 'unexpectedly', 'what-happened-is',
  'what-is-it', 'who-is-brave', 'who-is-write-this', 'wizard', 'wright-words', 'your-last-words'];

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

function registration (usedAvatarsArr, socket) {
  containerDiv.innerHTML = '';

  let avatarsImgArr = [];
  let chosenAvatarNode;
  let chosenAvatarName;

  let titleDiv = document.createElement("div");
  titleDiv.id = 'avatarsTitle';
  titleDiv.innerText = '???????????????? ????????????????';
  containerDiv.append(titleDiv);

  let avatarsDiv = document.createElement("div");
  avatarsDiv.id = 'avatars';
  containerDiv.append(avatarsDiv);

  let nickNameInput = document.createElement("input");
  nickNameInput.type = 'text';
  nickNameInput.id = 'inputNickName';
  containerDiv.append(nickNameInput);

  let registrationButton = document.createElement("button");
  registrationButton.id = 'registrationButton';
  registrationButton.innerHTML = '??????????????????????';
  registrationButton.onclick = function() {
    let nickName = nickNameInput.value.trim();
    //if (!chosenAvatarNode) showModalMessage('???? ???? ?????????????? ????????????');
    if (!chosenAvatarNode) {
      if (nickName.substring(0, 3) === '(A)' || nickName.substring(0, 3) === '(??)') {
        console.group('Registration');
        console.log('chosenAvatar');
        console.log('(A)venger');
        console.groupEnd();

        nickName = nickName.substring(3).trim();
        if (nickName.length < 2 || nickName.length > 20) nickName = 'Avenger (??????-??????????)';

        author = {nickName: nickName, avatar: 'avenger'};
        socket.send(JSON.stringify({ action: 'registration', data: author}));
      } else {
        showModalMessage('???? ???? ?????????????? ????????????');
      }
    }
    else if (!nickName) showModalMessage('???????????? ??????-????????');
    else if (nickName.length < 2) showModalMessage('?????????????? ???????????????? ??????-????????<br>(?????????? ???? 2?? ???? 20???? ????????????????)');
    else if (nickName.length > 20) showModalMessage('?????????????? ?????????????? ??????-????????<br>(?????????? ???? 2?? ???? 20???? ????????????????)');
    else {
      console.group('Registration');
      console.log('chosenAvatar');
      console.log(chosenAvatarName);
      console.groupEnd();

      author = {nickName: nickName, avatar: chosenAvatarName};
      socket.send(JSON.stringify({ action: 'registration', data: author}));
    }
  };
  containerDiv.append(registrationButton);

  avatarsArr.forEach((img, index) => {
    let disable = ~usedAvatarsArr.indexOf(img);
    
    let avatarImg = document.createElement('img');
    avatarImg.src = avatarImgPath + img + avatarImgType;
    if (disable) avatarImg.className = 'disable';
    else avatarImg.onclick = function() {
      if (chosenAvatarNode) chosenAvatarNode.classList.remove('choose');
      chosenAvatarNode = this;
      chosenAvatarName = img;
      this.classList.add('choose');
      nickNameInput.value = avatarsNames[index];
    };
    avatarsImgArr.push(avatarImg);
    avatarsDiv.append(avatarImg);
  });

}

function showModalMessage(message) {
  let modalShell = document.createElement("div");
  modalShell.id = 'modalShell';
  modalShell.className = 'full-screen flex-wrapper';
  modalShell.style.zIndex = 3;
  modalShell.onclick = function() {
    this.style.opacity = 0;
    setTimeout(() => this.remove(), 600);
  };

  let modalMessage = document.createElement("div");
  modalMessage.innerHTML = message;
  modalShell.append(modalMessage);

  document.body.append(modalShell);
}

function getDateFromMilliSeconds(ms) {
  let resultHTML;

  let fullDate = new Date(ms);
  let year = fullDate.getFullYear();
  let month = fullDate.getMonth() + 1;
  if (month < 10) month = '0' + month;
  let date = fullDate.getDate();
  resultHTML = [date, month, year].join(' - ');

  let hours = fullDate.getHours();
  let minutes = fullDate.getMinutes();
  if (minutes < 10) minutes = '0' + minutes;
  resultHTML += `<br><span class="time">${[hours, minutes].join(':')}</span>`;

  let seconds = fullDate.getSeconds();
  if (seconds < 10) seconds = '0' + seconds;
  resultHTML += `<span class="seconds"> ${seconds}</span>`;

  return resultHTML;
}

function testInputSticker(input) {
  let inputText = input.value.trim();
  if (inputText.length < 5 && inputText[0] === '[' && inputText[3] === ']') {
    let stickerCode = parseInt(inputText.substring(1, 3));
    if (stickerCode > -1 && stickerCode < 20) {
      let outPopUpImg = `<img src="${stickersPath + stickersCollection[stickerCode] + stickersType}">`;
      showModalMessage(outPopUpImg);
    }
  }
}
