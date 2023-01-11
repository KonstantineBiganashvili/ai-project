import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

const loader = (el) => {
  el.innerText = '';

  loadInterval = setInterval(() => {
    el.innerText += '.';

    if (el.innerText === '....') {
      el.innerText = '';
    }
  }, 300);
};

const typeText = (el, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      el.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
};

const generateUniqueID = () => {
  const timestamp = Date.now();
  const randNumber = Math.random();
  const hexString = randNumber.toString(16);

  return `id-${timestamp}-${hexString}`;
};

const chatStripe = (isAi, val, uniqueID) => {
  return `
    <div class='wrapper ${isAi && 'ai'}'>
      <div class='chat'>
        <div class="profile">
          <img 
            src='${isAi ? bot : user}'
            alt='${isAi ? 'bot' : 'user'}'
          />
        </div> 
        <div class="message" id=${uniqueID}>${val}</div>
      </div>
    </div> 
    `;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  const uniqueID = generateUniqueID();

  chatContainer.innerHTML += chatStripe(true, ' ', uniqueID);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueID);

  loader(messageDiv);

  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = ' ';

  if (response.ok) {
    const data = await response.json();
    const parsed = data.bot.trim();

    typeText(messageDiv, parsed);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = 'რაღაც პრობლემა წარმოიქმნა...';
    alert(err);
  }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
