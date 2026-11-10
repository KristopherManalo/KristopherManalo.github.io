// Memory menu toggle behavior.
document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("memory-menu-toggle");
    const panel = document.getElementById("memory-menu-panel");

    if (!toggle || !panel) return;

    // Toggle the panel open/closed.
    toggle.addEventListener("click", function () {
        const open = panel.hidden !== true;
        panel.hidden = open;
        toggle.setAttribute("aria-expanded", String(open));
    });

});