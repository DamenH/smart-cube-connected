const serviceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
// const charRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const charTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const MTU = 15;

let bleDevice;
let bleServer;
let nusService;
let rxCharacteristic;
let txCharacteristic;

let connected = false;

let alg = "";

function connectionToggle()
{
    if (connected)
    {
        disconnect();
    } else
    {
        connect();
    }
}

function setButtonState(enabled)
{
    if (enabled)
    {
        document.getElementById("connectButton").innerHTML = "Disconnect";
    } else
    {
        document.getElementById("connectButton").innerHTML = "Connect";
    }
}

async function connect()
{
    try
    {
        console.log('Requesting Bluetooth Device...');
        let device = await navigator.bluetooth.requestDevice({
            optionalServices: [serviceUUID],
            acceptAllDevices: true
        })

        bleDevice = device;
        console.log('Found ' + device.name);
        console.log('Connecting to GATT Server...');
        bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
        let server = await device.gatt.connect();

        console.log('Locate NUS service');
        let service = await server.getPrimaryService(serviceUUID);

        nusService = service;
        console.log('Found NUS service: ' + service.uuid);

        console.log('Locate TX characteristic');
        let txChar = await nusService.getCharacteristic(charTXUUID);

        txCharacteristic = txChar;
        console.log('Found TX characteristic');

        console.log('Enable notifications');
        await txCharacteristic.startNotifications();

        console.log('Notifications started');
        txCharacteristic.addEventListener('characteristicvaluechanged',
            handleNotifications);
        connected = true;
        console.log('\r\n' + bleDevice.name + ' Connected.');
        setButtonState(true);
    }
    catch (error)
    {
        console.log('' + error);
        console.log('' + error);
        if (bleDevice && bleDevice.gatt.connected)
        {
            bleDevice.gatt.disconnect();
        }
    }


}

function disconnect()
{
    if (!bleDevice)
    {
        console.log('No Bluetooth Device connected...');
        return;
    }
    console.log('Disconnecting from Bluetooth Device...');
    if (bleDevice.gatt.connected)
    {
        bleDevice.gatt.disconnect();
        connected = false;
        setButtonState(false);
        console.log('Bluetooth Device connected: ' + bleDevice.gatt.connected);
    } else
    {
        console.log('> Bluetooth Device is already disconnected');
    }
}

function onDisconnected()
{
    connected = false;
    console.log('\r\n' + bleDevice.name + ' Disconnected.');
    setButtonState(false);
}

function handleNotifications(event)
{
    let value = event.target.value;

    // Reverse Engineering

    /** 
    First Byte Indicates Outer Turn
    B  => 0
    B' => 1
    F  => 2
    F' => 3
    U  => 4
    U' => 5
    D  => 6
    D' => 7
    R  => 8
    R' => 9
    L  => a
    L' => b
    */

    /**
    Last Byte Fast Inner Slice
    M  => 10
    M' => 11
    E  => 7
    E' => 6
    S  => 3
    S' => 2
    */


    const mask = [false, false, false, true, true, true, false, false];
    let arr = [];
    for (let i = 0; i < mask.length; i++)
        if (mask[i]) arr.push(value.getUint8(i))

    let buf2hex = buffer =>
        Array.prototype.map.call(new Uint8Array(buffer), x =>
            ('00' + x.toString(16)).slice(-2)).join('');

    arr = new Uint8Array(arr);
    console.log(buf2hex(arr.buffer));
    console.log(arr);

    // let str = "";
    // for (let i = 0; i < value.byteLength; i++)
    // {
    //     // str += String.fromCharCode(value.getUint8(i));
    //     str += value.getUint8(i) + " ";
    // }
    // str.trim();
    // console.log(str);

    return;
    // External movement only.
    let turn = value.getUint8(3);
    switch (turn)
    {
        case 0x00:
            algWrite("B");
            break;
        case 0x01:
            algWrite("B'");
            break;
        case 0x02:
            algWrite("F");
            break;
        case 0x03:
            algWrite("F'");
            break;
        case 0x04:
            algWrite("U");
            break;
        case 0x05:
            algWrite("U'");
            break;
        case 0x06:
            algWrite("D");
            break;
        case 0x07:
            algWrite("D'");
            break;
        case 0x08:
            algWrite("R");
            break;
        case 0x09:
            algWrite("R'");
            break;
        case 0x0a:
            algWrite("L");
            break;
        case 0x0b:
            algWrite("L'");
            break;
    }
}

let button = document.getElementById("connectButton");
button.addEventListener("pointerup", connect)

let clear = document.getElementsByClassName("clear")[0];
let algSpan = document.getElementsByClassName("alg")[0];
clear.addEventListener("pointerup", algClear);

function algWrite(turn)
{
    alg += `${ turn } `;
    algSpan.innerHTML = alg;
}

function algClear()
{
    alg = "";
    algSpan.innerHTML = alg;
}