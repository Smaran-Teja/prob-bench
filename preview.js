function openPreview(path) {
  var overlay = document.getElementById("preview-overlay");
  if (!overlay) return;

  var filename = overlay.querySelector(".preview-filename");
  var code = overlay.querySelector(".preview-content code");
  filename.textContent = path;
  code.textContent = "Loading...";
  overlay.hidden = false;
  document.body.classList.add("preview-open");

  fetch(path)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (text) {
      code.textContent = text;
    })
    .catch(function () {
      code.textContent = "Could not load " + path + ".";
    });
}

function closePreview() {
  var overlay = document.getElementById("preview-overlay");
  if (!overlay) return;
  overlay.hidden = true;
  document.body.classList.remove("preview-open");
}

document.addEventListener("DOMContentLoaded", function () {
  var triggers = document.querySelectorAll(".benchmark-info");
  for (var i = 0; i < triggers.length; i++) {
    triggers[i].addEventListener("click", function () {
      var item = this.closest(".benchmark-item");
      var link = item ? item.querySelector(".benchmark-download") : null;
      if (link) openPreview(link.getAttribute("href"));
    });
    triggers[i].addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.click();
      }
    });
  }

  var overlay = document.getElementById("preview-overlay");
  if (!overlay) return;

  var closeButton = overlay.querySelector(".preview-close");
  closeButton.addEventListener("click", closePreview);
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) closePreview();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !overlay.hidden) closePreview();
  });
});
