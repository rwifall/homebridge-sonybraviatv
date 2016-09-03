var request = require("request");
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


  this.service = new Service.Switch(this.name);

     this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));

}

SonyBraviaTVAccessory.prototype.getOn = function(callback)
{
  this.log("Getting whether Sony TV is on...");

  var postData = JSON.stringify({
    method: 'getPowerStatus',
    params: [],
    id: 1,
    version: '1.0'
  });

  request.post({
    url: "http://"+this.ipaddress + "/sony/system",
    headers: {'X-Auth-PSK': this.psk},
    form: postData
  }, function(err, response, body) {

    if (!err && response.statusCode == 200) {
      var json = JSON.parse(body);
      var status = json.result[0].status;
      this.log("TV status is %s", status);
      var isOn = status == "active";
      callback(null, isOn); // success
    }
    else {
      this.log("Error getting TV status (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}

SonyBraviaTVAccessory.prototype.setOn = function(value, callback) {
  this.log("Set value to %s", value);

  var postData = JSON.stringify({
    method: 'setPowerStatus',
    params: [{'status':value}],
    id: 1,
    version: '1.0'
  });


  request.post({
    url: "http://"+this.ipaddress + "/sony/system",
    headers: {'X-Auth-PSK': this.psk},
    form: postData
  }, function(err, response, body) {

    if (!err && response.statusCode == 200) {
      callback(); // success
    }
    else {
      this.log("Error '%s' setting lock state. Response: %s", err, body);
      callback(err || new Error("Error setting lock state."));
    }
  }.bind(this));
}

SonyBraviaTVAccessory.prototype.getServices = function() {
  return [this.service];
}
