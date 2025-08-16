module App
include("simulation.jl")
transfer_matrix([1],[1],[1])
using Genie, Genie.Router, Genie.WebChannels, Genie.Assets, JSON


Genie.config.websockets_server = true # enable the websockets server

route("/")do 
    Assets.channels_support()
    Genie.WebChannels.unsubscribe_disconnected_clients()
    serve_static_file("index.html")
end

channel("/____/echo") do
    # @info "Received: $(params(:payload))"
    payload = params(:payload)
    client =  params(:WS_CLIENT)

    pos = [element["x"] for element in params(:payload)["disc_data"]]
    thickness = [element["width"] for element in params(:payload)["disc_data"]]
    eps = [element["dielect_const"] for element in params(:payload)["disc_data"]]
    freq = collect(LinRange(params(:payload)["f_min"], params(:payload)["f_max"], params(:payload)["n"]))
    tan_delta = params(:payload)["tan_delta"] 
    nm = (params(:payload)["mirror"]) ? 1e15 : 1
    
    tm = transfer_matrix(freq, pos, thickness, tand=tan_delta, eps=eps[1], nm=nm)

    boost = abs2.(tm[:,2])
    ref = abs2.(tm[:,1])

    data = hcat(freq./10^9, boost, ref)
    JSON.json(transpose(data))
end


end
