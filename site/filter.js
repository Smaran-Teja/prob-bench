function updateBenchmarkFilter() {
  var checked = Array.prototype.slice
    .call(document.querySelectorAll(".tagfilter:checked"))
    .map(function (cb) { return cb.dataset.tag; });

  var items = document.querySelectorAll(".benchmark-item");
  for (var i = 0; i < items.length; i++) {
    var span = items[i];
    var tags = span.dataset.tags ? span.dataset.tags.split(" ") : [];
    var show = checked.every(function (tag) { return tags.indexOf(tag) !== -1; });
    var li = span.closest("li");
    if (li) {
      li.style.display = show ? "" : "none";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var checkboxes = document.querySelectorAll(".tagfilter");
  for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("change", updateBenchmarkFilter);
  }
  updateBenchmarkFilter();
});
