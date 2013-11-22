(function() {

  (function(SoftEngine) {
    if (SoftEngine == null) SoftEngine = {};
    return SoftEngine.Device.prototype.drawLine = function(p0, p1) {
      var dist, middlePoint;
      dist = p1.subtract(p0).length();
      if (dist < 2) return;
      middlePoint = p0.add(p1.subtract(p0).scale(0.5));
      this.drawPoint(middlePoint);
      this.drawLine(p0, middlePoint);
      return this.drawLine(middlePoint, p1);
    };
  })(SoftEngine);

}).call(this);
