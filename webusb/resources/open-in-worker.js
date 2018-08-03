importScripts('/webusb/resources/usb-helpers.js');
'use strict';

// Initialize USBTest.
async function setup() {
  await loadChromiumResources;

  // Transfer the request handle for UsbDeviceManager and UsbChooserService to the
  // window context on USB interface request.
  let deviceManagerInterceptor = new MojoInterfaceInterceptor(
      device.mojom.UsbDeviceManager.name);
  deviceManagerInterceptor.oninterfacerequest =
    e => {
      postMessage({
        type: 'DeviceManagerInterfaceRequest',
        handle: e.handle
      }, [e.handle]);
    };
  deviceManagerInterceptor.start();

  let chooserServiceInterceptor = new MojoInterfaceInterceptor(
      device.mojom.UsbChooserService.name);
  chooserServiceInterceptor.oninterfacerequest =
    e => {
      postMessage({
        type: 'ChooserServiceInterfaceRequest',
        handle: e.handle
      }, [e.handle]);
    };
  chooserServiceInterceptor.start();

  // Wait for a call to GetDevices() to pass between the renderer and the mock
  // in order to establish that everything is set up.
  await navigator.usb.getDevices();
  postMessage({ type: 'SetupComplete' });
}

onmessage = messageEvent => {
  if (messageEvent.data.type === 'Ready') {
    navigator.usb.addEventListener('connect', connectEvent => {
      connectEvent.device.open().then(() => {
        postMessage({ type: 'Success' });
      }).catch(error => {
        postMessage({ type: `FAIL: open rejected ${error}` });
      });
    });
    postMessage({ type: 'Ready' });
  }
};

setup();
