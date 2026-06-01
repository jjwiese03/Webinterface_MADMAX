/**
 * transfer_matrix.js
 *
 * Exakte Übersetzung der Julia-Funktion aus simulation.jl.
 * Gibt direkt Reflektivität (|R|²) und Boostfaktor (|B|²) zurück.
 *
 * Matrizen sind column-major Float64Arrays der Länge 8:
 *   [re00, im00, re10, im10, re01, im01, re11, im11]
 *
 * @param {number|number[]} freqs       Frequenz(en) in Hz
 * @param {number[]}        position    Positionen der Scheiben (m)
 * @param {number[]}        thickness   Dicken der Scheiben (m)
 * @param {object}          opts
 * @param {number}          opts.eps    Relative Permittivität (default 24.0)
 * @param {number}          opts.tand   Verlustfaktor (default 0.0)
 * @param {number}          opts.nm     Brechungsindex Medium (default 1e15)
 * @returns {{ reflectivity: number[], boostfactor: number[] }}
 *   reflectivity[j] = |R[j]|²  ∈ [0, 1]
 *   boostfactor[j]  = |B[j]|²
 */
export function transfer_matrix(freqs, position, thickness,
    { eps = 24.0, tand = 0.0, nm: nm_ = 1e15 } = {}) {

    const c0 = 299792458.0;

    if (!Array.isArray(freqs)) freqs = [freqs];
    const l = freqs.length;
    const N = position.length;

    // ── komplexe Skalare ──────────────────────────────────────────────────────

    const eps_re = eps, eps_im = -eps * tand;
    const nd     = csqrt(eps_re, eps_im);
    const nd_re  = nd.re, nd_im = nd.im;
    const nm_re  = nm_,   nm_im = 0.0;

    const invEps  = cdiv(1, 0, eps_re, eps_im);
    const A_re    = 1 - invEps.re,  A_im  = -invEps.im;
    const epsm_re = nm_re*nm_re - nm_im*nm_im;
    const epsm_im = 2*nm_re*nm_im;
    const invEpsm = cdiv(1, 0, epsm_re, epsm_im);
    const A0_re   = 1 - invEpsm.re, A0_im = -invEpsm.im;

    // ── konstante Matrizen ────────────────────────────────────────────────────

    const Gd = mat2(
        (1+nd_re)/2,  nd_im/2,
        (1-nd_re)/2, -nd_im/2,
        (1-nd_re)/2, -nd_im/2,
        (1+nd_re)/2,  nd_im/2
    );

    const nd2_re = 2*nd_re, nd2_im = 2*nd_im;
    const gv00 = cdiv(nd_re+1, nd_im, nd2_re, nd2_im);
    const gv10 = cdiv(nd_re-1, nd_im, nd2_re, nd2_im);
    const Gv = mat2(
        gv00.re, gv00.im, gv10.re, gv10.im,
        gv10.re, gv10.im, gv00.re, gv00.im
    );

    const G0 = mat2(
        (1+nm_re)/2,  nm_im/2,
        (1-nm_re)/2, -nm_im/2,
        (1-nm_re)/2, -nm_im/2,
        (1+nm_re)/2,  nm_im/2
    );

    const S  = mat2(A_re/2,  A_im/2,  0, 0,  0, 0,  A_re/2,  A_im/2);
    const S0 = mat2(A0_re/2, A0_im/2, 0, 0,  0, 0,  A0_re/2, A0_im/2);

    // ── Arbeitspuffer ─────────────────────────────────────────────────────────

    const T = new Float64Array(8);
    const M = new Float64Array(8);
    const W = new Float64Array(8);

    // ── Ergebnis-Arrays ───────────────────────────────────────────────────────

    const reflectivity = new Float64Array(l);
    const boostfactor  = new Float64Array(l);

    // ── Hauptschleife ─────────────────────────────────────────────────────────

    for (let j = 0; j < l; j++) {
        const f = freqs[j];

        T.set(Gd); M.set(S);

        for (let i = N - 1; i >= 0; i--) {

            // pd1 = cispi(-2·f·nd·thickness[i] / c0)
            // pd2 = conj(pd1) = cispi(+2·f·nd·thickness[i] / c0)
            const arg_re = -2 * f * nd_re * thickness[i] / c0;
            const arg_im = -2 * f * nd_im * thickness[i] / c0;
            const pd1 = cispi(arg_re, arg_im);
            const pd2_re = pd1.re, pd2_im = -pd1.im;

            // T[:,0] .*= pd1
            cmul_ip(T, 0, pd1.re, pd1.im);
            cmul_ip(T, 2, pd1.re, pd1.im);
            // T[:,1] .*= pd2
            cmul_ip(T, 4, pd2_re, pd2_im);
            cmul_ip(T, 6, pd2_re, pd2_im);

            matmul(W, T, S);  matsub(M, W);
            matmul(W, T, Gv); T.set(W);

            const prev = i === 0 ? 0 : position[i-1] + thickness[0];
            const d    = position[i] - prev;
            const ph   = -2 * f * d / c0;
            const pp1  = cispi(ph, 0);
            const pp2_re = pp1.re, pp2_im = -pp1.im;

            cmul_ip(T, 0, pp1.re, pp1.im);
            cmul_ip(T, 2, pp1.re, pp1.im);
            cmul_ip(T, 4, pp2_re, pp2_im);
            cmul_ip(T, 6, pp2_re, pp2_im);

            if (i > 0) {
                matmul(W, T, S);  matadd(M, W);
                matmul(W, T, Gd); T.set(W);
            } else {
                matmul(W, T, S0); matadd(M, W);
                matmul(W, T, G0); T.set(W);
            }
        }

        // R = T[1,2] / T[2,2]  →  T[4..5] / T[6..7]
        const R = cdiv(T[4], T[5], T[6], T[7]);

        // B = (M[1,1]+M[1,2]) - (M[2,1]+M[2,2])·R
        const sr_re = M[0] + M[4], sr_im = M[1] + M[5];  // Zeile 0 Summe
        const sc_re = M[2] + M[6], sc_im = M[3] + M[7];  // Zeile 1 Summe
        const scR   = cmul_r(sc_re, sc_im, R.re, R.im);
        const B_re  = sr_re - scR.re;
        const B_im  = sr_im - scR.im;

        reflectivity[j] = R.re*R.re + R.im*R.im;      // |R|²
        boostfactor[j]  = B_re*B_re + B_im*B_im;      // |B|²
    }

    return { reflectivity, boostfactor };
}

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function mat2(r00,i00, r10,i10, r01,i01, r11,i11) {
    return new Float64Array([r00,i00, r10,i10, r01,i01, r11,i11]);
}

