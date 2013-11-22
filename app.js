(function() {
  var cam, canvas, device, drawingLoop, init, mesh, meshes;

  meshes = [];

  canvas = null;

  device = null;

  cam = null;

  mesh = null;

  init = function() {
    console.log("init");
    canvas = document.getElementById("scene");
    cam = new SoftEngine.Camera();
    device = new SoftEngine.Device(canvas, true);
    cam.Position = new BABYLON.Vector3(0, 0, 10);
    cam.Target = new BABYLON.Vector3(0, 0, 0);
    return device.LoadJSONFile("suzanne.babylon", function(meshesLoaded) {
      meshes = meshesLoaded;
      return requestAnimationFrame(drawingLoop);
    });
  };

  drawingLoop = function() {
    var mesh, _i, _len;
    device.clear();
    for (_i = 0, _len = meshes.length; _i < _len; _i++) {
      mesh = meshes[_i];
      mesh.Rotation.x += 0.01;
      mesh.Rotation.y += 0.01;
    }
    device.render(cam, meshes);
    device.present();
    return requestAnimationFrame(drawingLoop);
  };

  document.addEventListener("DOMContentLoaded", init, false);

}).call(this);
