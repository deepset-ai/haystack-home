// Handles newsletter submission
export const newsletters = () => {
  const forms = document.querySelectorAll(".js-newsletter-form");

  if (forms.length > 0) {
    // Regex string to validate email
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;

    forms.forEach((form) => {
      // Listen to input, validate email, disable/enable submit btn
      form.addEventListener("input", (e) => {
        if (re.test(e.target.value)) {
          form.classList.remove("disabled");
          form[1].disabled = false;
        } else {
          form.classList.add("disabled");
          form[1].disabled = true;
        }
      });

      // Submit
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const res = await fetch(
          "https://api.hsforms.com/submissions/v3/integration/submit/4561480/103aed2c-3c5d-4889-b029-46d289857db3",
          {
            body: JSON.stringify({
              fields: [{ name: "email", value: e.target.email.value }],
            }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          }
        );

        const result = await res.json();

        if (result.status === "error") {
          e.target.reset();
          e.target.email.placeholder = "Error processing request.";
          form.classList.add("disabled");
        } else {
          form.classList.add("success");
          setTimeout(() => {
            form.classList.add("visible");
          }, 250);
        }
      });
    });
  }
};