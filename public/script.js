const socket = io();
let replyTo = null;

// Set username
const username = prompt('Enter your username:') || 'Anonymous';
socket.emit('set username', username);

// Send message
document.getElementById('sendButton').addEventListener('click', () => {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (text) {
    socket.emit('chat message', { text, username, replyTo });
    input.value = '';
    replyTo = null;
    document.getElementById('replyContainer').style.display = 'none';
  }
});

// Send file
document.getElementById('fileButton').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('file upload', { file: reader.result, filename: file.name, username });
    };
    reader.readAsDataURL(file);
  }
});

// Receive messages
socket.on('chat message', (data) => addMessage(data));
socket.on('reply message', (data) => addMessage(data, true));
socket.on('file upload', (data) => addFile(data));

// Typing indicator
document.getElementById('messageInput').addEventListener('input', () => {
  socket.emit('typing', true);
  setTimeout(() => socket.emit('typing', false), 1000);
});

socket.on('typing', (isTyping) => {
  const indicator = document.getElementById('typingIndicator');
  indicator.style.display = isTyping ? 'block' : 'none';
});

// Update online users
socket.on('update users', (users) => {
  const onlineUsers = document.getElementById('onlineUsers');
  onlineUsers.innerHTML = `Online: ${Object.values(users).map((u) => u.username).join(', ')}`;
});

// Helper functions
function addMessage(data, isReply = false) {
  const container = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `message ${isReply ? 'reply' : ''}`;
  div.style.color = data.color;
  div.innerHTML = `<span class="meta">${data.username} (${data.timestamp})</span><br>${data.text}`;
  div.addEventListener('click', () => setReply(data));
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function addFile(data) {
  const container = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'message';
  div.innerHTML = `<span class="meta">${data.username}</span><br><a href="${data.file}" download="${data.filename}">${data.filename}</a>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function setReply(data) {
  replyTo = data.username;
  document.getElementById('replyTo').innerText = replyTo;
  document.getElementById('replyContainer').style.display = 'block';
}
