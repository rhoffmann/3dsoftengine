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
        this.depthbuffer = new Array(this.workingWidth * this.workingHeight);
        this.workingContext.fillStyle = "#000";
        return this.workingContext.font = "normal 10px sans-serif";
      };

      Device.prototype.onResizeCanvas = function() {
        this.workingCanvas.width = window.innerWidth;
        this.workingCanvas.height = window.innerHeight;
        return this.setupCanvas();
      };

      Device.prototype.clear = function() {
        var i, _ref;
        this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
        this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
        for (i = 0, _ref = this.depthbuffer.length; i < _ref; i += 1) {
          this.depthbuffer[i] = 10000000;
        }
      };

      Device.prototype.present = function() {
        return this.workingContext.putImageData(this.backbuffer, 0, 0);
      };

      Device.prototype.renderCoordinates = function(camera, meshes, objSpace) {
        var cMesh, projectedPoint, projectionMatrix, transformMatrix, vertice, viewMatrix, worldMatrix, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
        if (objSpace == null) objSpace = false;
        viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());
        projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);
        for (_i = 0, _len = meshes.length; _i < _len; _i++) {
          cMesh = meshes[_i];
          worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z).multiply(BABYLON.Matrix.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
          transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);
          if (objSpace) {
            _ref = cMesh.Vertices;
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              vertice = _ref[_j];
              projectedPoint = this.project(vertice, transformMatrix);
              this.workingContext.fillText("(" + vertice.x + "," + vertice.y + "," + vertice.z + ")", projectedPoint.x, projectedPoint.y);
            }
          } else {
            _ref2 = cMesh.Vertices;
            for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
              vertice = _ref2[_k];
              projectedPoint = this.project(vertice, transformMatrix);
              this.workingContext.fillText("(" + projectedPoint.x + "," + projectedPoint.y + ")", projectedPoint.x, projectedPoint.y);
            }
          }
        }
      };

      Device.prototype.putPixel = function(x, y, z, color) {
        var index, index4;
        this.backbufferdata = this.backbuffer.data;
        index = (x >> 0) + (y >> 0) * this.workingWidth;
        index4 = index * 4;
        if (this.depthbuffer[index] < z) return;
        this.depthbuffer[index] = z;
        this.backbufferdata[index4] = color.r * 255;
        this.backbufferdata[index4 + 1] = color.g * 255;
        this.backbufferdata[index4 + 2] = color.b * 255;
        return this.backbufferdata[index4 + 3] = color.a * 255;
      };

      Device.prototype.project = function(coord, transMat) {
        var point, x, y;
        point = BABYLON.Vector3.TransformCoordinates(coord, transMat);
        x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0;
        y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0;
        return new BABYLON.Vector3(x, y, point.z);
      };

      Device.prototype.drawPoint = function(point, color) {
        if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
          return this.putPixel(point.x, point.y, point.z, color);
        }
      };

      Device.prototype.render = function(camera, meshes) {
        var cMesh, color, currentFace, indexFaces, pA, pB, pC, projectionMatrix, transformMatrix, vertexA, vertexB, vertexC, viewMatrix, worldMatrix, _i, _len, _len2, _ref;
        viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());
        projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);
        for (_i = 0, _len = meshes.length; _i < _len; _i++) {
          cMesh = meshes[_i];
          worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z).multiply(BABYLON.Matrix.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
          transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);
          _ref = cMesh.Faces;
          for (indexFaces = 0, _len2 = _ref.length; indexFaces < _len2; indexFaces++) {
            currentFace = _ref[indexFaces];
            vertexA = cMesh.Vertices[currentFace.A];
            vertexB = cMesh.Vertices[currentFace.B];
            vertexC = cMesh.Vertices[currentFace.C];
            pA = this.project(vertexA, transformMatrix);
            pB = this.project(vertexB, transformMatrix);
            pC = this.project(vertexC, transformMatrix);
            color = 0.25 + ((indexFaces % cMesh.Faces.length) / cMesh.Faces.length) * 0.75;
            this.drawTriangle(pA, pB, pC, new BABYLON.Color4(1, color, color, 1));
          }
        }
      };

      Device.prototype.clamp = function(value, min, max) {
        if (min == null) min = 0;
        if (max == null) max = 1;
        return Math.max(min, Math.min(value, max));
      };

      Device.prototype.interpolate = function(min, max, gradient) {
        return min + (max - min) * this.clamp(gradient);
      };

      Device.prototype.processScanLine = function(y, pa, pb, pc, pd, color) {
        var ex, gradient, gradient1, gradient2, sx, x, z, z1, z2;
        gradient1 = pa.y != pb.y ? (y - pa.y) / (pb.y - pa.y) : 1;
        gradient2 = pc.y != pd.y ? (y - pc.y) / (pd.y - pc.y) : 1;
        sx = this.interpolate(pa.x, pb.x, gradient1) >> 0;
        ex = this.interpolate(pc.x, pd.x, gradient2) >> 0;
        z1 = this.interpolate(pa.z, pb.z, gradient1);
        z2 = this.interpolate(pc.z, pd.z, gradient2);
        for (x = sx; x < ex; x += 1) {
          gradient = (x - sx) / (ex - sx);
          z = this.interpolate(z1, z2, gradient);
          this.drawPoint(new BABYLON.Vector3(x, y, z), color);
        }
      };

      Device.prototype.drawTriangle = function(p1, p2, p3, color) {
        var dP1P2, dP1P3, p1_y, p3_y, y, _ref, _ref2, _ref3;
        if (p1.y > p2.y) _ref = [p1, p2], p2 = _ref[0], p1 = _ref[1];
        if (p2.y > p3.y) _ref2 = [p3, p2], p2 = _ref2[0], p3 = _ref2[1];
        if (p1.y > p2.y) _ref3 = [p1, p2], p2 = _ref3[0], p1 = _ref3[1];
        dP1P2 = p2.y - p1.y > 0 ? (p2.x - p1.x) / (p2.y - p1.y) : 0;
        dP1P3 = p3.y - p1.y > 0 ? (p3.x - p1.x) / (p3.y - p1.y) : 0;
        if (dP1P2 > dP1P3) {
          p1_y = p1.y >> 0;
          p3_y = p3.y >> 0;
          for (y = p1_y; y <= p3_y; y += 1) {
            if (y < p2.y) {
              this.processScanLine(y, p1, p3, p1, p2, color);
            } else {
              this.processScanLine(y, p1, p3, p2, p3, color);
            }
          }
          return;
        }
        if (dP1P2 < dP1P3) {
          p1_y = p1.y >> 0;
          p3_y = p3.y >> 0;
          for (y = p1_y; y <= p3_y; y += 1) {
            if (y < p2.y) {
              this.processScanLine(y, p1, p2, p1, p3, color);
            } else {
              this.processScanLine(y, p2, p3, p1, p3, color);
            }
          }
        }
      };

      return Device;

    })();
    return SoftEngine.Device = Device;
  })(SoftEngine);

}).call(this);
