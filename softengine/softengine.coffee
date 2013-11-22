class Camera
    constructor : ->
        @Position = BABYLON.Vector3.Zero()
        @Target = BABYLON.Vector3.Zero()


class Mesh
    constructor : (name, verticesCount, facesCount) ->
        @name = name
        @Vertices = new Array(verticesCount)
        @Faces = new Array(facesCount)
        @Rotation = BABYLON.Vector3.Zero()
        @Position = BABYLON.Vector3.Zero()


@SoftEngine = {
    Mesh : Mesh
    Camera : Camera
}

