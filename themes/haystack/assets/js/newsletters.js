// Handles newsletter submission
const DEFAULT_HUBSPOT_PORTAL_ID = "4561480";
const DEFAULT_HUBSPOT_FORM_ID = "6256f9c8-3243-45a9-ac59-72b2ab077622";

const hubspotSubmitUrl = (form) => {
  const portalId = form.dataset.hubspotPortalId || DEFAULT_HUBSPOT_PORTAL_ID;
  const formId = form.dataset.hubspotFormId || DEFAULT_HUBSPOT_FORM_ID;
  const region = form.dataset.hubspotRegion || "na1";
  const host = region === "eu1" ? "api.hsforms.eu" : "api.hsforms.com";

  return `https://${host}/submissions/v3/integration/submit/${portalId}/${formId}`;
};

export const newsletters = () => {
  const forms = document.querySelectorAll(".js-newsletter-form");

  if (forms.length > 0) {
    // Regex string to validate email
    const re = /^[\w.+-]+@[\w.-]+\.[\w]{2,}$/;

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
        const res = await fetch(hubspotSubmitUrl(form), {
          body: JSON.stringify({
            fields: [{ name: "email", value: e.target.email.value }],
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });

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
