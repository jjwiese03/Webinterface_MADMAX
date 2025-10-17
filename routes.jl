module Routes
include("simulation.jl")
using Genie, Genie.Router, Genie.WebChannels, Genie.Assets, JSON
# using MADboost

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
    
    tm = transfer_matrix(freq, pos, thickness, tand=tan_delta, eps=eps[1], nm=nm)

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

    # allgemeine parameter
    disc_data = payload["disc_data"]    # Disc Einstellungen in der Form [Dict(:x => , :width => , :dielect_const => ),Dict(:x => , :width => , :dielect_const => ), ...]
    # in deinem Beispiel heißt es ax.discs
    fs = LinRange(payload["f_min"], payload["f_max"], payload["n"])     # Frequenzen, an denen die Daten berechnet werden sollen (Datentyp ist ein Range-Operator start:step:stop)
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

    # Berechne hier die nötigen werte.
    # Ich würde hier erstmal eine Berechnung mit festen Werten aus deinem Beispiel zu machen. Damit vermeiden wir Fehler.

    # Das Ergebnis muss die Form [[x1,y1],[x2,y2],[x3,y3],...] haben
    # Plotte am besten zunächst nur eine Linie dann können wir es nachher auf mehrere erweitern

    # Hier ein vereinfachtes Beispiel wie es am Ende assehen sollte. Berechnet wird hier statt der Noise einfach nur der Sinus jeder Frequenz.
    ydata = sin.(collect(fs))
    Ergebnis = hcat(collect(fs)./10^9, ydata)      # bringe die Daten in die richtige Form ([[x1,y1],[x2,y2],[x3,y3],...])

    JSON.json(transpose(Ergebnis))
end

end
