let deck = [];
let cemetery = [];
let currentCard = null;

// Adicionar cartas (múltiplas)
function addCard() {
  const input = document.getElementById('cardInput');
  if (!input) return;

  const files = Array.from(input.files || []);
  if (!files.length) return alert('Selecione ao menos uma imagem!');

  if (deck.length + (currentCard ? 1 : 0) + cemetery.length + files.length > 120)
    return alert('Limite de 120 cartas atingido!');

  for (const f of files) {
    const url = URL.createObjectURL(f);
    deck.push(url);
  }

  input.value = '';
  updateDeckCount();
  alert(`${files.length} carta(s) adicionada(s)!`);
}

// Contagem de cartas
function updateDeckCount() {
  const span = document.getElementById('deckCount');
  if (span) span.textContent = deck.length + (currentCard ? 1 : 0) + cemetery.length;
}

// Nova partida
function novaPartida() {
  deck = [];
  cemetery = [];
  currentCard = null;
  updateDeckCount();
  alert("Nova partida iniciada! Deck e cemitério zerados.");
}

// Começar jogo (mostra seção jogar)
function startGame() {
  if (deck.length === 0) return alert('Adicione cartas antes de jogar!');
  document.getElementById('homeSection').style.display = 'none';
  document.getElementById('gameSection').style.display = 'block';
  displayCurrentCard();
  updateCemeteryDisplay();
}

// Voltar para home
function goHome() {
  document.getElementById('gameSection').style.display = 'none';
  document.getElementById('homeSection').style.display = 'block';
}

// Shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Próxima carta
function nextCard() {
  if (deck.length === 0) return alert('Deck vazio!');
  if (currentCard) cemetery.push(currentCard);
  shuffle(deck);
  currentCard = deck.shift();
  displayCurrentCard();
  updateCemeteryDisplay();
  updateDeckCount();
}

// Exibir carta atual
function displayCurrentCard() {
  const container = document.getElementById('currentCard');
  if (!container) return;

  container.innerHTML = '';
  if (currentCard) {
    const img = document.createElement('img');
    img.src = currentCard;
    container.appendChild(img);
  } else {
    container.textContent = 'Nenhuma carta revelada ainda.';
  }
}

// Mostrar/ocultar cemitério
function toggleCemetery() {
  const cem = document.getElementById('cemiterio');
  if (cem) cem.style.display = cem.style.display === 'none' ? 'block' : 'none';
}

// Atualizar cemitério
function updateCemeteryDisplay() {
  const list = document.getElementById('cemiterioList');
  if (!list) return;
  list.innerHTML = '';

  cemetery.forEach((card, idx) => {
    const div = document.createElement('div');
    div.className = 'card';
    const img = document.createElement('img');
    img.src = card;
    div.appendChild(img);
    div.onclick = () => {
      deck.unshift(card);
      cemetery.splice(idx, 1);
      updateCemeteryDisplay();
      updateDeckCount();
      alert('Carta voltou para o topo do deck!');
    };
    list.appendChild(div);
  });
}

// Inicializa contagem
document.addEventListener('DOMContentLoaded', () => {
  updateDeckCount();
});
