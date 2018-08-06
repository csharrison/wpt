'use strict';

let nextBackgroundFetchId = 0;

const defaultSWParams = {
  // The name of the Service Worker to register.
  name: 'sw.js',
  // The message to pass to the Service Worker.
  message: null,
};

// Waits for a single message received from a registered Service Worker.
async function getMessageFromServiceWorker() {
  return new Promise(resolve => {
    function listener(event) {
      navigator.serviceWorker.removeEventListener('message', listener);
      resolve(event.data);
    }

    navigator.serviceWorker.addEventListener('message', listener);
  });
}

// Registers the |name| instrumentation Service Worker located at "resources/"
// with a scope unique to the test page that's running, and waits for it to be
// activated. The Service Worker will be unregistered automatically.
//
// Depends on /service-workers/service-worker/resources/test-helpers.sub.js
async function registerAndActivateServiceWorker(test, name) {
  const script = `resources/${name}`;
  const scope = 'resources/scope' + location.pathname;

  let serviceWorkerRegistration =
      await service_worker_unregister_and_register(test, script, scope);

  add_completion_callback(() => serviceWorkerRegistration.unregister());

  await wait_for_state(test, serviceWorkerRegistration.installing, 'activated');
  return serviceWorkerRegistration;
}

// Creates a Promise test for |func| given the |description|. The |func| will be
// executed with the `backgroundFetch` object of an activated Service Worker
// Registration.
// |swParams| contains customizable Service Worker idata, suce as the name of the
// Service Worker to register, and the message to post to it.
function backgroundFetchTest(func, description, swParams = defaultSWParams) {
  promise_test(async t => {
    const serviceWorkerRegistration = await registerAndActivateServiceWorker(t, swParams.name);
    serviceWorkerRegistration.active.postMessage(swParams.message);

    assert_equals(await getMessageFromServiceWorker(), 'ready');

    return func(t, serviceWorkerRegistration.backgroundFetch);
  }, description);
}

// Returns a Background Fetch ID that's unique for the current page.
function uniqueId() {
  return 'id' + nextBackgroundFetchId++;
}
