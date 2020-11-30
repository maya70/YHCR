var _x = RadSet;

self.addEventListener('message', function (e) {
    var data = e.data;
    self.postMessage(_x.CurrentSelection);

}, false);