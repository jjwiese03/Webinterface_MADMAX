module Routes
include("simulation.jl")
using Genie, Genie.Router, Genie.WebChannels, Genie.Assets, JSON
using MADboost

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

    # allgemeine parameter
    disc_data = payload["disc_data"]
    fs = LinRange(payload["f_min"], payload["f_max"], payload["n"])
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

    n = length(disc_data)    # number of discs

    # absolute positionen in relative positionen umrechnen

    # distance_params als Symbols
    # [:l1, ..., :ln] params distances of disks
    distance_params = [Symbol("l$(i+1)") for i in 1:n]  # => [:l2, :l3, ...]    

    #reorder distances
    reorder_vals = [disc_data[i] for i in n:-1:1]      

    #calclaute the relative distances of the disks: 
    #(app uses distance from mirror to disk, but for the calculation we need the distances between the disks)
    xs = [d[:x] for d in reorder_vals]
    ws = [d[:width] for d in reorder_vals]

    distance_vals = [
        i == n ? xs[i] : xs[i] - xs[i+1] - sum(ws[i+1])
        for i in 1:n
    ]


    refl_sim = TMSimulation(n, distance_params,
                            Dict(
                                :l_taper => 0.2,
                                :l1 => 0.2,
                                :d_disk => 1e-3,
                                :eps_disk => 9.35,
                                :mirror_cond => 5.9e7,
                                :attenuation => 1e-4,
                                :tand_disk => 3e-5,
                                :radius => 48e-3
                            ), nothing)
    refl_sim.fixed_params[:dtand] = refl_sim.fixed_params[:tand_disk] * refl_sim.fixed_params[:d_disk]



    lna = LNAfromZ(collect(fs), fill(35.0, length(fs)), 0)
    short = DUT(lna.f, -1, 0)
    open = DUT(lna.f, 1, 0)
    match = DUT(lna.f, 0, 293)
    booster = DUT(lna.f,
        (fs, ps) -> simulate(refl_sim, fs, ps)[:booster_refl],
        (Γ) -> (1 .- abs2.(Γ)) * 293)
    fixed_params = [:lna_short_delay, :lna_open_delay, :lna_booster_delay, :V_noise, :I_noise, :corr_mag, :corr_phi]
    lna_sim_params = vcat(fixed_params, distance_params)
    lna_sim = LNASimulation(lna, [nothing, nothing, 0.0, nothing], [short, open, match, booster],
        ["lna_short", "lna_open", "lna_load", "lna_booster"],
        lna_sim_params,
        refl_sim.fixed_params);
        
        
    initial_params = [5e-11, 5e-11, 5e-10, 0, 0, 1, 0]
    lna_res_sim_params = vcat(initial_params, distance_vals)
    lna_res_sim = simulate(lna_sim, fs, lna_res_sim_params)

    results = Dict(
    "short"   => [[f, y] for (f, y) in zip(freq, lna_res_sim[:lna_short])],
    "open"    => [[f, y] for (f, y) in zip(freq, lna_res_sim[:lna_open])],
    "load"    => [[f, y] for (f, y) in zip(freq, lna_res_sim[:lna_load])],
    "booster" => [[f, y] for (f, y) in zip(freq, lna_res_sim[:lna_booster])]
    )

    JSON.json(results["short"])
end

end
