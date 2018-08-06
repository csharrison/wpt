// META: script=/service-workers/service-worker/resources/test-helpers.sub.js
// META: script=resources/utils.js
'use strict';

// Covers functionality provided by BackgroundFetchUpdateEvent.updateUI().
//
// https://wicg.github.io/background-fetch/#backgroundfetchupdateuievent

function createSWParams(numUpdates) {
  return {
    name: 'sw-update-ui.js',
    message: Array(numUpdates).fill({title: 'New Title!'}),
  };
}

backgroundFetchTest(async (test, backgroundFetch) => {
  const registrationId = uniqueId();
  const registration =
      await backgroundFetch.fetch(registrationId, 'resources/feature-name.txt');
  assert_equals(registration.id, registrationId);

  const message = await getMessageFromServiceWorker();
  assert_equals(message.update, 'no update');

}, 'Background Fetch without updateUI resolves', createSWParams(0));

backgroundFetchTest(async (test, backgroundFetch) => {
  const registrationId = uniqueId();
  const registration =
      await backgroundFetch.fetch(registrationId, 'resources/feature-name.txt');
  assert_equals(registration.id, registrationId);

  const message = await getMessageFromServiceWorker();
  assert_equals(message.update, 'update success');

}, 'Background Fetch updateUI resolves', createSWParams(1));


backgroundFetchTest(async (test, backgroundFetch) => {
  const registrationId = uniqueId();
  const registration =
      await backgroundFetch.fetch(registrationId, 'resources/feature-name.txt');
  assert_equals(registration.id, registrationId);

  const message = await getMessageFromServiceWorker();
  assert_equals(message.update, 'updateUI may only be called once.');

}, 'Background Fetch updateUI called twice fails', createSWParams(2));
