(function() {

  (function(SoftEngine) {
    if (SoftEngine == null) SoftEngine = {};
    return SoftEngine.Device.prototype.debug = function(text) {
      return this.workingContext.fillText(text, 10, 10);
    };
  })(SoftEngine);

}).call(this);
