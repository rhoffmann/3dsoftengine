(function() {
  var Camera, Mesh;

  Camera = (function() {

    function Camera() {
      this.Position = BABYLON.Vector3.Zero();
      this.Target = BABYLON.Vector3.Zero();
    }

    return Camera;

  })();

  Mesh = (function() {

    function Mesh(name, verticesCount, facesCount) {
      this.name = name;
      this.Vertices = new Array(verticesCount);
      this.Faces = new Array(facesCount);
      this.Rotation = BABYLON.Vector3.Zero();
      this.Position = BABYLON.Vector3.Zero();
    }

    return Mesh;

  })();

  this.SoftEngine = {
    Mesh: Mesh,
    Camera: Camera
  };

}).call(this);
