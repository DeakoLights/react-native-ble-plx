'use strict';

import { NativeModules, NativeEventEmitter} from 'react-native';
const BleModule = NativeModules.BleClientManager;

export default class BleManager {
  constructor() {
    BleModule.createClient();
    this.eventEmitter = new NativeEventEmitter(BleModule)
  }

  destroy() {
    BleModule.destroyClient();
  }

  // Scanning...

  startDeviceScan(uuids, listener) {
    console.log("Start device scan");
    this.stopDeviceScan()
    const scanListener = ([error, scannedDevice]) => {
      listener(error, scannedDevice)
    };
    this._scanEventSubscription = this.eventEmitter.addListener(BleModule.ScanEvent, scanListener);
    BleModule.scanBleDevices(uuids);
  }

  stopDeviceScan() {
    console.log("Stop device scan");
    if (this._scanEventSubscription) {
      this._scanEventSubscription.remove()
      delete this._scanEventSubscription
    }
    BleModule.stopScanBleDevices();
  }

  // Handling connections

  async connectToDevice(identifier) {
    console.log("Connecting to device: " + identifier)
    var connectedIdentifier = await BleModule.establishConnection(identifier);
    return connectedIdentifier;
  }

  async closeConnection(identifier) {
    console.log("Closing connection to device: " + identifier)
    var closedIdentifier = await BleModule.closeConnection(identifier);
    return closedIdentifier;
  }

  async serviceIdsForDevice(deviceIdentifier) {
    try {
      var services = await BleModule.serviceIdsForDevice(deviceIdentifier);
      return services;
    } catch(e) {
      console.log(e);
    }
    return nil;
  }

  async characteristicIdsForDevice(deviceIdentifier, serviceIdentifier) {
    try {
      var characteristics = await BleModule.characteristicIdsForDevice(deviceIdentifier, serviceIdentifier);
      return characteristics;
    } catch(e) {
      console.log(e);
    }
    return nil;
  }

  async characteristicDetails(deviceIdentifier, serviceIdentifier, characteristicIdentifier) {
    var characteristicDetails = await BleModule.detailsForCharacteristic(deviceIdentifier, serviceIdentifier, characteristicIdentifier);
    return characteristicDetails;
  }

  async writeCharacteristic(deviceId, serviceId, characteristicsId, base64Value, transactionId) {
    console.log("Write characteristic: " + characteristicId + " in service: " + serviceId + " for device: " + deviceId + ". transactionId: " + transactionId);
    try {
      var writeSuccessful = await BleModule.writeCharacteristic(deviceId, serviceId, characteristicId, base64Value, transactionId);
      if(writeSuccessful) {
        console.log("Successfull write with transactionId: " + transactionId);
        return transactionId;
      }
    } catch(e) {
      console.log(e);
    }
    console.log("Failed write with transactionId: " + transactionId);
    return nil;
  }

  async readCharacteristic(deviceId, serviceId, characteristicId, transactionId) {
    console.log("Read characteristic: " + characteristicId + " in service: " + serviceId + " for device: " + deviceId + ". transactionId: " + transactionId);
    try {
      var readSuccessfulValue = await BleModule.readCharacteristic(deviceId, serviceId, characteristicId, transactionId);
      if(readSuccessfulValue) {
        console.log("Succecssful read with transactionId: " + transactionId + " and value: " + readSuccessfulValue);
        return readSuccessfulValue;
      }
    } catch(e) {
      console.log(e);
    }
    console.log("Failed read with transactionId: " + transactionId);
    return nil;
  }

  cancelCharacteristicOperation(transactionId) {
    BleModule.cancelCharacteristicOperation(transactionId)
  }
}