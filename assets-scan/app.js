console.log('Code for Scan');


function isWebBluetoothEnabled() {
    if (navigator.bluetooth) {
      console.log('> Bluetooth is available');
      return true;
    } else {
      appHtml.log('Web Bluetooth API is not available.\n' +
          'Please make sure the "Experimental Web Platform features" flag is enabled.');
      return false;
    }
  }

var appHtml = {
    log: function() {
      var line = Array.prototype.slice.call(arguments).map(function(argument) {
        return typeof argument === 'string' ? argument : JSON.stringify(argument);
      }).join(' ');

      document.querySelector('#log').textContent += line + '\n';
    },

    clearLog: function() {
      document.querySelector('#log').textContent = '';
    },
  };

function onFormClick(){

  let filters = [];

  let filterService = document.querySelector('#service').value;
  if (filterService.startsWith('0x')) {
    filterService = parseInt(filterService);
  }
  if (filterService) {
    filters.push({services: [filterService]});
  }

  let filterNamePrefix = document.querySelector('#namePrefix').value;
  if (filterNamePrefix) {
    filters.push({namePrefix: filterNamePrefix});
  }

  let options = {};
  if (document.querySelector('#allDevices').checked) {
    options.acceptAllDevices = true;
  } else {
    options.filters = filters;
  }

  appHtml.log('Requesting Bluetooth Device...');
  appHtml.log('with ' + JSON.stringify(options));
  navigator.bluetooth.requestDevice(options)
  .then(device => {
    appHtml.log('> Name:             ' + device.name);
    appHtml.log('> Id:               ' + device.id);
    appHtml.log('> Connected:        ' + device.gatt.connected);
  })
  .catch(error => {
    appHtml.log('Argh! ' + error);
  });

}

//Para determinar si Bluetooth está disponible

document.querySelector('form').addEventListener('submit', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
      appHtml.clearLog();
      onFormClick();
    }
  });

