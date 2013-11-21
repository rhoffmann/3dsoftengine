(function() {

  (function(SoftEngine) {
    if (SoftEngine == null) SoftEngine = {};
    return SoftEngine.Device.prototype.drawBLine = function(p0, p1) {
      var dx, dy, e2, err, sx, sy, x0, x1, y0, y1, _results;
      x0 = p0.x >> 0;
      y0 = p0.y >> 0;
      x1 = p1.x >> 0;
      y1 = p1.y >> 0;
      dx = Math.abs(x1 - x0);
      dy = Math.abs(y1 - y0);
      sx = x0 < x1 ? 1 : -1;
      sy = y0 < y1 ? 1 : -1;
      err = dx - dy;
      _results = [];
      while (true) {
        this.drawPoint(new BABYLON.Vector2(x0, y0));
        if (x0 == x1 && y0 == y1) break;
        e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (e2 < dx) {
          err += dx;
          _results.push(y0 += sy);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
  })(SoftEngine);

}).call(this);
