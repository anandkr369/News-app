import 'dotenv/config';
document.addEventListener('DOMContentLoaded', () => {
  const messages = document.getElementById('messages');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const yearSpan = document.getElementById('year');
  yearSpan.textContent = new Date().getFullYear();

  sendButton.addEventListener('click', () => {
    const userMessage = messageInput.value.trim();
    if (userMessage) {
      addMessage('User', userMessage);
      messageInput.value = '';
      fetchResponse(userMessage);
    }
  });

  function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender.toLowerCase());
    messageElement.textContent = `${sender}: ${message}`;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
  }

  async function fetchResponse(userMessage) {
    const requestBody = {
      contents: [
        {
          parts: [{ text: userMessage }]
        }
      ]
    };

    console.log('Request body:', JSON.stringify(requestBody));

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINAI_SK}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.candidates && data.candidates.length > 0) {
        addMessage('Bot', data.candidates[0].content.parts[0].text);
      } else {
        addMessage('Bot', 'I\'m not sure how to respond to that.');
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      addMessage('Bot', 'There was an error processing your request.');
    }
  }
});
