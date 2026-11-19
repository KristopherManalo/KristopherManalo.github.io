// Alternative Contact modal (see scripts/alternative-contact.js)
// document.addEventListener('DOMContentLoaded', function () {
export function initializeContact(header) {
  const overlay = header.querySelector('#alternativeContactModal');
  const form = header.querySelector('#alternativeContactForm');
  const openBtn = header.querySelector('#alternativeContactBtn');
  const closeBtn = header.querySelector('#contactModalClose');
  const cancelBtn = header.querySelector('#contactModalCancel');
  // const overlay = document.getElementById('alternativeContactModal');
  // const form = document.getElementById('alternativeContactForm');
  // const openBtn = document.getElementById('alternativeContactBtn');
  // const closeBtn = document.getElementById('contactModalClose');
  // const cancelBtn = document.getElementById('contactModalCancel');

  const CONTACT_API = "https://gvpckykxjkxzduhfedh5gxrf6u0xyhss.lambda-url.us-east-2.on.aws/";

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');
  const status = document.getElementById('contactFormStatus');

  function closeModal() {
    if (overlay) overlay.hidden = true;
  }

  function openModal() {
    if (!overlay) return;

    overlay.hidden = false;
    document.getElementById('contactName').focus();
  }

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  // Clicking the backdrop closes the dialog
  overlay?.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
    });

  // Escape closes the dialog
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closeModal();
  });

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');

    const submission = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      subject: subjectInput.value.trim(),
      message: messageInput.value.trim()
    };

    submitBtn.disabled = true;
    status.textContent = "Sending messsage...";
    status.dataset.state = "loading";

    try {
      const response = await fetch(CONTACT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(submission)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to send message.");
      }

      status.textContent = "Message sent successfully.";
      status.dataset.state = "success";

      form.reset();
    }
    catch (error) {
      console.error("Contact submission failed:", error);
      status.textContent = 
        "Unable to send your message. Please email me directly "
        + " or  try again later.";
    }
    finally {
      submitBtn.disabled = false;
    }
  });
// });
};
