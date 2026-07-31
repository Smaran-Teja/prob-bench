function crc32(bytes) {
  var crc = 0xffffffff;
  for (var i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (var bit = 0; bit < 8; bit++) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint32(arr, offset, value) {
  arr[offset] = value & 0xff;
  arr[offset + 1] = (value >>> 8) & 0xff;
  arr[offset + 2] = (value >>> 16) & 0xff;
  arr[offset + 3] = (value >>> 24) & 0xff;
}

function writeUint16(arr, offset, value) {
  arr[offset] = value & 0xff;
  arr[offset + 1] = (value >>> 8) & 0xff;
}

// Builds a minimal, uncompressed (store-only) .zip file from
// [{ name, data: Uint8Array }, ...] entries -- no external libraries needed.
function buildZip(files) {
  var encoder = new TextEncoder();
  var localParts = [];
  var centralParts = [];
  var offset = 0;

  files.forEach(function (file) {
    var nameBytes = encoder.encode(file.name);
    var crc = crc32(file.data);
    var size = file.data.length;

    var localHeader = new Uint8Array(30 + nameBytes.length);
    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 6, 0);
    writeUint16(localHeader, 8, 0);
    writeUint16(localHeader, 10, 0);
    writeUint16(localHeader, 12, 0x21);
    writeUint32(localHeader, 14, crc);
    writeUint32(localHeader, 18, size);
    writeUint32(localHeader, 22, size);
    writeUint16(localHeader, 26, nameBytes.length);
    writeUint16(localHeader, 28, 0);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, file.data);

    var centralHeader = new Uint8Array(46 + nameBytes.length);
    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint16(centralHeader, 8, 0);
    writeUint16(centralHeader, 10, 0);
    writeUint16(centralHeader, 12, 0);
    writeUint16(centralHeader, 14, 0x21);
    writeUint32(centralHeader, 16, crc);
    writeUint32(centralHeader, 20, size);
    writeUint32(centralHeader, 24, size);
    writeUint16(centralHeader, 28, nameBytes.length);
    writeUint16(centralHeader, 30, 0);
    writeUint16(centralHeader, 32, 0);
    writeUint16(centralHeader, 34, 0);
    writeUint16(centralHeader, 36, 0);
    writeUint32(centralHeader, 38, 0);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);

    offset += localHeader.length + file.data.length;
  });

  var centralSize = centralParts.reduce(function (sum, part) {
    return sum + part.length;
  }, 0);
  var centralOffset = offset;

  var endRecord = new Uint8Array(22);
  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 4, 0);
  writeUint16(endRecord, 6, 0);
  writeUint16(endRecord, 8, files.length);
  writeUint16(endRecord, 10, files.length);
  writeUint32(endRecord, 12, centralSize);
  writeUint32(endRecord, 16, centralOffset);
  writeUint16(endRecord, 20, 0);

  return new Blob(localParts.concat(centralParts, [endRecord]), {
    type: "application/zip",
  });
}

function visibleBenchmarkPaths() {
  return Array.prototype.slice
    .call(document.querySelectorAll(".benchmark-item"))
    .filter(function (item) {
      var li = item.closest("li");
      return !li || li.style.display !== "none";
    })
    .map(function (item) {
      var link = item.querySelector(".benchmark-download");
      return link ? link.getAttribute("href") : null;
    })
    .filter(Boolean);
}

function downloadVisibleAsZip() {
  var paths = visibleBenchmarkPaths();
  if (paths.length === 0) return;

  Promise.all(
    paths.map(function (path) {
      return fetch(path)
        .then(function (res) {
          return res.arrayBuffer();
        })
        .then(function (buf) {
          return { name: path, data: new Uint8Array(buf) };
        });
    })
  ).then(function (files) {
    var blob = buildZip(files);
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "prob-bench-benchmarks.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  var button = document.getElementById("download-zip");
  if (button) {
    button.addEventListener("click", downloadVisibleAsZip);
  }
});
