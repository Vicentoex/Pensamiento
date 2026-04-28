let shown = false;

function toggleAnswers() {
  shown = !shown;
  const cards = document.getElementById('cardsContainer');
  const reserve = document.getElementById('reserveContainer');
  const btn = document.getElementById('toggleBtn');
  
  if (shown) {
    cards.classList.add('show-answers');
    reserve.classList.add('show-answers');
    btn.textContent = 'Ocultar impostor';
  } else {
    cards.classList.remove('show-answers');
    reserve.classList.remove('show-answers');
    btn.textContent = 'Revelar impostor (solo docente)';
  }
}

// Add event listener correctly after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleAnswers);
  }
});
