

function toggleSendButton() {
    const messageInput = document.getElementById('messageInputId');
    const imageInput = document.getElementById('imageInput');
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = messageInput.value.trim().length === 0 && imageInput.files.length === 0;
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
        const messageData = {
            message: inputValue,
            sender: username,
            color: color,
            date: currentDate.toISOString(),
        };
        socket.emit('chat message', messageData);
        document.getElementById('messageInputId').value = '';
    }
}

document.getElementById('imageInput').addEventListener('change', () => {
    toggleSendButton();
});

function playAudio(audioId) {
    const audio = document.getElementById(audioId);
    audio.play();
}

const socket = io();
let username;
let color;

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
        customClass: {
            popup: 'small-swal',
        },
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

function toggleSendButton() {
    const messageInput = document.getElementById('messageInputId');
    const imageInput = document.getElementById('imageInput');
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = messageInput.value.trim().length === 0 && imageInput.files.length === 0;
}

socket.on('user connected', (user) => {
    playAudio('userConnectedAudio');

    Swal.fire({
        title: 'User Connected',
        text: `${user.username} has joined the chat!`,
        position: 'top-end',
        showConfirmButton: false,
        customClass: {
            popup: 'small-swal',
        },
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
        customClass: {
            popup: 'small-swal',
        },
    });
});