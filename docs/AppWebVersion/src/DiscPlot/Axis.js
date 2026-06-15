function arange(start, stop, step){
    let arr = []
    while(start<=stop){
        arr.push(start)
        start+=step
    }
    return arr
}

export class Axis{
    constructor(xmax=10, unit="cm"){
        this.xmax = xmax;
        this.unit = unit;
        this.ticks = [];

        this.wanted_num_ticks = 5;
    }
    get stepvalue(){
        // finds the right stepsize for an Intervall [start, stop] an the approximately wanted number of ticks num so that the steps are beautifully spaced
        const idealStep = this.xmax/this.wanted_num_ticks;
        const decimals = Math.floor(Math.log10(idealStep));

        const bestFit = [1,2,5].sort((a, b) => Math.abs(idealStep*10**-decimals-a)-Math.abs(idealStep*10**-decimals-b));

        return bestFit[0]*10**decimals;
    }
    setXmax(xmax){
        this.xmax = xmax;
    }
    setUnit(unit){
        this.unit = unit;
    }
    updateTicks(){
        this.ticks = arange(0, this.xmax, this.stepvalue);
    }
}

