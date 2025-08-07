module App
include("transfer_matrix.jl")
using Genie, Genie.Router, Genie.WebChannels, Genie.Assets, JSON


Genie.config.websockets_server = true # enable the websockets server

route("/")do 
    Assets.channels_support()
    Genie.WebChannels.unsubscribe_disconnected_clients()
    @info Genie.WebChannels.clients()
    serve_static_file("simulation.html")
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
    
    tm = transfer_matrix(Pos, freq, pos, thickness, tand=tan_delta, eps=eps[1], nm=nm)

    boost = abs2.(tm[:,2])
    ref = abs2.(tm[:,1])

    data = hcat(freq./10^9, boost, ref)
    Genie.WebChannels.message(client, JSON.json(transpose(data)))


    # @info WebChannels.broadcast("____", JSON.json(transpose(data)))
    #Genie.WebChannels.unsubscribe_disconnected_clients()
end


end
