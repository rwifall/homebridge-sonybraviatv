var request = require("request");
var wol = require("wake_on_lan");
var Service, Characteristic;

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-sonybraviatv", "SonyBraviaTV", SonyBraviaTVAccessory);
}

function SonyBraviaTVAccessory(log, config) {
    this.log = log;
    this.name = config["name"];
    this.psk = config["presharedkey"];
    this.ipaddress = config["ipaddress"];
    this.macaddress = config["macaddress"];
    this.polling = config["polling"] === true;
    this.interval = parseInt(config["interval"], 10) | 1;

    this.timer;
    this.isOn;

    this.service = new Service.Switch(this.name);

    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));

    this.updateTimer();
}

SonyBraviaTVAccessory.prototype.runTimer = function() {
    this.getState(function(err, isOn) {
        if (err == null) {
            if (isOn != this.isOn) {
                this.log("State changed: %s", isOn ? "on" : "off");
                this.isOn = isOn;
            }
            /* *
             * Always update. Hubs might not have received a recent update, if
             * they were just switching between sleep and active. This is
             * especially an issue with TVs, for they often toggle their state
             * at the same time as an Apple TV. Homebridge framework only
             * propagates the update, if the recent update failed, so this won't
             * increase network traffic.
             */
            this.service.getCharacteristic(Characteristic.On).updateValue(isOn);
        }
    }.bind(this));
}

SonyBraviaTVAccessory.prototype.updateTimer = function() {
    if (this.polling) {
        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
            this.runTimer();
            this.updateTimer();
        }.bind(this), this.interval * 1000);
    }
}

SonyBraviaTVAccessory.prototype.getState = function(callback) {
  var postData = JSON.stringify({
      method: 'getPowerStatus',
      params: [],
      id: 1,
      version: '1.0'
  });

  request.post({
      url: "http://" + this.ipaddress + "/sony/system",
      headers: {
          'X-Auth-PSK': this.psk
      },
      form: postData
  }, function(err, response, body) {

      if (!err && response.statusCode == 200) {
          var json = JSON.parse(body);
          var status = json.result[0].status;
          var isOn = status == "active";
          callback(null, isOn); // success
      } else {
          if (response != null) {
              this.log("Error getting TV status (status code %s): %s", response.statusCode, err);
              callback(err);
          } else {
              callback(null, false);
          }
      }
  }.bind(this));
}

SonyBraviaTVAccessory.prototype.getOn = function(callback) {
    this.log("Getting whether Sony TV is on...");

    if (this.polling) {
        callback(null, this.isOn);
    } else {
        this.getState(function(err, isOn) {
              if (err == null) this.log("State is: %s", isOn ? "on" : "off");
              callback(err, isOn);
        }.bind(this));
    }
}

SonyBraviaTVAccessory.prototype.setOn = function(value, callback) {
    value = Boolean(value);
    this.log("Set state to %s", value ? "on" : "off");

    if (value && this.macaddress) {
        wol.wake(this.macaddress, function(error) {
            if (error) {
                // handle error
                this.log("Error '%s' setting TV power state using WOL.", error);
                callback(error);
            } else {
                // done sending packets
                this.updateTimer();
                callback();
            }
        }.bind(this));
    } else {

        var postData = JSON.stringify({
            method: 'setPowerStatus',
            params: [{
                'status': value
            }],
            id: 1,
            version: '1.0'
        });

        request.post({
            url: "http://" + this.ipaddress + "/sony/system",
            headers: {
                'X-Auth-PSK': this.psk
            },
            form: postData
        }, function(err, response, body) {

            if (!err && response.statusCode == 200) {
                this.updateTimer();
                callback(); // success
            } else {
                this.log("Error '%s' setting TV power state. Response: %s", err, body);
                callback(err || new Error("Error setting TV power state."));
            }
        }.bind(this));
    }
}

SonyBraviaTVAccessory.prototype.getServices = function() {
    return [this.service];
}
