let source = null;
let updateUIParams = [];

async function updateUI(event) {
  if (!updateUIParams.length)
    return 'no update';

  return Promise.all(updateUIParams.map(param => event.updateUI(param)))
           .then(() => 'update success')
           .catch(e => e.message);
}

self.addEventListener('message', event => {
  updateUIParams = event.data;
  source = event.source;
  source.postMessage('ready');
});

self.addEventListener('backgroundfetched', event => {
  event.waitUntil(updateUI(event)
      .then((update) => source.postMessage({ type: event.type, update})))
});
