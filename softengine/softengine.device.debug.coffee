do (SoftEngine = {}) ->
    SoftEngine.Device::debug = (text) ->
        @workingContext.fillText(text, 10, 10)