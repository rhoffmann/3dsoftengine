(function() {

  (function(SoftEngine) {
    var Texture;
    if (SoftEngine == null) SoftEngine = {};
    Texture = (function() {

      function Texture(filename, width, height) {
        this.width = width;
        this.height = height;
        this.load(filename);
      }

      Texture.prototype.load = function(filename) {
        var imageTexture,
          _this = this;
        imageTexture = new Image();
        imageTexture.height = this.height;
        imageTexture.width = this.width;
        imageTexture.onload = function() {
          var internalCanvas, internalContext;
          internalCanvas = document.createElement("canvas");
          internalCanvas.width = _this.width;
          internalCanvas.height = _this.height;
          internalContext = internalCanvas.getContext("2d");
          internalContext.drawImage(imageTexture, 0, 0);
          _this.internalBuffer = internalContext.getImageData(0, 0, _this.width, _this.height);
        };
        imageTexture.src = filename;
      };

      Texture.prototype.map = function(tu, tv) {
        var a, b, g, pos, r, u, v;
        if (this.internalBuffer) {
          u = Math.abs((tu * this.width) % this.width) >> 0;
          v = Math.abs((tv * this.height) % this.height) >> 0;
          pos = (u + v * this.width) * 4;
          r = this.internalBuffer.data[pos];
          g = this.internalBuffer.data[pos + 1];
          b = this.internalBuffer.data[pos + 2];
          a = this.internalBuffer.data[pos + 3];
          return new BABYLON.Color4(r / 255.0, g / 255.0, b / 255.0, a / 255.0);
        } else {
          return new BABYLON.Color4(1, 1, 1, 0);
        }
      };

      return Texture;

    })();
    return SoftEngine.Texture = Texture;
  })(SoftEngine);

}).call(this);
