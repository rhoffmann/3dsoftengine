(function() {

  (function(SoftEngine) {
    if (SoftEngine == null) SoftEngine = {};
    SoftEngine.Device.prototype.LoadJSONFile = function(fileName, callback) {
      var jsonObject, xmlhttp,
        _this = this;
      jsonObject = {};
      xmlhttp = new XMLHttpRequest();
      xmlhttp.open("GET", fileName, true);
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          jsonObject = JSON.parse(xmlhttp.responseText);
          return callback(_this.CreateMeshesFromJSON(jsonObject));
        }
      };
      return xmlhttp.send(null);
    };
    return SoftEngine.Device.prototype.CreateMeshesFromJSON = function(jsonObject) {
      var a, b, c, facesCount, importMesh, index, indicesArray, mat, material, materials, mesh, meshTextureID, meshTextureName, meshes, nx, ny, nz, position, u, uvCount, v, verticeStep, verticesArray, verticesCount, x, y, z, _i, _j, _len, _len2, _ref, _ref2;
      meshes = [];
      materials = [];
      _ref = jsonObject.materials;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        mat = _ref[_i];
        material = {
          Name: mat.name,
          ID: mat.id
        };
        if (mat.diffuseTexture) {
          material.DiffuseTextureName = mat.diffuseTexture.name;
          materials[material.ID] = material;
        }
      }
      _ref2 = jsonObject.meshes;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        importMesh = _ref2[_j];
        verticesArray = importMesh.vertices;
        indicesArray = importMesh.indices;
        uvCount = importMesh.uvCount;
        verticeStep = 1;
        switch (uvCount) {
          case 0:
            verticeStep = 6;
            break;
          case 1:
            verticeStep = 8;
            break;
          case 2:
            verticeStep = 10;
            break;
          default:
            console.error("unknown uvCount");
        }
        verticesCount = verticesArray.length / verticeStep;
        facesCount = indicesArray.length / 3;
        mesh = new SoftEngine.Mesh(importMesh.name, verticesCount, facesCount);
        for (index = 0; 0 <= verticesCount ? index < verticesCount : index > verticesCount; 0 <= verticesCount ? index++ : index--) {
          x = verticesArray[index * verticeStep];
          y = verticesArray[index * verticeStep + 1];
          z = verticesArray[index * verticeStep + 2];
          nx = verticesArray[index * verticeStep + 3];
          ny = verticesArray[index * verticeStep + 4];
          nz = verticesArray[index * verticeStep + 5];
          mesh.Vertices[index] = {
            Coordinates: new BABYLON.Vector3(x, y, z),
            Normal: new BABYLON.Vector3(nx, ny, nz)
          };
          if (uvCount > 0) {
            u = verticesArray[index * verticeStep + 6];
            v = verticesArray[index * verticeStep + 7];
            mesh.Vertices[index].TextureCoordinates = new BABYLON.Vector2(u, v);
          } else {
            mesh.Vertices[index].TextureCoordinates = new BABYLON.Vector2(0, 0);
          }
        }
        for (index = 0; 0 <= facesCount ? index < facesCount : index > facesCount; 0 <= facesCount ? index++ : index--) {
          a = indicesArray[index * 3];
          b = indicesArray[index * 3 + 1];
          c = indicesArray[index * 3 + 2];
          mesh.Faces[index] = {
            A: a,
            B: b,
            C: c
          };
        }
        position = importMesh.position;
        mesh.Position = new BABYLON.Vector3(position[0], position[1], position[2]);
        if (uvCount > 0) {
          meshTextureID = importMesh.materialId;
          meshTextureName = materials[meshTextureID].DiffuseTextureName;
          mesh.Texture = new SoftEngine.Texture(meshTextureName, 512, 512);
        }
        meshes.push(mesh);
      }
      return meshes;
    };
  })(SoftEngine);

}).call(this);
