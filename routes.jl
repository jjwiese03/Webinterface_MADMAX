module Routes
include("simulation.jl")
using Genie, Genie.Router, Genie.WebChannels, Genie.Assets, JSON


route("/")do 
    Assets.channels_support()
    Genie.WebChannels.unsubscribe_disconnected_clients()
    serve_static_file("index.html")
end

channel("/Boost/echo") do
    payload = params(:payload)
    client =  params(:WS_CLIENT)

    pos = [element["x"] for element in payload["disc_data"]]
    thickness = [element["width"] for element in payload["disc_data"]]
    eps = [element["dielect_const"] for element in payload["disc_data"]]
    freq = collect(LinRange(payload["f_min"], payload["f_max"], payload["n"]))
    tan_delta = payload["tan_delta"] 
    nm = (payload["mirror"]) ? 1e15 : 1
    
    tm = transfer_matrix(Pos, freq, pos, thickness, tand=tan_delta, eps=eps[1], nm=nm)

    boost = abs2.(tm[:,2])
    ref = abs2.(tm[:,1])

    data = hcat(freq./10^9, boost, ref)
    # Genie.WebChannels.message(client, JSON.json(transpose(data)))
    JSON.json(transpose(data))
    
end

channel("/Efield/echo") do
    payload = params(:payload)

    pos = [element["x"] for element in params(:payload)["disc_data"]]
    thickness = [element["width"] for element in params(:payload)["disc_data"]]
    eps = [element["dielect_const"] for element in params(:payload)["disc_data"]]
    freq = collect(LinRange(params(:payload)["f_min"], params(:payload)["f_max"], params(:payload)["n"]))
    tan_delta = params(:payload)["tan_delta"] 
    nm = (params(:payload)["mirror"]) ? 1e15 : 1

    JSON.json([[0,0],[1,5],[3,-2]])
end

channel("/Noise/echo") do 
    payload = params(:payload)
    client =  params(:WS_CLIENT)

    pos = [element["x"] for element in payload["disc_data"]]
    thickness = [element["width"] for element in payload["disc_data"]]
    eps = [element["dielect_const"] for element in payload["disc_data"]]
    freq = collect(LinRange(payload["f_min"], payload["f_max"], payload["n"]))
    tan_delta = payload["tan_delta"] 
    nm = (payload["mirror"]) ? 1e15 : 1
    

    noise = sin.(freq)
    data_noise = hcat(freq./10^9, noise)
    JSON.json(transpose(data_noise))
end

end
