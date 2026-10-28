// Expand button functionality - minimal implementation
document.addEventListener('DOMContentLoaded', function() {
  const expandButton = document.getElementById('expandButton');

  if (expandButton) {
    expandButton.addEventListener('click', function() {
      // Toggle all sections below Graphics & Hardware
      const expandedContent = document.getElementById('expanded-content');
      if (expandedContent) {
        expandedContent.classList.toggle('show');

        // Update button text
        if (expandedContent.classList.contains('show')) {
          this.textContent = 'Additional Skills ▲';
        } else {
          this.textContent = 'Additional Skills ▼';
        }
      }
    });
  }
});
