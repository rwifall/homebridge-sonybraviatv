# homebridge-sonybraviatv
A home bridge plugin for Sony Bravia TVs based on Android TV.
Currently it supports powering on and off TVs using a preshared key.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-sonybraviatv
3. Update your configuration file. See below for a sample.
4. Set "Remote start" to ON in your Android TV Settings->Network->Remote Start
5. Change "Authentication" to "Normal and Pre-Shared Key" in your Android Settings->Network->IP Control->Authentication
6. Enter a "Pre-Shared Key" in your Android TV Settings->Network->IP control->Pre-Shared Key

# Configuration

Enter the IP address of your television in the ipaddress field.
On your TV go to Settings->Network->Home network->IP Control.
  Change Authentication to "Normal and Pre-Shared Key".
  Enter something for the Pre-Shared Key.
  Put that same string in the presharedkey field.
If your TV requires Wake-on-Lan to power-on, enter your TV MAC address in the macaddress field.


Configuration sample:

 ```
"accessories": [
	{
		"accessory": "SonyBraviaTV",
		"name": "My TV Name",
		"ipaddress": "YOUR TV IP ADDRESS HERE",
		"presharedkey": "YOUR PRESHARED KEY HERE"
  }
    ]
```

NOTE: Some Sony Bravia TVs require Wake-on-Lan to power on.
  If your TV is one of these, then you will need to add the macaddress field to your configuration as shown below.

```
"accessories": [
	{
		"accessory": "SonyBraviaTV",
		"name": "My TV Name",
        "macaddress": "01:02:03:04:05:06",
		"ipaddress": "YOUR TV IP ADDRESS HERE",        
		"presharedkey": "YOUR PRESHARED KEY HERE"
  }
    ]
```

NOTE: If you wish to use the state of your TV as a trigger for automation, the plugin must regularly update it. To achieve this, polling must be enabled.

```
"accessories": [
	{
		"accessory": "SonyBraviaTV",
		"name": "My TV Name",
        "macaddress": "01:02:03:04:05:06",
		"ipaddress": "YOUR TV IP ADDRESS HERE",
		"presharedkey": "YOUR PRESHARED KEY HERE",
    "polling": true,
    "interval": 1
  }
    ]
```
