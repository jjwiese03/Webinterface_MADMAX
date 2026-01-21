module Routes

include("simulation.jl")
using Genie, Genie.Router, Genie.WebChannels, Genie.Assets, JSON

route("/") do 
    Assets.channels_support()
    Genie.WebChannels.unsubscribe_disconnected_clients()
    serve_static_file("index.html")
end

channel("/Boost/echo") do
    payload = params(:payload)

    pos = Float64.(payload["disc_data"][1]) 
    thickness = Float64.(payload["disc_data"][2])
    eps = Float64.(payload["disc_data"][3])
    freq = collect(LinRange(payload["f_min"], payload["f_max"], payload["n"]))
    tan_delta = payload["tan_delta"] 
    nm = (payload["mirror"]) ? 1e15 : 1

    tm = transfer_matrix(freq, pos, thickness, tand=tan_delta, eps=eps[1], nm=nm)

    boost = abs2.(tm[:,2])
    ref = abs2.(tm[:,1])

    data = hcat(freq./10^9, boost, ref)
    JSON.json(transpose(data))
end

channel("/Efield/echo") do
    # payload = params(:payload)

    # pos = [element["x"] for element in params(:payload)["disc_data"]]
    # thickness = [element["width"] for element in params(:payload)["disc_data"]]
    # eps = [element["dielect_const"] for element in params(:payload)["disc_data"]]
    # freq = collect(LinRange(params(:payload)["f_min"], params(:payload)["f_max"], params(:payload)["n"]))
    # tan_delta = params(:payload)["tan_delta"] 
    # nm = (params(:payload)["mirror"]) ? 1e15 : 1

    JSON.json([[0,0],[1,5],[3,-2]])
end

end