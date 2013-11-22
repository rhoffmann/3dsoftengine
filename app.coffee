meshes = []
canvas = null
device = null
cam = null
mesh = null
previousDate = new Date().getTime()

window.requestAnimationFrame = do ->
    window.requestAnimationFrame or
    window.webkitRequestAnimationFrame or
    window.mozRequestAnimationFrame or
    (callback) -> window.setTimeout(callback, 1000 / 60)


init = ->
    canvas = document.getElementById("scene")

    cam = new SoftEngine.Camera()
    device = new SoftEngine.Device(canvas, fullscreen : false)

    cam.Position = new BABYLON.Vector3(0, 0, 10)
    cam.Target = new BABYLON.Vector3(0, 0, 0)

    device.LoadJSONFile "monkey.babylon", (meshesLoaded) ->
        console.log "meshes loaded"
        console.dir meshesLoaded

        meshes = meshesLoaded
        requestAnimationFrame( drawingLoop )


drawingLoop = ->
    device.clear()
    now = new Date().getTime()
    currentFps = 1000.0 / (now - previousDate)
    previousDate = now

    for mesh in meshes
        mesh.Rotation.x += 0.01
        mesh.Rotation.y += 0.01

    device.render(cam, meshes)
    device.present()

    #device.renderCoordinates(cam, meshes)
    if device.debug?
        device.debug( "fps: #{currentFps.toFixed(2)}" )

    requestAnimationFrame(drawingLoop)


document.addEventListener("DOMContentLoaded", init, false)
