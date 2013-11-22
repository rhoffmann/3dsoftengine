do (SoftEngine = {}) ->

    class Texture
        constructor : (filename, width, height) ->
            @width = width
            @height = height
            @load filename

        load : (filename) ->
            imageTexture = new Image()
            imageTexture.height = @height
            imageTexture.width = @width
            imageTexture.onload = =>
                internalCanvas = document.createElement("canvas")
                internalCanvas.width = @width
                internalCanvas.height = @height
                internalContext = internalCanvas.getContext("2d")
                internalContext.drawImage(imageTexture, 0, 0)
                @internalBuffer = internalContext.getImageData(0, 0, @width, @height)
                return

            imageTexture.src = filename
            return

        map : (tu, tv) ->
            if @internalBuffer
                u = Math.abs((( tu * @width) % @width )) >> 0
                v = Math.abs((( tv * @height) % @height )) >> 0
                pos = (u + v * @width) * 4
                r = @internalBuffer.data[pos]
                g = @internalBuffer.data[pos + 1]
                b = @internalBuffer.data[pos + 2]
                a = @internalBuffer.data[pos + 3]
                return new BABYLON.Color4(r / 255.0, g / 255.0, b / 255.0, a / 255.0)
            else
                return new BABYLON.Color4(1, 1, 1, 0)

    SoftEngine.Texture = Texture