function cispi(x, y) {
    const amp = Math.exp(-Math.PI * y);
    const phi = Math.PI * x;
    return { re: amp * Math.cos(phi), im: amp * Math.sin(phi) };
}

function csqrt(re, im) {
    const r  = Math.sqrt(re*re + im*im);
    const sr = Math.sqrt((r + re) / 2);
    const si = (im >= 0 ? 1 : -1) * Math.sqrt((r - re) / 2);
    return { re: sr, im: si };
}

function cdiv(a, b, c, d) {
    const denom = c*c + d*d;
    return { re: (a*c + b*d) / denom, im: (b*c - a*d) / denom };
}

function cmul_r(a, b, c, d) {
    return { re: a*c - b*d, im: a*d + b*c };
}

function cmul_ip(M, o, cr, ci) {
    const re = M[o], im = M[o+1];
    M[o]   = re*cr - im*ci;
    M[o+1] = re*ci + im*cr;
}

function matmul(W, A, B) {
    W[0] = A[0]*B[0]-A[1]*B[1] + A[4]*B[2]-A[5]*B[3];
    W[1] = A[0]*B[1]+A[1]*B[0] + A[4]*B[3]+A[5]*B[2];
    W[2] = A[2]*B[0]-A[3]*B[1] + A[6]*B[2]-A[7]*B[3];
    W[3] = A[2]*B[1]+A[3]*B[0] + A[6]*B[3]+A[7]*B[2];
    W[4] = A[0]*B[4]-A[1]*B[5] + A[4]*B[6]-A[5]*B[7];
    W[5] = A[0]*B[5]+A[1]*B[4] + A[4]*B[7]+A[5]*B[6];
    W[6] = A[2]*B[4]-A[3]*B[5] + A[6]*B[6]-A[7]*B[7];
    W[7] = A[2]*B[5]+A[3]*B[4] + A[6]*B[7]+A[7]*B[6];
}

function matadd(A, B) { for (let k = 0; k < 8; k++) A[k] += B[k]; }
function matsub(A, B) { for (let k = 0; k < 8; k++) A[k] -= B[k]; }
