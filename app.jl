module App
include("transfer_matrix.jl")
using Genie, Genie.Router, Genie.Assets, JSON


Genie.config.websockets_server = true # enable the websockets server

route("/")do 
    Assets.channels_support()
    Genie.WebChannels.unsubscribe_disconnected_clients()
    serve_static_file("simulation.html")
end

channel("/____/echo") do 
    # @info "Received: $(params(:payload))"
    payload = params(:payload)

    pos = [element["x"] for element in params(:payload)["disc_data"]]
    thickness = [element["width"] for element in params(:payload)["disc_data"]]
    eps = [element["dielect_const"] for element in params(:payload)["disc_data"]]
    freq = collect(LinRange(params(:payload)["f_min"], params(:payload)["f_max"], params(:payload)["n"]))
    tan_delta = params(:payload)["tan_delta"] 

    if params(:payload)["mirror"] 
        tm = transfer_matrix(Pos, freq, pos, thickness, tand=tan_delta, eps=eps[1])
    else
        tm = transfer_matrix(Pos, freq, pos, thickness, eps=eps[1], tand=tan_delta, nm=1)
    end
    boost = abs2.(tm[:,2])
    ref = abs2.(tm[:,1])

    data = hcat(freq./10^9, boost, ref)
    try
        Genie.WebChannels.broadcast("____", JSON.json(transpose(data))) 
    catch
        @info "Daten konnten nicht gesendet werden"
    end
    #Genie.WebChannels.unsubscribe_disconnected_clients()
end

channel("/____/Efield") do 
    @info "data received"
    Genie.WebChannels.broadcast("/____/Efield", "test") 
    Genie.WebChannels.broadcast("____", )
end



end

# using Genie;Genie.loadapp(); up()