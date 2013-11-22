do (SoftEngine = {}) ->

    class Device

        constructor : (canvas, fullscreen = false) ->
            @workingCanvas = canvas
            @setupCanvas()
            if fullscreen
                window.addEventListener 'resize', @onResizeCanvas, false
                @onResizeCanvas()

        setupCanvas : () ->
            @workingWidth = @workingCanvas.width
            @workingHeight = @workingCanvas.height
            @workingContext = @workingCanvas.getContext '2d'
            @workingContext.fillStyle = "#000"
            @workingContext.font = "normal 10px sans-serif";

        onResizeCanvas : =>
            @workingCanvas.width = window.innerWidth
            @workingCanvas.height = window.innerHeight
            @setupCanvas()

        clear : ->
            @workingContext.clearRect(0, 0, @workingWidth, @workingHeight)
            @backbuffer = @workingContext.getImageData(0, 0, @workingWidth, @workingHeight)

        present : ->
            @workingContext.putImageData(@backbuffer, 0, 0)


        renderCoordinates : (camera, meshes, objSpace = false) ->
            viewMatrix = BABYLON.Matrix.LookAtLH( camera.Position, camera.Target, BABYLON.Vector3.Up() )
            projectionMatrix = BABYLON.Matrix.PerspectiveFovLH( 0.78, @workingWidth / @workingHeight, 0.01, 1.0 )

            for cMesh in meshes
                worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(
                  cMesh.Rotation.y,
                  cMesh.Rotation.x,
                  cMesh.Rotation.z
                ).multiply(
                  BABYLON.Matrix.Translation(
                    cMesh.Position.x,
                    cMesh.Position.y,
                    cMesh.Position.z
                  )
                )

                transformMatrix = worldMatrix.multiply( viewMatrix ).multiply( projectionMatrix )

                # object space coordinates
                if objSpace
                    for vertice in cMesh.Vertices
                        projectedPoint = @project( vertice, transformMatrix )
                        @workingContext.fillText "(#{vertice.x},#{vertice.y},#{vertice.z})", projectedPoint.x, projectedPoint.y

                # projected coordinates
                else
                    for vertice in cMesh.Vertices
                        projectedPoint = @project( vertice, transformMatrix )
                        @workingContext.fillText "(#{projectedPoint.x},#{projectedPoint.y})", projectedPoint.x, projectedPoint.y

        putPixel : (x, y, color) ->
            @backbufferdata = @backbuffer.data
            # As we have a 1-D Array for our back buffer
            # we need to know the equivalent cell index in 1-D based
            # on the 2D coordinates of the screen
            index = ((x >> 0) + (y >> 0) * @workingWidth) * 4

            # RGBA color space in HTML5 canvas
            @backbufferdata[index]      = color.r * 255;
            @backbufferdata[index + 1]  = color.g * 255;
            @backbufferdata[index + 2]  = color.b * 255;
            @backbufferdata[index + 3]  = color.a * 255;

        project : (coord, transMat) ->
            point = BABYLON.Vector3.TransformCoordinates(coord, transMat)
            # The transformed coordinates will be based on coordinate system
            # starting on the center of the screen. But drawing on screen normally starts
            # from top left. We then need to transform them again to have x:0, y:0 on top left.
            x =  point.x * @workingWidth + @workingWidth / 2.0 >> 0
            y = -point.y * @workingHeight + @workingHeight / 2.0 >> 0

            return new BABYLON.Vector2(x, y, point.z)

        drawPoint : (point, color) ->
            if point.x >= 0 and point.y >= 0 and point.x < @workingWidth and point.y < @workingHeight
                @putPixel(point.x, point.y, color)

        render : (camera, meshes) ->
            viewMatrix = BABYLON.Matrix.LookAtLH( camera.Position, camera.Target, BABYLON.Vector3.Up() )
            projectionMatrix = BABYLON.Matrix.PerspectiveFovLH( 0.78, @workingWidth / @workingHeight, 0.01, 1.0 )

            for cMesh in meshes
                worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(
                    cMesh.Rotation.y,
                    cMesh.Rotation.x,
                    cMesh.Rotation.z
                ).multiply(
                    BABYLON.Matrix.Translation(
                        cMesh.Position.x,
                        cMesh.Position.y,
                        cMesh.Position.z
                    )
                )

                transformMatrix = worldMatrix.multiply( viewMatrix ).multiply( projectionMatrix )

                # renders faces
                for currentFace, indexFaces in cMesh.Faces
                    vertexA = cMesh.Vertices[currentFace.A]
                    vertexB = cMesh.Vertices[currentFace.B]
                    vertexC = cMesh.Vertices[currentFace.C]

                    pA = @project( vertexA, transformMatrix )
                    pB = @project( vertexB, transformMatrix )
                    pC = @project( vertexC, transformMatrix )

                    color = 0.25 + ((indexFaces % cMesh.Faces.length) / cMesh.Faces.length) * 0.75;

                    @drawTriangle(pA, pB, pC, new BABYLON.Color4(color, color, color, 1))

        # keep a value between 0 and 1
        clamp : (value, min = 0, max = 1) -> Math.max min, Math.min(value, max)

        # interpolate the value between 2 vertices
        # min is the starting point, max the ending point
        # gradient the % betweetn the 2 points
        interpolate : (min, max, gradient) -> min + (max - min) * @clamp(gradient)

        # draw line between 2 points from left to right
        # papb -> pcpd
        # pa, pb, pc, pd must then be sorted before
        processScanLine : (y, pa, pb, pc, pd, color) ->
            gradient1 = if pa.y isnt pb.y then (y - pa.y) / (pb.y - pa.y) else 1
            gradient2 = if pc.y isnt pd.y then (y - pc.y) / (pd.y - pc.y) else 1
            sx = @interpolate(pa.x, pb.x, gradient1) >> 0
            ex = @interpolate(pc.x, pd.x, gradient2) >> 0

            @drawPoint(new BABYLON.Vector2(x,y), color) for x in [sx .. ex]

        drawTriangle : (p1, p2, p3, color) ->
            # Sorting the points in order to always have this order on screen p1, p2 & p3
            # with p1 always up (thus having the Y the lowest possible to be near the top screen)
            # then p2 between p1 & p3
            [p2, p1] = [p1, p2] if p1.y > p2.y
            [p2, p3] = [p3, p2] if p2.y > p3.y
            [p2, p1] = [p1, p2] if p1.y > p2.y

            # inverse slopes
            dP1P2 = if p2.y - p1.y > 0 then (p2.x - p1.x) / (p2.y - p1.y) else 0
            dP1P3 = if p3.y - p1.y > 0 then (p3.x - p1.x) / (p3.y - p1.y) else 0

            # case: triangles like that
            # P1
            # -
            # --
            # - -
            # -  -
            # -   - P2
            # -  -
            # - -
            # --
            # -
            # P3

            if dP1P2 > dP1P3
                for y in [p1.y >> 0 ... p3.y >> 0]
                    if y < p2.y
                        @processScanLine(y, p1, p3, p1, p2, color)
                    else
                        @processScanLine(y, p1, p3, p2, p3, color)

            # case: triangles like that
            #       P1
            #        -
            #       --
            #      - -
            #     -  -
            # P2 -   -
            #     -  -
            #      - -
            #       --
            #        -
            #       P3

            if dP1P2 < dP1P3
                for y in [p1.y >> 0 ... p3.y >> 0]
                    if y < p2.y
                        @processScanLine(y, p1, p2, p1, p3, color)
                    else
                        @processScanLine(y, p2, p3, p1, p3, color)

    SoftEngine.Device = Device

