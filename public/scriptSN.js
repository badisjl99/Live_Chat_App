const socket = io();
let username;
let color;

function toggleSendButton() {
    const messageInput = document.getElementById('messageInputId');
    const imageInput = document.getElementById('imageInput');
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = messageInput.value.trim().length === 0 && imageInput.files.length === 0;
}


function containsRepetitiveWords(message) {
    const words = message.toLowerCase().split(/\s+/);
    const wordCount = {};

    for (const word of words) {
        wordCount[word] = (wordCount[word] || 0) + 1;
        if (wordCount[word] >= 6) {
            return true; 
        }
    }

    return false;
}

function containsBadWords(message) {
    const badWords = [
        'arse', 
        'arsehead', 
        'arsehole', 
        'ass', 
        'asshole', 
        'bastard', 
        'bitch', 
        'bloody', 
        'bollocks', 
        'brotherfucker', 
        'bugger', 
        'bullshit', 
        'child-fucker', 
        'Christ on a bike', 
        'Christ on a cracker', 
        'cock', 
        'cocksucker', 
        'crap', 
        'cunt', 
        'cyka blyat', 
        'damn', 
        'damn it', 
        'dick', 
        'dickhead', 
        'dyke', 
        'fatherfucker', 
        'frigger', 
        'fuck', 
        'goddamn', 
        'godsdamn', 
        'hell', 
        'holy shit', 
        'horseshit', 
        'in shit', 
        'Jesus Christ', 
        'Jesus fuck', 
        'Jesus H. Christ', 
        'Jesus Harold Christ', 
        'Jesus, Mary and Joseph', 
        'Jesus wept', 
        'kike', 
        'motherfucker', 
        'nigga', 
        'nigra', 
        'pigfucker', 
        'piss', 
        'prick', 
        'pussy', 
        'shit', 
        'shit ass', 
        'shite', 
        'sisterfucker', 
        'slut', 
        'son of a whore', 
        'son of a bitch', 
        'spastic', 
        'sweet Jesus', 
        'turd', 
        'twat', 
        'wanker'
    ];
    
    const regex = new RegExp(`\\b(?:${badWords.join('|')})\\b`, 'i');

    return regex.test(message);
}




 function isSpam(message) {

    if (containsRepetitiveWords(message) || containsBadWords(message)) {
        return true;
    }

    return false;
}


function sendMessage() {
    const inputValue = document.getElementById('messageInputId').value;
    const imageInput = document.getElementById('imageInput');
    const currentDate = new Date();

    if (imageInput.files.length > 0) {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            const imageData = fileReader.result.split(',')[1];
            const messageData = {
                message: inputValue,
                sender: username,
                color: color,
                date: currentDate.toISOString(),
                image: imageData,
            };
            socket.emit('chat message', messageData);
            document.getElementById('messageInputId').value = '';
            imageInput.value = '';
        };
        fileReader.readAsDataURL(imageInput.files[0]);
    } else {
        if (isSpam(inputValue)) {
            const spamListItem = createSpamListItem(username, inputValue, currentDate.toISOString());
            document.getElementById('messageList').appendChild(spamListItem);

       
        } else {
            const messageData = {
                message: inputValue,
                sender: username,
                color: color,
                date: currentDate.toISOString(),
            };
            socket.emit('chat message', messageData);
        }

        document.getElementById('messageInputId').value = '';
    }
}

function createSpamListItem(sender, message, date) {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';

    const formattedDate = new Date(date);
    const formattedTime = formattedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const senderSpan = document.createElement('span');
    senderSpan.style.color = color;
    senderSpan.style.fontWeight = 'bold';
    senderSpan.textContent = sender;

    const messageSpan = document.createElement('span');
    messageSpan.style.fontSize = 'larger';
    messageSpan.textContent = `:  ${message}`;

    const dateSpan = document.createElement('span');
    dateSpan.style.float = 'right';
    dateSpan.textContent = formattedTime;

    const spamTag = document.createElement('span');
    spamTag.style.color = 'red';
    spamTag.style.fontWeight = 'bold' ;
    spamTag.textContent = ' SPAM';

    listItem.appendChild(senderSpan);
    listItem.appendChild(messageSpan);
    listItem.appendChild(dateSpan);
    listItem.appendChild(spamTag);

    return listItem;
}

document.getElementById('imageInput').addEventListener('change', () => {
    toggleSendButton();
});

function playAudio(audioId) {
    const audio = document.getElementById(audioId);
    audio.play();
}

socket.on('assign user info', (userInfo) => {
    username = userInfo.username;
    color = userInfo.color;
});

socket.on('update connected users', (users) => {
    const connectedUsersList = document.getElementById('connectedUsersList');
    connectedUsersList.innerHTML = '';

    for (const user of users) {
        const userItem = document.createElement('li');
        userItem.className = 'list-group-item';
        userItem.textContent = user.username;
        userItem.style.color = user.color;
        connectedUsersList.appendChild(userItem);
    }

    const onlineUsersCount = document.getElementById('onlineUsersCount');
    onlineUsersCount.textContent = `Online Users: ${users.length}`;
});

socket.on('connectionRejected', () => {
    Swal.fire({
        icon: 'error',
        title: 'Connection Rejected',
        text: 'You are already connected. Please close the existing tab/window.',
        customClass: { popup: 'small-swal' },
    });
});

socket.on('chat message', (data) => {
    playAudio('newMessageAudio');
    const { message, sender, color, date, image } = data;
    const messageList = document.getElementById('messageList');
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item';

    const formattedDate = new Date(date);
    const formattedTime = formattedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const senderSpan = document.createElement('span');
    senderSpan.style.color = color;
    senderSpan.style.fontWeight = 'bold';
    senderSpan.textContent = sender;

    const messageSpan = document.createElement('span');
    messageSpan.style.fontSize = 'larger';
    messageSpan.textContent = `:  ${message}`;

    const dateSpan = document.createElement('span');
    dateSpan.style.float = 'right';
    dateSpan.textContent = formattedTime;

    listItem.appendChild(senderSpan);
    listItem.appendChild(messageSpan);
    listItem.appendChild(dateSpan);

    if (image) {
        const imageElement = document.createElement('button');
        imageElement.classList.add('btn', 'btn-light', 'sent-image');
        imageElement.setAttribute('data-bs-toggle', 'modal');
        imageElement.setAttribute('data-bs-target', '#imageModal');
        imageElement.addEventListener('click', () => showImageInModal(image));
        imageElement.textContent = 'View Image';
        listItem.appendChild(imageElement);
    }

    messageList.appendChild(listItem);
});

function showImageInModal(imageData) {
    const previewImage = document.getElementById('previewImage');
    previewImage.src = `data:image/jpeg;base64,${imageData}`;

    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    imageModal.show();
}

function openImageModal(imageData) {
    const previewImage = document.getElementById('previewImage');
    previewImage.src = imageData;

    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    imageModal.show();
}

socket.on('user connected', (user) => {
    playAudio('userConnectedAudio');

    Swal.fire({
        title: 'User Connected',
        text: `${user.username} has joined the chat!`,
        position: 'top-end',
        showConfirmButton: false,
        customClass: { popup: 'small-swal' },
    });
});

socket.on('user disconnected', (user) => {
    playAudio('userDisconnectedAudio');

    Swal.fire({
        icon: 'warning',
        title: 'User Disconnected',
        text: `${user.username} has left the chat.`,
        position: 'top-end',
        showConfirmButton: false,
        customClass: { popup: 'small-swal' },
    });
});
