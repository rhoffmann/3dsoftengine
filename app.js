(function() {
  var cam, canvas, device, drawingLoop, init, mesh, meshes, previousDate;

  meshes = [];

  canvas = null;

  device = null;

  cam = null;

  mesh = null;

  previousDate = new Date().getTime();

  window.requestAnimationFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      return window.setTimeout(callback, 1000 / 60);
    };
  })();

  init = function() {
    canvas = document.getElementById("scene");
    cam = new SoftEngine.Camera();
    device = new SoftEngine.Device(canvas, {
      fullscreen: false
    });
    cam.Position = new BABYLON.Vector3(0, 0, 10);
    cam.Target = new BABYLON.Vector3(0, 0, 0);
    return device.LoadJSONFile("monkey.babylon", function(meshesLoaded) {
      console.log("meshes loaded");
      console.dir(meshesLoaded);
      meshes = meshesLoaded;
      return requestAnimationFrame(drawingLoop);
    });
  };

  drawingLoop = function() {
    var currentFps, mesh, now, _i, _len;
    device.clear();
    now = new Date().getTime();
    currentFps = 1000.0 / (now - previousDate);
    previousDate = now;
    for (_i = 0, _len = meshes.length; _i < _len; _i++) {
      mesh = meshes[_i];
      mesh.Rotation.x += 0.01;
      mesh.Rotation.y += 0.01;
    }
    device.render(cam, meshes);
    device.present();
    if (device.debug != null) device.debug("fps: " + (currentFps.toFixed(2)));
    return requestAnimationFrame(drawingLoop);
  };

  document.addEventListener("DOMContentLoaded", init, false);

}).call(this);
