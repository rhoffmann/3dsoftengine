do (SoftEngine = {}) ->
    Device::LoadJSONFile = (fileName, callback) ->
        xmlhttp = new XMLHttpRequest()
        jsonObject = {}
        xmlhttp.onreadystatechange = =>
            if xmlhttp.readyState is 4 and xmlhttp.status is 200
                jsonObject = JSON.parse(xmlhttp.responseText)
                callback(@CreateMeshesFromJSON)

    Device::CreateMeshesFromJSON = (jsonObject) ->
        console.log(jsonObject)