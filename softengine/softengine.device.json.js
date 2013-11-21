(function() {

  (function(SoftEngine) {
    if (SoftEngine == null) SoftEngine = {};
    Device.prototype.LoadJSONFile = function(fileName, callback) {
      var jsonObject, xmlhttp,
        _this = this;
      xmlhttp = new XMLHttpRequest();
      jsonObject = {};
      return xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          jsonObject = JSON.parse(xmlhttp.responseText);
          return callback(_this.CreateMeshesFromJSON);
        }
      };
    };
    return Device.prototype.CreateMeshesFromJSON = function(jsonObject) {
      return console.log(jsonObject);
    };
  })(SoftEngine);

}).call(this);
