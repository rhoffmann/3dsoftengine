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

      Device.prototype.project = function(vertex, transMat, world) {
        var normal3DWorld, point2d, point3DWorld, x, y;
        point2d = BABYLON.Vector3.TransformCoordinates(vertex.Coordinates, transMat);
        point3DWorld = BABYLON.Vector3.TransformCoordinates(vertex.Coordinates, world);
        normal3DWorld = BABYLON.Vector3.TransformCoordinates(vertex.Normal, world);
        x = point2d.x * this.workingWidth + this.workingWidth / 2.0;
        y = -point2d.y * this.workingHeight + this.workingHeight / 2.0;
        return {
          Coordinates: new BABYLON.Vector3(x, y, point2d.z),
          Normal: normal3DWorld,
          WorldCoordinates: point3DWorld
        };
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
            pA = this.project(vertexA, transformMatrix, worldMatrix);
            pB = this.project(vertexB, transformMatrix, worldMatrix);
            pC = this.project(vertexC, transformMatrix, worldMatrix);
            color = 1.0;
            this.drawTriangle(pA, pB, pC, new BABYLON.Color4(color, color, color, 1));
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

      Device.prototype.processScanLine = function(data, va, vb, vc, vd, color) {
        var enl, ex, gradient, gradient1, gradient2, ndotl, pa, pb, pc, pd, snl, sx, x, z, z1, z2;
        pa = va.Coordinates;
        pb = vb.Coordinates;
        pc = vc.Coordinates;
        pd = vd.Coordinates;
        gradient1 = pa.y != pb.y ? (data.currentY - pa.y) / (pb.y - pa.y) : 1;
        gradient2 = pc.y != pd.y ? (data.currentY - pc.y) / (pd.y - pc.y) : 1;
        sx = this.interpolate(pa.x, pb.x, gradient1) >> 0;
        ex = this.interpolate(pc.x, pd.x, gradient2) >> 0;
        z1 = this.interpolate(pa.z, pb.z, gradient1);
        z2 = this.interpolate(pc.z, pd.z, gradient2);
        snl = this.interpolate(data.ndotla, data.ndotlb, gradient1);
        enl = this.interpolate(data.ndotlc, data.ndotld, gradient2);
        for (x = sx; x < ex; x += 1) {
          gradient = (x - sx) / (ex - sx);
          z = this.interpolate(z1, z2, gradient);
          ndotl = this.interpolate(snl, enl, gradient);
          this.drawPoint(new BABYLON.Vector3(x, data.currentY, z), new BABYLON.Color4(color.r * ndotl, color.g * ndotl, color.b * ndotl, 1));
        }
      };

      Device.prototype.computeNDotL = function(vertex, normal, lightPosition) {
        var lightDirection;
        lightDirection = lightPosition.subtract(vertex);
        normal.normalize();
        lightDirection.normalize();
        return Math.max(0, BABYLON.Vector3.Dot(normal, lightDirection));
      };

      Device.prototype.drawTriangle = function(v1, v2, v3, color) {
        var dP1P2, dP1P3, data, lightPos, nl1, nl2, nl3, p1, p1_y, p2, p3, p3_y, y, _ref, _ref2, _ref3;
        if (v1.Coordinates.y > v2.Coordinates.y) {
          _ref = [v1, v2], v2 = _ref[0], v1 = _ref[1];
        }
        if (v2.Coordinates.y > v3.Coordinates.y) {
          _ref2 = [v3, v2], v2 = _ref2[0], v3 = _ref2[1];
        }
        if (v1.Coordinates.y > v2.Coordinates.y) {
          _ref3 = [v1, v2], v2 = _ref3[0], v1 = _ref3[1];
        }
        p1 = v1.Coordinates;
        p2 = v2.Coordinates;
        p3 = v3.Coordinates;
        lightPos = new BABYLON.Vector3(0, 10, 10);
        nl1 = this.computeNDotL(v1.WorldCoordinates, v1.Normal, lightPos);
        nl2 = this.computeNDotL(v2.WorldCoordinates, v2.Normal, lightPos);
        nl3 = this.computeNDotL(v3.WorldCoordinates, v3.Normal, lightPos);
        data = {};
        dP1P2 = p2.y - p1.y > 0 ? (p2.x - p1.x) / (p2.y - p1.y) : 0;
        dP1P3 = p3.y - p1.y > 0 ? (p3.x - p1.x) / (p3.y - p1.y) : 0;
        if (dP1P2 > dP1P3) {
          p1_y = p1.y >> 0;
          p3_y = p3.y >> 0;
          for (y = p1_y; y <= p3_y; y += 1) {
            data.currentY = y;
            if (y < p2.y) {
              data.ndotla = nl1;
              data.ndotlb = nl3;
              data.ndotlc = nl1;
              data.ndotld = nl2;
              this.processScanLine(data, v1, v3, v1, v2, color);
            } else {
              data.ndotla = nl1;
              data.ndotlb = nl3;
              data.ndotlc = nl2;
              data.ndotld = nl3;
              this.processScanLine(data, v1, v3, v2, v3, color);
            }
          }
        } else {
          p1_y = p1.y >> 0;
          p3_y = p3.y >> 0;
          for (y = p1_y; y <= p3_y; y += 1) {
            data.currentY = y;
            if (y < p2.y) {
              data.ndotla = nl1;
              data.ndotlb = nl2;
              data.ndotlc = nl1;
              data.ndotld = nl3;
              this.processScanLine(data, v1, v2, v1, v3, color);
            } else {
              data.ndotla = nl2;
              data.ndotlb = nl3;
              data.ndotlc = nl1;
              data.ndotld = nl3;
              this.processScanLine(data, v2, v3, v1, v3, color);
            }
          }
        }
      };

      return Device;

    })();
    return SoftEngine.Device = Device;
  })(SoftEngine);

}).call(this);
