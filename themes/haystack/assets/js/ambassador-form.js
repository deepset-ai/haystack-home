// Ambassador program application modal
export const ambassadorForm = () => {
  const modal = document.getElementById("ambassador-modal");
  if (!modal) return;

  document.querySelectorAll('a[href="#ambassador-modal"]').forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  modal.querySelector(".ambassador-modal-backdrop").addEventListener("click", closeModal);

  modal.querySelectorAll(".js-ambassador-close").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  function openModal() {
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    modal.querySelector(".ambassador-modal-dialog").focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
  }
};
