// Adds copy to clipboard buttons to code blocks

document.addEventListener("DOMContentLoaded", addCopyButtons);

function addCopyButtons() {
  document.querySelectorAll(".highlight > pre > code").forEach(function (codeBlock) {
    const button = document.createElement("button");
    button.className = "btn copy-code-button";
    button.type = "button";
    button.innerText = "Copy";

    button.addEventListener("click", function () {
      navigator.clipboard.writeText(codeBlock.textContent).then(
        function () {
          button.blur();
          button.innerText = "Copied!";
          setTimeout(function () {
            button.innerText = "Copy";
          }, 2000);
        },
        function (error) {
          button.innerText = "Error";
          console.error(error);
        }
      );
    });

    codeBlock.parentNode.insertBefore(button, codeBlock.parentNode.nextSibling);
  });
}
