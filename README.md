# homebridge-sonybraviatv
A home bridge plugin for Sony Bravia TVs based on Android TV.
Currently it supports powering on and off Android TV based Sony Bravia TVs using a preshared key.

# Installation

1. Install homebridge using: npm install -g homebridge
2. Somehow get this code.
3. Update your configuration file. See below for a sample.

# Configuration

Enter the IP address of your television in the ipaddress field.
On your TV go to Settings->Network->Home network->IP Control.
  Change Authentication to "Normal and Pre-Shared Key".
  Enter something for the Pre-Shared Key.
  Put that same string in the presharedkey field.


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
