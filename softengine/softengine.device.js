(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function(SoftEngine) {
    var Device;
    if (SoftEngine == null) SoftEngine = {};
    Device = (function() {

      function Device(canvas, fullscreen) {
        if (fullscreen == null) fullscreen = false;
        this.onResizeCanvas = __bind(this.onResizeCanvas, this);
        this.workingCanvas = canvas;
        this.setupCanvas();
        if (fullscreen) {
          window.addEventListener('resize', this.onResizeCanvas, false);
          this.onResizeCanvas();
        }
      }

      Device.prototype.setupCanvas = function() {
        this.workingWidth = this.workingCanvas.width;
        this.workingHeight = this.workingCanvas.height;
        this.workingContext = this.workingCanvas.getContext('2d');
        this.workingContext.fillStyle = "#000";
        return this.workingContext.font = "normal 10px sans-serif";
      };

      Device.prototype.onResizeCanvas = function() {
        this.workingCanvas.width = window.innerWidth;
        this.workingCanvas.height = window.innerHeight;
        return this.setupCanvas();
      };

      Device.prototype.clear = function() {
        this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
        return this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
      };

      Device.prototype.present = function() {
        return this.workingContext.putImageData(this.backbuffer, 0, 0);
      };

      Device.prototype.renderCoordinates = function(camera, meshes, objSpace) {
        var cMesh, projectedPoint, projectionMatrix, transformMatrix, vertice, viewMatrix, worldMatrix, _i, _len, _results;
        if (objSpace == null) objSpace = false;
        viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());
        projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);
        _results = [];
        for (_i = 0, _len = meshes.length; _i < _len; _i++) {
          cMesh = meshes[_i];
          worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z).multiply(BABYLON.Matrix.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
          transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);
          if (objSpace) {
            _results.push((function() {
              var _j, _len2, _ref, _results2;
              _ref = cMesh.Vertices;
              _results2 = [];
              for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                vertice = _ref[_j];
                projectedPoint = this.project(vertice, transformMatrix);
                _results2.push(this.workingContext.fillText("(" + vertice.x + "," + vertice.y + "," + vertice.z + ")", projectedPoint.x, projectedPoint.y));
              }
              return _results2;
            }).call(this));
          } else {
            _results.push((function() {
              var _j, _len2, _ref, _results2;
              _ref = cMesh.Vertices;
              _results2 = [];
              for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
                vertice = _ref[_j];
                projectedPoint = this.project(vertice, transformMatrix);
                _results2.push(this.workingContext.fillText("(" + projectedPoint.x + "," + projectedPoint.y + ")", projectedPoint.x, projectedPoint.y));
              }
              return _results2;
            }).call(this));
          }
        }
        return _results;
      };

      Device.prototype.putPixel = function(x, y, color) {
        var index;
        this.backbufferdata = this.backbuffer.data;
        index = ((x >> 0) + (y >> 0) * this.workingWidth) * 4;
        this.backbufferdata[index] = color.r * 255;
        this.backbufferdata[index + 1] = color.g * 255;
        this.backbufferdata[index + 2] = color.b * 255;
        return this.backbufferdata[index + 3] = color.a * 255;
      };

      Device.prototype.project = function(coord, transMat) {
        var point, x, y;
        point = BABYLON.Vector3.TransformCoordinates(coord, transMat);
        x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0;
        y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0;
        return new BABYLON.Vector2(x, y);
      };

      Device.prototype.drawPoint = function(point) {
        if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
          return this.putPixel(point.x, point.y, new BABYLON.Color4(1, 0, 0, 1));
        }
      };

      Device.prototype.drawLine = function(p0, p1) {
        var dist, middlePoint;
        dist = p1.subtract(p0).length();
        if (dist < 2) return;
        middlePoint = p0.add(p1.subtract(p0).scale(0.5));
        this.drawPoint(middlePoint);
        this.drawLine(p0, middlePoint);
        return this.drawLine(middlePoint, p1);
      };

      Device.prototype.render = function(camera, meshes) {
        var cMesh, currentFace, pA, pB, pC, projectionMatrix, transformMatrix, vertexA, vertexB, vertexC, viewMatrix, worldMatrix, _i, _len, _results;
        viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());
        projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);
        _results = [];
        for (_i = 0, _len = meshes.length; _i < _len; _i++) {
          cMesh = meshes[_i];
          worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z).multiply(BABYLON.Matrix.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
          transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);
          _results.push((function() {
            var _j, _len2, _ref, _results2;
            _ref = cMesh.Faces;
            _results2 = [];
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              currentFace = _ref[_j];
              vertexA = cMesh.Vertices[currentFace.A];
              vertexB = cMesh.Vertices[currentFace.B];
              vertexC = cMesh.Vertices[currentFace.C];
              pA = this.project(vertexA, transformMatrix);
              pB = this.project(vertexB, transformMatrix);
              pC = this.project(vertexC, transformMatrix);
              this.drawBLine(pA, pB);
              this.drawBLine(pB, pC);
              _results2.push(this.drawBLine(pC, pA));
            }
            return _results2;
          }).call(this));
        }
        return _results;
      };

      return Device;

    })();
    return SoftEngine.Device = Device;
  })(SoftEngine);

}).call(this);
