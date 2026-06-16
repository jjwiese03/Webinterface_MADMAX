export class Disc {
    /**
     * represents a disc in the disc plot.
     *
     * @param {DiscCollection} collection - The Collection to which the disc belongs
     * @param {number} position - The x-coordinate of the disc.
     * @param {number} width - The width of the disc.
     * @param {number} epsilon - The dielectrical constant of the disc material
     * @param {number} selected - Wether the disc is selected
     */
    constructor(collection, position, width, epsilon, selected){
        this.id = Math.random().toString(36).substr(2, 9);   // generiert eine zufällige ID für die Scheibe
        this.collection = collection;
        this.position = position;
        this.width = width;
        this.epsilon = epsilon;   // speichert die Dielektrizitätskonstante der Scheibe
        this.selected = selected;   // speichert, ob die Scheibe aktuell ausgewählt ist
    }
    get index(){
        return this.collection.indexOf(this)
    }
    before(n = 1){
        const newIndex = this.index - n;
        return newIndex >= 0 ? this.collection.discs[newIndex] : null;
    }
    after(n = 1){
        const newIndex = this.index + n;
        return newIndex < this.collection.discs.length ? this.collection.discs[newIndex] : null;
    }
    delete(){
        this.collection.deleteDisc(this);
    }
    selectDisc(deselect = true){
        this.collection.selectDisc(this, deselect);
    }
    movePosition(value, dx = false) {
        /**
         * moves the disc to an new Position. 
         * 
         * @param {number} value - value that defines the new position
         * @param {number} dx - decides if the value is an absolute or relative position 
         */

        if (dx) {
            this.position += value;
        }
        else {
            this.position = value;
        }

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
    get selectedDiscs(){
        /**
         * returns the discs, that are currently selected
         */
        return this.discs.filter(disc => disc.selected);
    }
    get selectedDiscIndices(){
        return this.discs.map(disc => disc.selected ? this.indexOf(disc) : null).filter(index => index !== null);
    }
    get lastDisc(){
        /**
         * time complexity: O(1)
         */
        return this.discs.length > 0 ? this.discs[this.discs.length - 1] : null;
    }
    get firstDisc(){
        /**
         * time complexity: O(1)
         */
        return this.discs.length > 0 ? this.discs[0] : null;
    }
    indexOf(disc){
        /**
         * implentes binary search to find the index of given disc ( time complexity: O(log(n)) )
         */
        var start = 0;
        var end = this.discs.length - 1;
        var mid;
        while (end != start) {
            mid = start + Math.floor((end - start) / 2);

            if (this.discs[mid] == disc) {
                return mid;
            }
            else if (this.discs[mid].position >= disc.position) {
                end = mid - 1;
            }
            else {
                start = mid + 1;
            }
        }
        return start;
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
    deleteselectDiscs(){
        this.discs = this.discs.filter(disc => !disc.selected);
    }
    addDisc(disc){
        if (disc == null) return;

        disc = (Array.isArray(disc) && disc.length >= 4) ? new Disc(this, disc[0], disc[1], disc[2], disc[3]) : disc;
        
        
        if (disc instanceof Disc) {
            if (this.discs.includes(disc)){
                throw new Error("Disc is already in the collection: " + disc);
            }
            else {
                this.discs.push(disc);
            }
        }
        else {
            throw new Error("Only Disc or a List are valid attributes. You tried to add: " + disc);
        }
        
        return disc;
    }
    selectDisc(disc, deselect = true){
        /**
         * Selects one or more discs.
         *
         * The `disc` parameter may be:
         * - a {@link Disc} instance,
         * - the index of a disc,
         * - or an array containing Disc instances and/or indices.
         *
         * By default, all currently selected discs are deselected before
         * the new selection is applied.
         *
         * @param {Disc|number|Array{Disc|number}} disc
         *        The disc(s) to select, specified either as Disc objects
         *        or indices.
         * @param {boolean} [deselect=true]
         *        If `true`, all other discs are deselected before selecting
         *        the specified disc(s).
         * @returns {void}
         */

        if (deselect){
            this.discs.forEach(d => d.selected = false);
        }

        if (disc instanceof Array){
            disc.forEach(d => this.selectDisc(d, false));
            return;
        }
        else {
            disc = disc instanceof Disc ? disc : this.discs[disc]; 
            disc.selected = true;
        }
    }
    clearSelection(){
        this.discs.forEach(d => d.selected = false);
    }
    clear(){
        this.discs = [];
    }
    correctOverlap(){
        
    }
}