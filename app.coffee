meshes = []
canvas = null
device = null
cam = null
mesh = null


window.requestAnimationFrame = do ->
    window.requestAnimationFrame or
    window.webkitRequestAnimationFrame or
    window.mozRequestAnimationFrame or
    (callback) -> window.setTimeout(callback, 1000 / 60)


init = ->
    canvas = document.getElementById("scene")

    cam = new SoftEngine.Camera()
    device = new SoftEngine.Device(canvas, false)

    cam.Position = new BABYLON.Vector3(0, 0, 10)
    cam.Target = new BABYLON.Vector3(0, 0, 0)

    device.LoadJSONFile "suzanne.babylon", (meshesLoaded) ->
        console.log "meshes loaded"
        console.dir meshesLoaded

        meshes = meshesLoaded
        requestAnimationFrame( drawingLoop )


drawingLoop = ->
    device.clear()

    for mesh in meshes
#        mesh.Rotation.x += 0.01
        mesh.Rotation.y += 0.01

    device.render(cam, meshes)
    device.present()

#    device.renderCoordinates(cam, meshes)
#    device.debug("hallo")

    requestAnimationFrame(drawingLoop)


document.addEventListener("DOMContentLoaded", init, false)
