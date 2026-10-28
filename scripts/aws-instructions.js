/**
 * AWS Lambda Instructions API Client
 * Sends instructions count to an AWS Lambda endpoint and updates the UI with results.
 */

document.getElementById("fetchBtn").addEventListener("click", async () => {
  const resultParagraph = document.getElementById('result');
  resultParagraph.innerText = "sending instruction count owo";

  const url = "https://27irlz5j37nkz2pnm4j2f52ely0inpth.lambda-url.us-east-2.on.aws/";
  const instructionsExecuted = 42;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ instructionsExecuted })
    });

    if (!response.ok) {
      throw new Error('Network did not respond :(');
    }

    const data = await response.json();
    resultParagraph.innerText =
      `Added ${instructionsExecuted} instructions! ` +
      `Global total: ${data.total.toLocaleString()}`;
  } catch (error) {
    console.error("Error:", error);
    resultParagraph.innerText = "Failed to communicate with backend D:";
  }
});
