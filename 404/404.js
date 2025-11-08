// menu mobel-------------------------
const menuToggle = document.getElementById('menuToggle');
const popupMenu = document.getElementById('popupMenu');

menuToggle.addEventListener('click', () => {
  popupMenu.style.display = (popupMenu.style.display === 'block' ? 'none' : 'block');
});


document.addEventListener('click', (event) => {
  if (!menuToggle.contains(event.target) && !popupMenu.contains(event.target)) {
    popupMenu.style.display = 'none';
  }
});
// menu mobel-------------------------