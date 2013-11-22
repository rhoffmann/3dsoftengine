do (SoftEngine = {}) ->

    SoftEngine.Device::drawBLine = (p0, p1) ->
        x0 = p0.x >> 0
        y0 = p0.y >> 0
        x1 = p1.x >> 0
        y1 = p1.y >> 0

        dx = Math.abs(x1 - x0)
        dy = Math.abs(y1 - y0)

        sx = if x0 < x1 then 1 else -1
        sy = if y0 < y1 then 1 else -1

        err = dx - dy

        loop
            @drawPoint new BABYLON.Vector2(x0, y0)
            break if (`x0 == x1`) and (`y0 == y1`)
            e2 = 2 * err
            if e2 > -dy
                err -= dy
                x0 += sx
            if e2 < dx
                err += dx
                y0 += sy

