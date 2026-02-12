(function () {
  const GEMINI_API_KEY = 'AIzaSyCmlGYGR-4fZw7wiNB4EBEXwfnXJXhWIW4';
  const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

  const messagesEl = document.getElementById('messages');
  const placeholderEl = document.getElementById('placeholder');
  const userInputEl = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const errorMsgEl = document.getElementById('errorMsg');

  addMessage('assistant', "Hello! I'm the CAPC AI Assistant, I can help you with Information about parasites, preventive care, and veterinary resources. How can I assist you today?");

  function hidePlaceholder() {
    if (placeholderEl) placeholderEl.style.display = 'none';
  }

  function showError(msg) {
    errorMsgEl.textContent = msg;
    errorMsgEl.style.display = 'block';
    setTimeout(function () {
      errorMsgEl.style.display = 'none';
    }, 6000);
  }

  function addMessage(role, text) {
    hidePlaceholder();
    const div = document.createElement('div');
    div.className = 'message ' + role;
    div.innerHTML = '<div class="label">' + (role === 'user' ? 'You' : 'CAPC Assistant') + '</div><div class="text"></div>';
    div.querySelector('.text').textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function addTypingIndicator() {
    hidePlaceholder();
    const div = document.createElement('div');
    div.className = 'message assistant';
    div.id = 'typingIndicator';
    div.innerHTML = '<div class="label">CAPC Assistant</div><div class="typing"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function setLoading(loading) {
    sendBtn.disabled = loading;
    userInputEl.disabled = loading;
  }

  userInputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  sendBtn.addEventListener('click', function () {
    const query = (userInputEl.value || '').trim();
    if (!query) return;

    addMessage('user', query);
    userInputEl.value = '';
    addTypingIndicator();
    setLoading(true);
    errorMsgEl.style.display = 'none';

    fetch(GEMINI_URL + '?key=' + encodeURIComponent(GEMINI_API_KEY), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }]
      })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error?.message || 'Request failed');
          return data;
        });
      })
      .then(function (data) {
        removeTypingIndicator();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          addMessage('assistant', text.trim());
        } else {
          addMessage('assistant', 'No response was generated. Please try again.');
        }
      })
      .catch(function (err) {
        removeTypingIndicator();
        showError(err.message || 'Something went wrong. Please try again.');
        addMessage('assistant', 'Sorry, I couldn\'t process that. Please check your connection and try again.');
      })
      .finally(function () {
        setLoading(false);
        userInputEl.focus();
      });
  });
})();
