meshes = []
canvas = null
device = null
cam = null
mesh = null

init = ->
    console.log "init"
    canvas = document.getElementById("scene")
    mesh = new SoftEngine.Mesh("Cube", 8, 12)
    meshes.push(mesh)

    cam = new SoftEngine.Camera()
    device = new SoftEngine.Device(canvas)

    mesh.Vertices = [
        new BABYLON.Vector3 -1,  1,  1  #0
        new BABYLON.Vector3  1,  1,  1  #1
        new BABYLON.Vector3 -1, -1,  1  #2
        new BABYLON.Vector3  1, -1,  1  #3
        new BABYLON.Vector3 -1,  1, -1  #4
        new BABYLON.Vector3  1,  1, -1  #5
        new BABYLON.Vector3  1, -1, -1  #6
        new BABYLON.Vector3 -1, -1, -1  #7
    ]

    mesh.Faces = [
        { A:0, B:1, C:2 }  #0
        { A:1, B:2, C:3 }  #1
        { A:1, B:3, C:6 }  #2
        { A:1, B:5, C:6 }  #3
        { A:0, B:1, C:4 }  #4
        { A:1, B:4, C:5 }  #5
        { A:2, B:3, C:7 }  #6
        { A:3, B:6, C:7 }  #7
        { A:0, B:2, C:7 }  #8
        { A:0, B:4, C:7 }  #9
        { A:4, B:5, C:6 }  #10
        { A:4, B:6, C:7 }  #11
    ]

    cam.Position = new BABYLON.Vector3(0, 0, 10)
    cam.Target = new BABYLON.Vector3(0, 0, 0)

    requestAnimationFrame(drawingLoop)

    return

drawingLoop = ->
    device.clear()

    mesh.Rotation.x += 0.01
    mesh.Rotation.y += 0.01

    device.render(cam, meshes)
    device.present()

    device.renderCoordinates(cam, meshes)
    device.debug("hallo")

    requestAnimationFrame(drawingLoop)

    return

document.addEventListener("DOMContentLoaded", init, false)
