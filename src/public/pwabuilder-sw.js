// Listen for install event, set callback
self.addEventListener('install', function(event) {
    console.log("Installed")
});

self.addEventListener('activate', function(event) {
    console.log("Activated")
});

self.addEventListener('fetch', event => {
console.log('Fetching:', event.request.url);
});
