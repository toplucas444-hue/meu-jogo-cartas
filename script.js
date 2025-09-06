// Usa sessionStorage (zera quando fecha o app/navegador)
const KEY_DECK = 'deck';
const KEY_CEM = 'cemetery';
const KEY_CUR = 'currentCard';

let deck = [];
let cemetery = [];
let currentCard = null;

/* ---------- Persistência (session) ---------- */
function saveState() {
  sessionStorage.setItem(KEY_DECK, JSON.stringify(deck));
  sessionStorage.setItem(KEY_CEM, JSON.stringify(cemetery));
  sessionStorage.setItem(KEY_CUR, currentCard || '');
}

function loadState() {
  try {
    deck = JSON.parse(sessionStorage.getItem(KEY_DECK) || '[]');
    cemetery = JSON.parse(sessionStorage.getItem(KEY_CEM) || '[]');
    const cur = sessionStorage.getItem(KEY_CUR);
    currentCard = cur ? cur : null;
  } catch {
    deck = []; cemetery = []; currentCard = null;
  }
}

/* ---------- Utils ---------- */
function updateDeckCount() {
  const span = document.getElementById('deckCount');
  if (span) span.textContent = deck.length + (currentCard ? 1 : 0) + cemetery.length;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* ---------- Compressão p/ caber no sessionStorage ---------- */
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function resizeDataURL(dataURL, maxW = 900, maxH = 900, quality = 0.85) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const ratio = Math.min(maxW / width, maxH / height, 1);
      if (ratio < 1) {
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      // JPEG reduz bem o tamanho. Se precisar manter transparência, mude para "image/png" (ficará maior).
      const out = canvas.toDataURL('image/jpeg', quality);
      resolve(out);
    };
    img.onerror = () => resolve(dataURL); // fallback
    img.src = dataURL;
  });
}

/* ---------- Ações ---------- */
async function addCard() {
  const input = document.getElementById('cardInput');
  if (!input) return;

  const files = Array.from(input.files || []);
  if (!files.length) return alert('Selecione ao menos uma imagem!');

  const total = deck.length + (currentCard ? 1 : 0) + cemetery.length + files.length;
  if (total > 120) return alert('Limite de 120 cartas atingido!');

  // Lê e comprime todas
  for (const f of files) {
    const raw = await fileToDataURL(f);
    const small = await resizeDataURL(raw, 1000, 1000, 0.8);
    deck.push(small);
  }

  saveState();
  input.value = '';
  updateDeckCount();
  alert(`${files.length} carta(s) adicionada(s)!`);
}

function nextCard() {
  if (deck.length === 0) return alert('Deck vazio!');
  if (currentCard) cemetery.push(currentCard);
  shuffle(deck);
  currentCard = deck.shift();
  saveState();
  displayCurrentCard();
  updateCemeteryDisplay();
  updateDeckCount();
}

function displayCurrentCard() {
  const container = document.getElementById('currentCard');
  if (!container) return;
  container.innerHTML = '';
  if (currentCard) {
    const img = document.createElement('img');
    img.src = currentCard;
    img.alt = 'Carta atual';
    container.appendChild(img);
  } else {
    // Mostra placeholder só quando NÃO há carta
    container.textContent = 'Nenhuma carta revelada ainda.';
  }
}

function toggleCemetery() {
  const cem = document.getElementById('cemiterio');
  if (cem) cem.style.display = cem.style.display === 'none' ? 'block' : 'none';
}

function updateCemeteryDisplay() {
  const list = document.getElementById('cemiterioList');
  if (!list) return;
  list.innerHTML = '';
  cemetery.forEach((card, idx) => {
    const div = document.createElement('div');
    div.className = 'card';
    const img = document.createElement('img');
    img.src = card;
    img.alt = 'Carta do cemitério';
    div.appendChild(img);
    div.onclick = () => {
      deck.unshift(card);
      cemetery.splice(idx, 1);
      saveState();
      updateCemeteryDisplay();
      updateDeckCount();
      alert('Carta voltou para o topo do deck!');
    };
    list.appendChild(div);
  });
}

/* ---------- Inicialização ---------- */
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  updateDeckCount();
  displayCurrentCard();
  updateCemeteryDisplay();
});
