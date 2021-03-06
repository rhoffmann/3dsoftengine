do (SoftEngine = {}) ->

    SoftEngine.Device::LoadJSONFile = (fileName, callback) ->
        jsonObject = {}
        xmlhttp = new XMLHttpRequest()
        xmlhttp.open "GET", fileName, true
        xmlhttp.onreadystatechange = =>
            if xmlhttp.readyState is 4 and xmlhttp.status is 200
                jsonObject = JSON.parse(xmlhttp.responseText)
                callback(@CreateMeshesFromJSON(jsonObject))

        xmlhttp.send(null)


    # special parser for babylon.js export files from blender
    SoftEngine.Device::CreateMeshesFromJSON = (jsonObject) ->
        meshes = []
        materials = []

        for mat in jsonObject.materials
            material = {
                Name : mat.name
                ID : mat.id
            }
            if mat.diffuseTexture
                material.DiffuseTextureName = mat.diffuseTexture.name
                materials[material.ID] = material

        for importMesh in jsonObject.meshes
            verticesArray = importMesh.vertices
            indicesArray = importMesh.indices
            uvCount = importMesh.uvCount

            verticeStep = 1
            # Depending of the number of texture's coordinates per vertex
            # we're jumping in the vertices array  by 6, 8 & 10 windows frame

            switch uvCount
                when 0 then verticeStep = 6
                when 1 then verticeStep = 8
                when 2 then verticeStep = 10
                else
                    console.error "unknown uvCount"

            # the number of interesting vertices information
            verticesCount = verticesArray.length / verticeStep

            # number of faces is logically the size of the array divided by 3 (A, B, C)
            facesCount = indicesArray.length / 3
            mesh = new SoftEngine.Mesh(
                importMesh.name,
                verticesCount,
                facesCount
            )

            # fill the vertices array of our mesh
            for index in [0 ... verticesCount]
                x = verticesArray[index * verticeStep]
                y = verticesArray[index * verticeStep + 1]
                z = verticesArray[index * verticeStep + 2]

                # load the vertex normal exportet by blender
                nx = verticesArray[index * verticeStep + 3]
                ny = verticesArray[index * verticeStep + 4]
                nz = verticesArray[index * verticeStep + 5]

                mesh.Vertices[index] = {
                    Coordinates : new BABYLON.Vector3(x, y, z)
                    Normal : new BABYLON.Vector3(nx, ny, nz)
                }

                # texture stuff
                if uvCount > 0
                    u = verticesArray[index * verticeStep + 6]
                    v = verticesArray[index * verticeStep + 7]
                    mesh.Vertices[index].TextureCoordinates = new BABYLON.Vector2(u, v)
                else
                    mesh.Vertices[index].TextureCoordinates = new BABYLON.Vector2(0, 0)

            # fill the faces array
            for index in [0 ... facesCount]
                a = indicesArray[index * 3]
                b = indicesArray[index * 3 + 1]
                c = indicesArray[index * 3 + 2]
                mesh.Faces[index] =
                    A : a,
                    B : b,
                    C : c

            # get the position from blender
            position = importMesh.position
            mesh.Position = new BABYLON.Vector3( position[0], position[1], position[2] )

            if uvCount > 0
                meshTextureID = importMesh.materialId
                meshTextureName = materials[meshTextureID].DiffuseTextureName
                mesh.Texture = new SoftEngine.Texture(meshTextureName, 512, 512)

            meshes.push(mesh)

        return meshes
