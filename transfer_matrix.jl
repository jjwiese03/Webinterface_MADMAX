using StaticArrays, LinearAlgebra

export transfer_matrix, Dist, Pos

const c0 = 299792458.

abstract type Space end
abstract type Dist <: Space end
abstract type Pos  <: Space end

# test

function transfer_matrix(::Type{Pos},freqs::Union{Real,AbstractVector{<:Real}},
        position::AbstractVector{<:Real}, thickness::AbstractVector{<:Real};
        eps::Real=24.0,tand::Real=0.0,nm::Real=1e15)::Matrix{ComplexF64}

    ϵ  = eps*(1.0-1.0im*tand)
    nd = sqrt(ϵ); nm = complex(nm)
    ϵm = nm^2
    A  = 1-1/ϵ
    A0 = 1-1/ϵm

    l = length(freqs)
    RB = Matrix{ComplexF64}(undef,l,2)

    Gd = SMatrix{2,2,ComplexF64}((1+nd)/2,   (1-nd)/2,   (1-nd)/2,   (1+nd)/2)
    Gv = SMatrix{2,2,ComplexF64}((nd+1)/2nd, (nd-1)/2nd, (nd-1)/2nd, (nd+1)/2nd)
    G0 = SMatrix{2,2,ComplexF64}((1+nm)/2,   (1-nm)/2,   (1-nm)/2,   (1+nm)/2)
    T  = MMatrix{2,2,ComplexF64}(undef); copyto!(T,Gd)

    S  = SMatrix{2,2,ComplexF64}( A/2, 0.0im, 0.0im,  A/2)
    S0 = SMatrix{2,2,ComplexF64}(A0/2, 0.0im, 0.0im, A0/2)
    M  = MMatrix{2,2,ComplexF64}(undef); copyto!(M,S)

    W  = MMatrix{2,2,ComplexF64}(undef) # work matrix for multiplication

    @inbounds @views for j in eachindex(freqs)

        # iterate in reverse order to sum up M in single sweep (thx david)
        for i in Iterators.reverse(eachindex(position))
            pd1 = cispi(-2*freqs[j]*nd*thickness[i]/c0)
            pd2 = cispi(+2*freqs[j]*nd*thickness[i]/c0)
            T[:,1] .*= pd1
            T[:,2] .*= pd2 # T = Gd*Pd

            mul!(W,T,S); M .-= W        # M = Gd*Pd*S_-1
            mul!(W,T,Gv); copyto!(T,W)  # T *= Gd*Pd*Gv

            d = position[i]-(i==1 ? 0 : position[i-1]+thickness[1])
            T[:,1] .*= cispi(-2*freqs[j]*d/c0)
            T[:,2] .*= cispi(+2*freqs[j]*d/c0)   # T = Gd*Pd*Gv*Gd*S_-1

            if i > 1
                mul!(W,T,S); M .+= W
                mul!(W,T,Gd); copyto!(T,W)
            else
                mul!(W,T,S0); M .+= W
                mul!(W,T,G0); copyto!(T,W)
            end
        end
        
        RB[j] = T[1,2]/T[2,2]
        RB[l+j] = M[1,1]+M[1,2]-(M[2,1]+M[2,2])*T[1,2]/T[2,2]

        copyto!(M,S)
        # T .= 1.0+0.0im; T[1,1] += nd; T[2,2] += nd; T[2,1] -= nd; T[1,2] -= nd; T .*= 0.5
        copyto!(T,Gd)
    end

    return RB
end
