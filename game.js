(() => {
  const rounds = [
    {
      question: "I was hoping you'd stay a little longer. What would you like to talk about?",
      mood: "a little sleepy, very glad you're here",
      options: [
        { text: "Ask what made her smile today", tone: "Thoughtful", reply: "Mira's eyes brighten. “The tiny bakery downstairs gave me the last strawberry tart. I saved half for tomorrow.”", points: 1 },
        { text: "Ask about her favorite constellation", tone: "Curious", reply: "“Cassiopeia,” she says, tracing its shape in the air. “It looks like a little crown.”", points: 1 },
        { text: "Tell her the room feels peaceful", tone: "Gentle", reply: "She relaxes into the pillow. “It does, doesn't it? I like how the rain makes everything slow down.”", points: 1 }
      ]
    },
    {
      question: "If you could go anywhere for one perfect day, where would you go?",
      mood: "her voice grows more animated",
      options: [
        { text: "A quiet seaside town", tone: "Dream together", reply: "“A little seaside town with a bookshop and no schedule,” she says. “We'd find the best place for hot chocolate.”", points: 1 },
        { text: "Ask what she would choose", tone: "Let her lead", reply: "“Somewhere new, but not too crowded. And I'd want good company more than a fancy view.” She smiles at you.", points: 1 },
        { text: "A stargazing trip in the hills", tone: "Make a plan", reply: "Her face lights up. “Blankets, thermoses, a sky full of stars. We should really do that sometime.”", points: 1 }
      ]
    },
    {
      question: "There's something I've been wanting to ask you…",
      mood: "a little bashful, but comfortable",
      options: [
        { text: "What helps you feel understood?", tone: "Listen closely", reply: "“When someone lets me finish, even if I'm taking the scenic route,” Mira says. “Thank you for asking.”", points: 1 },
        { text: "What are you proud of lately?", tone: "Encouraging", reply: "“I finally sent my illustrations to a little magazine. I was scared, but I did it.” Her smile turns quietly proud.", points: 1 },
        { text: "Is there anything on your mind?", tone: "Give her space", reply: "“Mostly good things tonight.” She pauses. “It feels nice to know I can talk when I need to.”", points: 1 }
      ]
    },
    {
      question: "I found an old photo earlier. It reminded me of a story…",
      mood: "happily lost in a memory",
      options: [
        { text: "Ask her to tell you the whole story", tone: "Be present", reply: "She tells you about a rainy train ride, a lost umbrella, and a stranger who shared their snacks. The story is better with every detail.", points: 1 },
        { text: "What did you learn from that day?", tone: "Reflect together", reply: "“That a small kindness can change the whole mood of a day,” she says. “I've tried to remember that.”", points: 1 },
        { text: "Share a favorite memory of yours", tone: "Trade stories", reply: "Mira listens with her chin in her hands. “I love that you told me that. I can picture it perfectly.”", points: 1 }
      ]
    },
    {
      question: "Do you ever wonder what the next year might bring?",
      mood: "thoughtful and quietly hopeful",
      options: [
        { text: "Ask what she hopes to make", tone: "Cheer her on", reply: "“A little illustrated book of ordinary, lovely things,” she says. “Maybe I can show you the first sketches soon.”", points: 1 },
        { text: "Tell her it's okay not to have it figured out", tone: "Reassure her", reply: "Mira gives a grateful nod. “I needed to hear that. We can take things one day at a time.”", points: 1 },
        { text: "Ask what would make tomorrow nice", tone: "Start small", reply: "“A slow breakfast, maybe a walk if the rain stops.” She grins. “And a message from you.”", points: 1 }
      ]
    },
    {
      question: "It's getting late. What should we remember about tonight?",
      mood: "warm, with a hint of goodbye",
      options: [
        { text: "That we can always make time to talk", tone: "A kind promise", reply: "“I like that promise,” she says softly. “Let's not wait so long before the next one.”", points: 1 },
        { text: "The strawberry tart and the stars", tone: "Keep the little things", reply: "“The best kind of evening is made of little things,” Mira says. “I'm glad we got to share them.”", points: 1 },
        { text: "Ask if she'd like another quiet evening soon", tone: "Make another plan", reply: "“I'd really like that.” She smiles and waves as you get ready to go. “Goodnight. Get home safe.”", points: 1 }
      ]
    }
  ];
  const storageKey = 'moonlit-letters-save-v1';
  const $ = (id) => document.getElementById(id);
  const dialogue = $('dialogue');
  const choices = $('choices');
  let state = load();
  let toastTimer;

  function freshState() { return { round: 0, affection: 0, selected: false, reply: '', finished: false }; }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && Number.isInteger(saved.round) && saved.round >= 0 && saved.round <= rounds.length) {
        return { ...freshState(), ...saved, affection: Math.max(0, Math.min(6, saved.affection || 0)) };
      }
    } catch (_) { /* Ignore invalid or unavailable local storage. */ }
    return freshState();
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) { /* Game remains playable without storage. */ }
  }
  function render() {
    const value = Math.min(state.affection, 6);
    $('affection-value').innerHTML = `${value} <small>/ 6</small>`;
    $('meter-fill').style.width = `${(value / 6) * 100}%`;
    $('affection-note').textContent = value >= 5 ? 'A bond built on listening' : value >= 3 ? 'The conversation feels easy' : value >= 1 ? 'A lovely evening is taking shape' : 'A lovely evening is just beginning';
    if (state.finished || state.round >= rounds.length) return renderEnding();
    const round = rounds[state.round];
    $('mood').textContent = round.mood;
    dialogue.textContent = state.selected && state.reply ? state.reply : round.question;
    choices.innerHTML = '';
    if (state.selected) {
      const next = document.createElement('button');
      next.className = 'choice next-choice';
      next.type = 'button';
      next.innerHTML = `Continue the evening <span class="tone">Question ${state.round + 1} of ${rounds.length}</span><span class="arrow">→</span>`;
      next.addEventListener('click', nextRound);
      choices.append(next);
      return;
    }
    round.options.forEach((option) => {
      const button = document.createElement('button');
      button.className = 'choice';
      button.type = 'button';
      button.innerHTML = `${escapeHTML(option.text)}<span class="tone">${escapeHTML(option.tone)}</span><span class="arrow">›</span>`;
      button.addEventListener('click', () => choose(option));
      choices.append(button);
    });
  }
  function choose(option) {
    state.affection = Math.min(6, state.affection + option.points);
    state.selected = true;
    state.reply = option.reply;
    dialogue.style.opacity = '0';
    window.setTimeout(() => { dialogue.style.opacity = '1'; }, 140);
    $('character').classList.add('happy');
    $('heart-pop').classList.remove('pop');
    void $('heart-pop').offsetWidth;
    $('heart-pop').classList.add('pop');
    save();
    render();
  }
  function nextRound() {
    state.round += 1;
    state.selected = false;
    state.reply = '';
    if (state.round >= rounds.length) state.finished = true;
    save();
    render();
  }
  function renderEnding() {
    state.finished = true;
    const ending = state.affection >= 5
      ? { title: 'A promise beneath the moon', mood: 'close friends, with more stories ahead', text: `The rain has softened to a whisper. Mira gives your hand a gentle squeeze before you go. “This was exactly the kind of evening I needed. Let's make more memories together.” A new little ritual begins.` }
      : state.affection >= 3
        ? { title: 'A lovely evening together', mood: 'comfortable and happy', text: `At the door, Mira smiles warmly. “I'm glad we got to talk like this. Next time, you can tell me more about that story of yours.” The night ends with an easy promise to meet again.` }
        : { title: 'A quiet goodnight', mood: 'grateful for the company', text: 'Mira thanks you for spending part of your evening with her. There is no rush; trust takes time, and another conversation is always possible. You leave with a gentle goodnight.' };
    $('mood').textContent = ending.mood;
    dialogue.textContent = ending.text;
    choices.innerHTML = `<div class="ending-card"><span class="ending-kicker">YOUR EVENING WITH MIRA</span><strong>${ending.title}</strong><span>You listened, shared stories, and let the night unfold at its own pace.</span></div>`;
    const replay = document.createElement('button');
    replay.className = 'choice replay-choice';
    replay.type = 'button';
    replay.innerHTML = 'Begin a new evening <span class="arrow">↻</span>';
    replay.addEventListener('click', restart);
    choices.append(replay);
    save();
  }
  function restart() {
    state = freshState();
    save();
    $('character').classList.remove('happy');
    dialogue.style.opacity = '1';
    render();
    showToast('A new evening begins ✦');
  }
  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1800);
  }
  function escapeHTML(value) {
    return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  $('restart').addEventListener('click', restart);
  $('sound-toggle').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const active = button.classList.toggle('active');
    button.setAttribute('aria-pressed', String(active));
    showToast(active ? 'Imagine the soft sound of rain outside ☾' : 'Ambient sound off');
  });
  render();
})();
