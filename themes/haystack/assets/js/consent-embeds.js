// Loads YouTube and Lu.ma embeds only after consent. See partials/consent-embed.html.
// Reads the Usercentrics service flags ("YouTube Video", "Lu.ma") from the dataLayer
// "consent_status" event, or loads a single embed when its button is clicked.
export const consentEmbeds = () => {
  const consent = {};

  const load = (el) => {
    const tpl = el.querySelector("template");
    if (!tpl) return;
    el.replaceWith(tpl.content.cloneNode(true));
  };

  const loadAllowed = () => {
    document.querySelectorAll(".consent-embed").forEach((el) => {
      if (consent[el.dataset.consentService] === true) load(el);
    });
  };

  const handle = (entry) => {
    if (!entry || entry.event !== "consent_status") return;
    Object.keys(entry).forEach((key) => {
      if (typeof entry[key] === "boolean") consent[key] = entry[key];
    });
    loadAllowed();
  };

  // Entries already pushed before this script ran
  window.dataLayer = window.dataLayer || [];
  Array.prototype.forEach.call(window.dataLayer, handle);

  // Entries pushed later
  const originalPush = window.dataLayer.push;
  window.dataLayer.push = function () {
    const result = originalPush.apply(this, arguments);
    Array.prototype.forEach.call(arguments, handle);
    return result;
  };

  // Usercentrics v3 also fires a window event with the same payload shape
  window.addEventListener("UC_CONSENT", (e) => handle(e.detail && { event: "consent_status", ...e.detail }));

  document.addEventListener("click", (e) => {
    const button = e.target.closest(".consent-embed__button");
    if (button) load(button.closest(".consent-embed"));
  });
};
