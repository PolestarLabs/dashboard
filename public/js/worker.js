if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pwabuilder-sw.js')
    .then(function(registration) {
      console.log('Ding :', registration.scope);
    })
    .catch(function(error) {
      console.log('Poi:', error);
    });
  }
  