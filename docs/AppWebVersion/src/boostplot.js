import { colors } from "./utils.js";
import { transfer_matrix } from "./transfer_matrix.js";
import discplot from "./DiscPlot/discplot.js";

const ResolutionSlider = document.getElementById("ResolutionSlider");
ResolutionSlider.addEventListener("change", () => updateBoostplot(discplot.discConfig))
const fminInput = document.getElementById("fmin");
const fmaxInput = document.getElementById("fmax");

window.boostPlot = null;
window.reflectivityPlot = null;

function getColors() {
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  return {
    line: dark ? colors.madmax_yellow_light : colors.madmax_yellow,
    gridColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    tickColor: dark ? '#888780' : '#5F5E5A',
    tooltipBg: dark ? '#2C2C2A' : '#ffffff',
    tooltipText: dark ? '#F1EFE8' : '#2C2C2A',
  };
}

const reflToString = (roundMantissa = 0) => (value) => {
    /**
     * format the reflectivity values in readable string
     */
    if (value === 1) return '1';

    const exponent = Math.floor(Math.log10(Math.abs(1 - value)));
    const mantissa = (1 - value) / Math.pow(10, exponent);
    
    return "1" +  ((mantissa > 0) ? " - " : " + ") + `${Math.abs(mantissa).toFixed(roundMantissa)}e${exponent}`;
}

function makeChartConfig(data, yLabel, c) {
    const xS = Math.min(...data.map(d => d.x));
    const xE = Math.max(...data.map(d => d.x));
    return {
        type: 'line',
        defaults: {font:{family: "sans-serif"}},
        data: {
            datasets: [{
                data,
                parsing: { xAxisKey: 'x', yAxisKey: 'y' },
                borderColor: c.line,
                backgroundColor: c.line + '22',
                borderWidth: data.length > 300 ? 1 : 1.5,
                pointRadius: data.length > 200 ? 0 : data.length > 80 ? 1 : 3,
                pointHoverRadius: 4,
                fill: true,
                tension: 0.35,
            }]
        },
        options: {
            locale: 'en-US',
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 180 },
            plugins: {
                tooltip: {
                    backgroundColor: c.tooltipBg,
                    titleColor: c.tooltipText,
                    bodyColor: c.tooltipText,
                    borderColor: c.gridColor,
                    borderWidth: 1,
                    callbacks: {
                        title: items => 'Freq: ' + items[0].parsed.x.toFixed(3) + ' GHz',
                        label: item => 'Boostfactor: ' + item.parsed.y.toFixed(2)
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    min: xS,
                    max: xE,
                    ticks: { color: c.tickColor, font: { size: 11 }, maxTicksLimit: 10 },
                    grid: { color: c.gridColor },
                    title: {
                        display: true,       // Make sure to set display to true
                        text: 'Frequency [GHz]',
                        // color: 'darkgray',
                        font: {
                            size: 12,
                            style: 'italic'
                        }
                    }

                },
                y: {
                    ticks: { 
                        color: c.tickColor, 
                        font: { size: 11 }
                    },
                    grid: { color: c.gridColor },
                    title: {
                        display: true,       // Make sure to set display to true
                        text: yLabel,
                        // color: 'darkgray',
                        font: {
                            size: 12,
                            style: 'italic'
                        }
                    }
                }
            }
        }
    };
}

function initPlots() {
    const c = getColors();
    if (window.boostPlot) window.boostPlot.destroy();
    if (window.reflectivityPlot) window.reflectivityPlot.destroy();

    window.boostPlot = new Chart(document.getElementById('boostplot').getContext('2d'), makeChartConfig([], 'Boostfactor', c));

    window.reflectivityPlot = new Chart(document.getElementById('reflectivityplot').getContext('2d'), makeChartConfig([], 'Reflectivity', c));
    window.reflectivityPlot.options.scales.y.ticks.callback = reflToString();
    window.reflectivityPlot.options.plugins.tooltip.callbacks.label = (item) => reflToString(2)(item.parsed.y);
}


const linspace = (min, max, n) => Array.from({ length: n }, (_, i) => min + (i / (n - 1)) * (max - min));

export default window.updateBoostplot = (discCollection) => {
    const n = parseFloat(ResolutionSlider.value)
    const freq = linspace(parseFloat(fminInput.value), parseFloat(fmaxInput.value), n)

    if (isNaN(freq[0])) throw new Error("fmin or fmax is missing or invalid!!!");
    var kwargs = {}
    const eps = parseFloat(document.getElementById("eps").value)
    if (!isNaN(eps)) kwargs["eps"] = eps;
    const tand = parseFloat(document.getElementById("tand").value) * 1e-6
    if (!isNaN(tand)) {kwargs["tand"] = tand;}


    const { boostfactor, reflectivity} = transfer_matrix(freq.map((e) => e*1e9), discCollection.discs.map(d => d.position), discCollection.discs.map(d => d.width), kwargs);
    const dataBoost = Array.from(boostfactor, (val, i) => ({ x: freq[i], y: val }));
    const dataRefl = Array.from(reflectivity, (val, i) => ({ x: freq[i], y: val }));


    if (window.boostPlot) {
        window.boostPlot.data.datasets[0].data = dataBoost;

        const n = window.boostPlot.data.datasets[0].data.length
        window.boostPlot.data.datasets[0].pointRadius = n > 200 ? 0 : n > 80 ? 1 : 3
        window.boostPlot.data.datasets[0].borderWidth = n > 300 ? 1 : 1.5

        window.boostPlot.options.scales.x.min = freq[0];
        window.boostPlot.options.scales.x.max = freq[freq.length - 1];
        window.boostPlot.update();
    } else {
        initPlots();
    }

    if (window.reflectivityPlot) {
        window.reflectivityPlot.data.datasets[0].data = dataRefl;

        const n = window.reflectivityPlot.data.datasets[0].data.length
        window.reflectivityPlot.data.datasets[0].pointRadius = n > 200 ? 0 : n > 80 ? 1 : 3
        window.reflectivityPlot.data.datasets[0].borderWidth = n > 300 ? 1 : 1.5

        window.reflectivityPlot.options.scales.x.min = freq[0];
        window.reflectivityPlot.options.scales.x.max = freq[freq.length - 1];
        window.reflectivityPlot.update();
    } else {
        initPlots()
    }
}


initPlots();