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
    mesh = new SoftEngine.Mesh("Cube", 8, 12);
    meshes.push(mesh);
    cam = new SoftEngine.Camera();
    device = new SoftEngine.Device(canvas);
    mesh.Vertices = [new BABYLON.Vector3(-1, 1, 1), new BABYLON.Vector3(1, 1, 1), new BABYLON.Vector3(-1, -1, 1), new BABYLON.Vector3(1, -1, 1), new BABYLON.Vector3(-1, 1, -1), new BABYLON.Vector3(1, 1, -1), new BABYLON.Vector3(1, -1, -1), new BABYLON.Vector3(-1, -1, -1)];
    mesh.Faces = [
      {
        A: 0,
        B: 1,
        C: 2
      }, {
        A: 1,
        B: 2,
        C: 3
      }, {
        A: 1,
        B: 3,
        C: 6
      }, {
        A: 1,
        B: 5,
        C: 6
      }, {
        A: 0,
        B: 1,
        C: 4
      }, {
        A: 1,
        B: 4,
        C: 5
      }, {
        A: 2,
        B: 3,
        C: 7
      }, {
        A: 3,
        B: 6,
        C: 7
      }, {
        A: 0,
        B: 2,
        C: 7
      }, {
        A: 0,
        B: 4,
        C: 7
      }, {
        A: 4,
        B: 5,
        C: 6
      }, {
        A: 4,
        B: 6,
        C: 7
      }
    ];
    cam.Position = new BABYLON.Vector3(0, 0, 10);
    cam.Target = new BABYLON.Vector3(0, 0, 0);
    requestAnimationFrame(drawingLoop);
  };

  drawingLoop = function() {
    device.clear();
    mesh.Rotation.x += 0.01;
    mesh.Rotation.y += 0.01;
    device.render(cam, meshes);
    device.present();
    device.renderCoordinates(cam, meshes);
    device.debug("hallo");
    requestAnimationFrame(drawingLoop);
  };

  document.addEventListener("DOMContentLoaded", init, false);

}).call(this);
