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
            @depthbuffer = new Array(@workingWidth * @workingHeight)
            @workingContext.fillStyle = "#000"
            @workingContext.font = "normal 10px sans-serif";

        onResizeCanvas : =>
            @workingCanvas.width = window.innerWidth
            @workingCanvas.height = window.innerHeight
            @setupCanvas()

        clear : ->
            @workingContext.clearRect(0, 0, @workingWidth, @workingHeight)
            @backbuffer = @workingContext.getImageData(0, 0, @workingWidth, @workingHeight)
            for i in [0 ... @depthbuffer.length] by 1
                @depthbuffer[i] = 10000000

            return

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

            return

        putPixel : (x, y, z, color) ->
            @backbufferdata = @backbuffer.data
            # As we have a 1-D Array for our back buffer
            # we need to know the equivalent cell index in 1-D based
            # on the 2D coordinates of the screen
            index = ((x >> 0) + (y >> 0) * @workingWidth)
            index4 = index * 4

            if @depthbuffer[index] < z then return
            @depthbuffer[index] = z

            # RGBA color space in HTML5 canvas
            @backbufferdata[index4]      = color.r * 255
            @backbufferdata[index4 + 1]  = color.g * 255
            @backbufferdata[index4 + 2]  = color.b * 255
            @backbufferdata[index4 + 3]  = color.a * 255

        # Project takes some 3D coordinates and transform them
        # in 2D coordinates using the transformation matrix
        # It also transform the same coordinates and the normal to the vertex
        # in the 3D world
        project : (vertex, transMat, world) ->
            # transform coordinates into 2D space
            point2d = BABYLON.Vector3.TransformCoordinates(vertex.Coordinates, transMat)

            # transforming the coordinates & the normal to the vertex in the 3D world
            point3DWorld = BABYLON.Vector3.TransformCoordinates(vertex.Coordinates, world)
            normal3DWorld = BABYLON.Vector3.TransformCoordinates(vertex.Normal, world)

            # The transformed coordinates will be based on coordinate system
            # starting on the center of the screen. But drawing on screen normally starts
            # from top left. We then need to transform them again to have x:0, y:0 on top left.
            x =  point2d.x * @workingWidth + @workingWidth / 2.0
            y = -point2d.y * @workingHeight + @workingHeight / 2.0

            return ({
                Coordinates : new BABYLON.Vector3(x, y, point2d.z)
                Normal : normal3DWorld
                WorldCoordinates : point3DWorld
            })

        drawPoint : (point, color) ->
            if point.x >= 0 and point.y >= 0 and point.x < @workingWidth and point.y < @workingHeight
                @putPixel(point.x, point.y, point.z, color)

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

                    pA = @project( vertexA, transformMatrix, worldMatrix )
                    pB = @project( vertexB, transformMatrix, worldMatrix )
                    pC = @project( vertexC, transformMatrix, worldMatrix )

                    color = 1.0;

                    @drawTriangle(pA, pB, pC, new BABYLON.Color4(color, color, color, 1))

            return

        # keep a value between 0 and 1
        clamp : (value, min = 0, max = 1) -> Math.max( min, Math.min(value, max) )

        # interpolate the value between 2 vertices
        # min is the starting point, max the ending point
        # gradient the % betweetn the 2 points
        interpolate : (min, max, gradient) -> min + (max - min) * @clamp(gradient)

        # draw line between 2 points from left to right
        # papb -> pcpd
        # pa, pb, pc, pd must then be sorted before
        processScanLine : (data, va, vb, vc, vd, color) ->
            pa = va.Coordinates
            pb = vb.Coordinates
            pc = vc.Coordinates
            pd = vd.Coordinates

            # Thanks to current Y, we can compute the gradient to compute others values like
            # the starting X (sx) and ending X (ex) to draw between
            # if pa.Y == pb.Y or pc.Y == pd.Y, gradient is forced to 1
            gradient1 = if `pa.y != pb.y` then (data.currentY - pa.y) / (pb.y - pa.y) else 1
            gradient2 = if `pc.y != pd.y` then (data.currentY - pc.y) / (pd.y - pc.y) else 1
            sx = @interpolate(pa.x, pb.x, gradient1) >> 0
            ex = @interpolate(pc.x, pd.x, gradient2) >> 0

            # starting z and ending z
            z1 = @interpolate(pa.z, pb.z, gradient1)
            z2 = @interpolate(pc.z, pd.z, gradient2)

            for x in [sx ... ex] by 1
                gradient = (x - sx) / (ex - sx)
                z = @interpolate(z1, z2, gradient)
                ndotl = data.ndotla

                # changing the color value using the cosine of the angle
                # between the light vector and the normal vector
                @drawPoint(
                  new BABYLON.Vector3(x, data.currentY, z),
                  new BABYLON.Color4(color.r * ndotl, color.g * ndotl, color.b * ndotl, 1)
                )

            return


        # Compute the cosine of the angle between the light vector and the normal vector
        # Returns a value between 0 and 1
        computeNDotL : (vertex, normal, lightPosition) ->
            lightDirection = lightPosition.subtract(vertex)
            normal.normalize()
            lightDirection.normalize()
            return Math.max 0, BABYLON.Vector3.Dot(normal, lightDirection)


        drawTriangle : (v1, v2, v3, color) ->

            # Sorting the points in order to always have this order on screen p1, p2 & p3
            # with p1 always up (thus having the Y the lowest possible to be near the top screen)
            # then p2 between p1 & p3
            [v2, v1] = [v1, v2] if v1.Coordinates.y > v2.Coordinates.y
            [v2, v3] = [v3, v2] if v2.Coordinates.y > v3.Coordinates.y
            [v2, v1] = [v1, v2] if v1.Coordinates.y > v2.Coordinates.y

            p1 = v1.Coordinates
            p2 = v2.Coordinates
            p3 = v3.Coordinates

            # normal face's vector is the average normal between each vertex's normal
            # computing also the center point of the face
            vnFace = (v1.Normal.add(v2.Normal.add(v3.Normal))).scale(1 / 3)
            centerPoint = (v1.WorldCoordinates.add(v2.WorldCoordinates.add(v3.WorldCoordinates))).scale(1 / 3)

            lightPos = new BABYLON.Vector3(0, 10, 10)

            # computing the cos of the angle between the light vector and the normal vector
            # it will return a value between 0 and 1 that will be used as the intensity of the color
            ndotl = @computeNDotL(centerPoint, vnFace, lightPos)
            data = { ndotla : ndotl }

            # inverse slopes
            dP1P2 = if (p2.y - p1.y > 0) then (p2.x - p1.x) / (p2.y - p1.y) else 0
            dP1P3 = if (p3.y - p1.y > 0) then (p3.x - p1.x) / (p3.y - p1.y) else 0

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
                p1_y = p1.y >> 0
                p3_y = p3.y >> 0
                for y in [p1_y .. p3_y] by 1
                    data.currentY = y
                    if y < p2.y
                        @processScanLine(data, v1, v3, v1, v2, color)
                    else
                        @processScanLine(data, v1, v3, v2, v3, color)

                return

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
                p1_y = p1.y >> 0
                p3_y = p3.y >> 0
                for y in [p1_y .. p3_y] by 1
                    data.currentY = y
                    if y < p2.y
                        @processScanLine(data, v1, v2, v1, v3, color)
                    else
                        @processScanLine(data, v2, v3, v1, v3, color)

                return

    SoftEngine.Device = Device

