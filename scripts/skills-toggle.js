// Toggle graphics & hardware additional resources
const toggleBtn = document.querySelector('.expand-toggle');

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    toggleBtn.classList.toggle('expanded-button', !isExpanded);
  });
}
