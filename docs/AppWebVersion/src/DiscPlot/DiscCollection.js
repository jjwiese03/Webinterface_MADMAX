export class Disc {
    /**
     * represents a disc in the disc plot.
     *
     * @param {number} x - The x-coordinate of the disc.
     * @param {number} width - The width of the disc.
     * @param {DiscConfig} parent - The configuration object to which the disc belongs.
     */
    constructor(parent, position, width, epsilon, selected){
        this.id = Math.random().toString(36).substr(2, 9);   // generiert eine zufällige ID für die Scheibe
        this.parent = parent;
        this.position = position;
        this.width = width;
        this.epsilon = epsilon;   // speichert die Dielektrizitätskonstante der Scheibe
        this.selected = selected;   // speichert, ob die Scheibe aktuell ausgewählt ist
    }
    before(n = 1){
        const newIndex = this.index - n;
        return newIndex >= 0 ? this.parent.discs[newIndex] : null;
    }
    after(n = 1){
        const newIndex = this.index + n;
        return newIndex < this.parent.discs.length ? this.parent.discs[newIndex] : null;
    }
    delete(){
        this.parent.deleteDisc(this);
    }
}

export class DiscCollection {
    /**     
     * represents a collection of discs. Implements useful helper functions to manage multiple discs as well as error correction (f.e. overlapping discs).       
     */
    constructor(){
        this.discs = [];   // speichert die Scheiben als Array von Disc-Objekten
    }
    get length(){
        return this.discs.length;
    }
    get focusDiscs(){
        return this.discs.filter(disc => disc.selected);
    }
    get focusDiscIndices(){
        return this.discs.map(disc => disc.selected ? this.indexOf(disc) : null).filter(index => index !== null);
    }
    get lastDisc(){
        return this.discs.length > 0 ? this.discs[this.discs.length - 1] : null;
    }
    get firstDisc(){
        return this.discs.length > 0 ? this.discs[0] : null;
    }
    indexOf(disc){
        return this.discs.indexOf(disc);
    }
    deleteDisc(disc){
        if (disc instanceof Array){
            disc.forEach(d => this.deleteDisc(d));
        }
        else {
            const index = disc instanceof Disc ? this.indexOf(disc) : disc; // erlaubt die Übergabe eines Index statt eines Disc-Objekts

            if (index >= 0 && index < this.discs.length) {
                this.discs.splice(index, 1);
            }
            else {            throw new Error("Disc not found in configuration: " + disc);        }
        }
    }
    deleteFocusDiscs(){
        this.discs = this.discs.filter(disc => !disc.selected);
    }
    addDisc(disc){
        if (!(disc instanceof Disc)){
            throw new Error("Only Disc objects can be added to the collection. Tried to add: " + disc);
        }
        else if (this.discs.includes(disc)){
            throw new Error("Disc is already in the collection: " + disc);
        }
        
        this.discs.push(disc);

        return disc;
    }
    focusDisc(disc, exclusive = true){
        if (exclusive){
            this.discs.forEach(d => d.selected = false);
        }

        if (disc instanceof Array){
            disc.forEach(d => this.focusDisc(d, false));
            return;
        }
        else {
            disc = disc instanceof Disc ? disc : this.discs[disc];  // erlaubt die Übergabe eines Index statt eines Disc-Objekts

            if (!this.discs.includes(disc)){
                throw new Error("Disc not found in configuration: " + disc);
            }

            disc.selected = true;
        }
    }
    clearFocus(){
        this.discs.forEach(d => d.selected = false);
    }
    clear(){
        this.discs = [];
    }
    correctOverlap(){
        
    }
}