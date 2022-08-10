
let BluetoothAvailable = false;

window.addEventListener('error', function(error) {

    console.error(error);
    console.log(error.message + ' (Your browser may not support this feature.)');
    document.querySelector('#status').textContent = 'Tu explorador puede que no soporte esta característica';
    error.preventDefault();  

  });

//Determine whether Bluetooth is available
navigator.bluetooth.getAvailability()
.then(isBluetoothAvailable => {
    console.log(`> Bluetooth is ${isBluetoothAvailable ? 'available' : 'unavailable'}`);
    if (isBluetoothAvailable) {
        appHtml.setStatus('Web Bluetooth API está disponible.\n');
        BluetoothAvailable = true;
    } else {
        console.log('Web Bluetooth API is not available.\n' +
            'Please make sure the "Experimental Web Platform features" flag is enabled.');
        appHtml.setStatus('Web Bluetooth API no está disponible.\n' +
            'Asegúrese de que el flag "Experimental Web Platform features" esté habilitado.');
        BluetoothAvailable = false;
    }
});

if ('onavailabilitychanged' in navigator.bluetooth) {
navigator.bluetooth.addEventListener('availabilitychanged', function(event) {
    console.log(`> Bluetooth is ${event.value ? 'available' : 'unavailable'}`);
});
}


document.querySelector('form').addEventListener('submit', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
        appHtml.clearLog();
        onButtonClick();
    }
});

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

    setStatus: function(status) {
        document.querySelector('#status').textContent = status;
    },

};

function isWebBluetoothEnabled() {
    if (BluetoothAvailable) {
        return true;
    } else {
        console.log('Web Bluetooth API is not available.\n' +
            'Please make sure the "Experimental Web Platform features" flag is enabled.');
        appHtml.setStatus('Web Bluetooth API no está disponible.\n' +
            'Asegúrese de que el flag "Experimental Web Platform features" esté habilitado.');

        return false;
    }

}

function onButtonClick() {
    let filters = [];

    let filterService = document.querySelector('#service').value;
    if (filterService.startsWith('0x')) {
        filterService = parseInt(filterService);
    }
    if (filterService) {
        filters.push({ services: [filterService] });
    }

    let filterNamePrefix = document.querySelector('#namePrefix').value;
    if (filterNamePrefix) {
        filters.push({ namePrefix: filterNamePrefix });
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
            appHtml.log('> Name:        ' + device.name);
            appHtml.log('> Id:          ' + device.id);
            appHtml.log('> Connected:   ' + device.gatt.connected);
        })
        .catch(error => {
            appHtml.log('Argh! ' + error);
        });
}

