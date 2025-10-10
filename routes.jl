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

    # allgemeine Parameter
    pos = [element["x"] for element in payload["disc_data"]]
    thickness = [element["width"] for element in payload["disc_data"]]
    eps = [element["dielect_const"] for element in payload["disc_data"]]
    freq = collect(LinRange(payload["f_min"], payload["f_max"], payload["n"]))
    tan_delta = payload["tan_delta"] 
    nm = (payload["mirror"]) ? 1e15 : 1

    # spezifische Noise Parameter
    radius = payload["radius"] 
    attenuation = payload["attenuation"] 
    l_taper = payload["l_taper"] 
    lna_short_delay = payload["lna_short_delay"] 
    lna_open_delay = payload["lna_open_delay"] 
    lna_booster_delay = payload["lna_booster_delay"] 
    V_noise = payload["V_noise"] 
    l_noise = payload["l_noise"] 
    corr_mag = payload["corr_mag"] 
    corr_phi = payload["corr_phi"] 



    
    # Simulation des Noise
    Ergebnis = Simulationsfunktion(Paramater...)
    # Das Ergebnis muss die Form [[x1,y1],[x2,y2],[x3,y3]...] haben
    # Wenn wir später mehrere Funktionen (y,z,w ...) plotten hat das Ergebnis die Form [[x1,y1,z1,w1],[x2,y2,z2,w2]...]

    JSON.json(transpose(Ergebnis))
end

end
