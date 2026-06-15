import { colors } from "./utils.js";

export let boostplot = null;

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

export function buildBoostplot(data) {
    if (boostplot) boostplot.destroy();

    const ctx = document.getElementById('boostplot').getContext('2d');
    const xS = Math.min(...data.map(d => d.x));
    const xE = Math.max(...data.map(d => d.x));
    const c = getColors();


    boostplot = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Wert',
                data: data,
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
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 180 },
            plugins: {
                legend: { display: false },
                tooltip: {
                backgroundColor: c.tooltipBg,
                titleColor: c.tooltipText,
                bodyColor: c.tooltipText,
                borderColor: c.gridColor,
                borderWidth: 1,
                callbacks: {
                    title: items => 'X: ' + items[0].parsed.x,
                    label: item => 'Y: ' + item.parsed.y.toFixed(2)
                }
                }
            },
            scales: {
                x: {
                type: 'linear',
                min: xS,
                max: xE,
                ticks: {
                    color: c.tickColor,
                    font: { size: 11 },
                    maxTicksLimit: 10,
                },
                grid: { color: c.gridColor }
                },
                y: {
                ticks: { color: c.tickColor, font: { size: 11 } },
                grid: { color: c.gridColor }
                }
            }
        }
    });
}

export function updateBoostplot() {
    // calculate the boostfactor for the current disc settings and update the boostplot
    const freq = Array.from({ length: 100 }, (_, i) => (1 + i) * 1e9);
    const { reflectivity, boostfactor } = transfer_matrix(freq, discplot.discs.map(d => d.x), discplot.discs.map(d => d.width));
    
    const data = Array.from(boostfactor, (val, i) => ({ x: freq[i], y: val }));
    buildBoostplot(data);
}


buildBoostplot([{x: 0, y: 0}, {x: 2, y: 4}, {x: 4, y: 1}])
