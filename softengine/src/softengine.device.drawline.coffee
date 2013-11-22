do (SoftEngine = {}) ->
    SoftEngine.Device::drawLine = (p0, p1) ->
        dist = p1.subtract(p0).length()
        if dist < 2 then return

        middlePoint = p0.add( p1.subtract(p0).scale(0.5) )
        @drawPoint(middlePoint)

        @drawLine(p0, middlePoint)
        @drawLine(middlePoint, p1)
