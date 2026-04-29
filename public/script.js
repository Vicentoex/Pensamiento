const selectedCards = new Map();

function setSelectedCard(roundId, card) {
  const previous = selectedCards.get(roundId);
  if (previous) {
    previous.classList.remove('selected');
  }

  card.classList.remove('wrong-choice');
  card.classList.add('selected');
  selectedCards.set(roundId, card);
}

function playResultSound(isCorrect) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = isCorrect ? 'triangle' : 'sawtooth';
  oscillator.frequency.setValueAtTime(isCorrect ? 660 : 220, audioContext.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5);
}

function showResultOverlay(isCorrect) {
  const overlay = document.getElementById('resultOverlay');
  const icon = document.getElementById('resultIcon');
  const title = document.getElementById('resultTitle');
  const message = document.getElementById('resultMessage');

  overlay.classList.remove('success', 'error');
  overlay.classList.add(isCorrect ? 'success' : 'error');
  icon.textContent = isCorrect ? '✓' : '✕';
  title.textContent = isCorrect ? '¡Acierto!' : 'No era el impostor';
  message.textContent = isCorrect
    ? 'Habéis señalado correctamente la opinión disfrazada de hecho.'
    : 'La afirmación elegida era un hecho. Volved a intentarlo.';

  overlay.hidden = false;
  document.body.classList.add('result-locked');
  playResultSound(isCorrect);
}

function initializeRound(roundId, containerId, buttonId, explainLinkId) {
  const container = document.getElementById(containerId);
  const revealButton = document.getElementById(buttonId);

  if (!container || !revealButton) {
    return;
  }

  const cards = Array.from(container.querySelectorAll('.selectable-card'));
  cards.forEach((card) => {
    card.addEventListener('click', () => setSelectedCard(roundId, card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setSelectedCard(roundId, card);
      }
    });
  });

  revealButton.addEventListener('click', () => {
    const selectedCard = selectedCards.get(roundId);
    if (!selectedCard) {
      window.alert('Selecciona una afirmación antes de pulsar "Revelar Impostor".');
      return;
    }

    const isCorrect = selectedCard.dataset.impostor === 'true';
    selectedCard.classList.add(isCorrect ? 'impostor-found' : 'wrong-choice');
    showResultOverlay(isCorrect);

    if (explainLinkId) {
      const explainLink = document.getElementById(explainLinkId);
      if (explainLink) explainLink.hidden = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeRound('round1', 'round1Container', 'revealRound1Btn', 'explainRound1Link');
  initializeRound('round2', 'round2Container', 'revealRound2Btn', 'explainRound2Link');

  const closeButton = document.getElementById('closeResultOverlayBtn');
  const overlay = document.getElementById('resultOverlay');

  closeButton.addEventListener('click', () => {
    overlay.hidden = true;
    overlay.classList.remove('success', 'error');
    document.body.classList.remove('result-locked');
  });
});
