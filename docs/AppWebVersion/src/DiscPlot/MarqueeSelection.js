export default class MarqueeSelection{
    constructor(start = [0, 0], end = [0, 0]){
        this.start = start;
        this.end = end;
        this.active = false;   // gibt an, ob die Marquee Selection aktiv ist (wird auf false gesetzt, wenn die Maustaste losgelassen wird)
    }
}
