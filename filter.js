function updateBenchmarkFilter() {
  // Language is a single-select radio group (at most one checked), so it's
  // effectively required-if-set. Tags are checkboxes and are OR'd together
  // -- a benchmark matches if it has *any* of the checked tags. The two
  // groups are ANDed against each other.
  var languageChecked = Array.prototype.slice
    .call(document.querySelectorAll('.tagfilter[type="radio"]:checked'))
    .map(function (cb) { return cb.dataset.tag; });

  var tagsChecked = Array.prototype.slice
    .call(document.querySelectorAll('.tagfilter[type="checkbox"]:checked'))
    .map(function (cb) { return cb.dataset.tag; });

  var items = document.querySelectorAll(".benchmark-item");
  var visibleCount = 0;
  for (var i = 0; i < items.length; i++) {
    var span = items[i];
    var tags = span.dataset.tags ? span.dataset.tags.split(" ") : [];
    var matchesLanguage = languageChecked.every(function (tag) {
      return tags.indexOf(tag) !== -1;
    });
    var matchesTags =
      tagsChecked.length === 0 ||
      tagsChecked.some(function (tag) {
        return tags.indexOf(tag) !== -1;
      });
    var show = matchesLanguage && matchesTags;
    if (show) visibleCount++;
    var li = span.closest("li");
    if (li) {
      li.style.display = show ? "" : "none";
    }
  }

  var countLabel = document.getElementById("result-count");
  if (countLabel) {
    countLabel.textContent =
      "Showing " + visibleCount + " of " + items.length +
      (items.length === 1 ? " benchmark" : " benchmarks");
  }
}

// Radio inputs can't normally be unchecked by clicking them again, but
// language filtering should still support "no language selected" (show
// all). Track whether a radio was already checked before the click that's
// about to (re-)check it, and if so, uncheck it instead.
//
// The radio itself is visually hidden and zero-size (see .chip input in
// style.css) -- users actually click the wrapping <label>, which is what
// receives the real mousedown. The click that later fires on the input
// itself is just the label's forwarded/synthetic one, by which point
// `checked` already reflects the *new* state, so the pre-click state has
// to be captured on the label's mousedown, not the input's.
function enableDeselectableRadios() {
  var labels = document.querySelectorAll("label.chip");
  for (var i = 0; i < labels.length; i++) {
    labels[i].addEventListener("mousedown", function () {
      var input = this.querySelector('input[type="radio"].tagfilter');
      if (input) {
        input.dataset.wasChecked = input.checked ? "true" : "false";
      }
    });
  }

  var radios = document.querySelectorAll('input[type="radio"].tagfilter');
  for (var i = 0; i < radios.length; i++) {
    radios[i].addEventListener("click", function () {
      var input = this;
      if (input.dataset.wasChecked === "true") {
        // Deferred: calling preventDefault() here would make the browser
        // revert to the pre-click (already-checked) state right after this
        // listener returns, undoing an immediate override.
        setTimeout(function () {
          input.checked = false;
          input.dataset.wasChecked = "false";
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }, 0);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var checkboxes = document.querySelectorAll(".tagfilter");
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("change", updateBenchmarkFilter);
  }
  enableDeselectableRadios();
  updateBenchmarkFilter();
});
