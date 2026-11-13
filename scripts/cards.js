// Expandable panels.
document.addEventListener('DOMContentLoaded', function () {

  // Project cards: clicking a header toggles the wrapping card.
  document.querySelectorAll('.project-card-header').forEach(function (header) {
    header.addEventListener('click', function () {
      header.closest('.project-card').classList.toggle('expanded');
    });
  });

  // Editor title: clicking the title toggles the collapsible panel just
  // before the editor.
  const titleToggle = document.querySelector('.editor-title-toggle');
  if (titleToggle) {
    const panel = document.querySelector('.editor-collapse-section');
    titleToggle.addEventListener('click', function () {
      panel.classList.toggle('expanded');
      titleToggle.setAttribute('aria-expanded', String(panel.classList.contains('expanded')));
    });
  }
});
