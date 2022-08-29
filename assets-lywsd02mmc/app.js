console.log ("JavaScript run ...");

let BluetoothAvailable = false;
let bluetoothDevice;

const temDatos = document.querySelector('#temD');
const humDatos = document.querySelector('#humD');

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

    temUpdate: function(temStr){
      temDatos.textContent = temStr;
    },

    humUpdate: function(humStr){
      humDatos.textContent = humStr;
    },

    batUpdate: function(batStr){
      batDatos.textContent = batStr;
    }

};

document.querySelector('#startNotifications').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
      appHtml.clearLog();
      onStartButtonClick();
    }
  });

document.querySelector('#stopNotifications').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
      onStopButtonClick();
    }
  });

  document.querySelector('#clearLog').addEventListener('click', function(event) {
    event.stopPropagation();
    event.preventDefault();
    clearLog();
  });

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

function clearLog(){
    //console.log("pulado");
    appHtml.clearLog();
}

function onStartButtonClick() {

    let serviceUuid = "ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6";
    
    let characteristicUuid = "ebe0ccc1-7a0a-4b0c-8a1a-6ff2997da3a6";
    
    appHtml.log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice({
        //acceptAllDevices: true,
        optionalServices: ['ebe0ccb0-7a0a-4b0c-8a1a-6ff2997da3a6'], 
        filters: [{namePrefix: ["LYWSD02"]}]
    })
    .then(device => {
        bluetoothDevice = device;
        appHtml.log('Connecting to GATT Server...'); 
        return device.gatt.connect();
    })
    .then(server => {
        appHtml.log('Getting Services...');
        return server.getPrimaryService(serviceUuid);
    })
    .then(service => {
        appHtml.log('Getting Characteristic...');
        return service.getCharacteristic(characteristicUuid);
    })
    .then(characteristic => {
        appHtml.log('> Found Temp Humi characteistic');
        myCharacteristic = characteristic;
        return myCharacteristic.startNotifications().then(_ => {
            appHtml.log('> Notifications started');
            myCharacteristic.addEventListener('characteristicvaluechanged',
            handleNotifications);
        });
        
    })
    
    .catch(error => {
        appHtml.log('Argh! ' + error);
    });
}


function onStopButtonClick() {
    if (myCharacteristic) {
      myCharacteristic.stopNotifications()
      .then(_ => {
        appHtml.log('> Notifications stopped');
        myCharacteristic.removeEventListener('characteristicvaluechanged',
            handleNotifications);
      })
      .catch(error => {
        appHtml.log('Argh! ' + error);
      });
    }
    if (!bluetoothDevice) {
        return;
      }
      appHtml.log('Disconnecting from Bluetooth Device...');
      if (bluetoothDevice.gatt.connected) {
        bluetoothDevice.gatt.disconnect();
      } else {
        appHtml.log('> Bluetooth Device is already disconnected');
      }
  }

function handleNotifications(event) {
    let value = event.target.value;
    let a = [];
    // Convert raw data bytes to hex values just for the sake of showing something.
    // In the "real" world, you'd use data.getUint8, data.getUint16 or even
    // TextDecoder to process raw data bytes.
    for (let i = 0; i < value.byteLength; i++) {
      a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
    }
    appHtml.log('> ' + a.join(' '));

    let temp = value.getInt16(0, true) / 100;
    let hum = value.getUint8(2);
    let TemHumString = "Temp: " + temp + "°C, Humi: " + hum + "%";
    let temString = "Tem: "+ temp + " ºC";
    let humString = "Hum: "+ hum + " %";

    appHtml.temUpdate(temString)
    appHtml.humUpdate(humString)
    appHtml.log(TemHumString);

  }

function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
      if (characteristic.properties[p] === true) {
        supportedProperties.push(p.toUpperCase());
      }
    }
    return '[' + supportedProperties.join(', ') + ']';
  }