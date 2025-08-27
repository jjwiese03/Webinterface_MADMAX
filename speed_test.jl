using BenchmarkTools
using Plots, LaTeXStrings

include("transfer_matrix.jl")

x = 0:5:1000
y = 0:1:200

times = Matrix{Float64}(undef, length(x), length(y))

# warm up
transfer_matrix(rand(Float64, 1), rand(Float64, 1), fill(0.001, 1))

for (i_f, n_f) in enumerate(x)
    freq = rand(Float64, n_f)
    for (i_p, n_p) in enumerate(y)
        pos = rand(Float64, n_p)
        thickness = fill(0.001, n_p)  
        times[i_f, i_p] = (@elapsed transfer_matrix(freq, pos, thickness))*10^3
    end
end
heatmap(x, y, times, xlabel="number of frequency points", ylabel="number of discs", title="runtime of TMA", color=:viridis, colorbar_title = "\nruntime [ms]", rightmargin = 5Plots.mm)



x = 0:10:1000
y = Vector{Float64}(undef, length(x))
for n_d in [30 80 100]
    for (i, n) in enumerate(x)
        freq = rand(Float32, n)
        pos = rand(Float32, n_d)
        thickness = fill(0.001, n)  # Achtung: Float64; bei Bedarf Float32(0.001)
        y[i] = (@elapsed transfer_matrix(freq, pos, thickness))*10^3
    end
    plot!(x, y, seriestype=:scatter, label=string("n = ", n_d), linewidth=1)
end
title!("runtime of tma")
xlabel!("frequency points")
ylabel!("runtime [ms]")

plot()
savefig("runtime.pdf")
