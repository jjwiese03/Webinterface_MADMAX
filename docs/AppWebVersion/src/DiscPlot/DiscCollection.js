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
    constructor(collection, position, width, epsilon, selected, index = null){
        this.id = Math.random().toString(36).substr(2, 9);   // generiert eine zufällige ID für die Scheibe
        this.collection = collection;
        this.position = position;
        this.width = width;
        this.epsilon = epsilon;   // speichert die Dielektrizitätskonstante der Scheibe

        this.selected = selected;   // Property: Determines wether a disc is currently selected via the interface
        // this.immovable = false      // Property: Determines whether this disc can be pushed by other discs

        this.index = index;
    }
    get after(){
        /**
         * time complexity: O(1)
         */
        return (this.index + 1 < this.collection.length) ? this.collection.discs[this.index + 1] : null;
    }
    get before(){
        /**
         * time complexity: O(1)
         */
        return (this.index - 1 >= 0) ? this.collection.discs[this.index - 1] : null;
    }
    get rightEdge() {
        /**
         * returns the position of the right edge of the disc
         */
        return this.position + this.width
    }
    getBefore(n = 1){
        /**
         * time complexity: O(1)
         */
        return (this.index - n >= 0) ? this.collection.discs[this.index - n] : null;
    }
    getAfter(n = 1){
        /**
         * time complexity: O(log(i)) (i = number of discs in DiscCollection)
         */
        const newIndex = this.index + n;
        return (this.index + n < this.collection.discs.length) ? this.collection.discs[this.index + n] : null;
    }
    delete(){
        this.collection.deleteDisc(this);
    }
    selectDisc(deselect = true){
        this.collection.selectDisc(this, deselect);
    }
    move(value, dx = false) {
        /**
         * moves the disc to an new Position. 
         * 
         * @param {number} value - value that defines the new position
         * @param {number} dx - decides if the value is an absolute or relative position 
         */

        this.collection.moveDiscs(this, value, dx)
    }
    changeProperty(properties){
        this.collection.changeDiscProperty(this, properties)
    }
}





export class DiscCollection {
    /**     
     * represents a collection of discs. Implements useful helper functions to manage multiple discs as well as error correction (f.e. overlapping discs).       
     */
    constructor(){
        this.discs = [];   // speichert die Scheiben als Array von Disc-Objekten
    }
    #listeners = {};

    /**
     * Registers a listener for the given event.
     * The callback will be invoked every time the event is emitted.
     *
     * @param {string|Array{string}} event - The event name to listen for (e.g. 'disc:position', 'disc:selected', 'disc:added', 'disc:removed')
     * @param {Function} callback - The function to call when the event fires.
     *                              Receives the data passed to emit() as its argument.
     * @example
     * DiscCollection.on('disc:position', (disc) => console.log('position changed:', disc));
     */
    on(event, callback) {
        if (Array.isArray(event)) {
            event.forEach(e => this.on(e, callback));
            return;
        }
        else {
            if (!this.#listeners[event]) this.#listeners[event] = [];
            this.#listeners[event].push(callback.bind(this));
            return;
        }
    }

    /**
     * Removes a previously registered listener for the given event.
     * The callback reference must be identical to the one passed to on().
     *
     * @param {string|Array{string}} event - The event name to remove the listener from.
     * @param {Function} callback - The exact function reference that was registered.
     * @example
     * const handler = (disc) => console.log(disc);
     * DiscCollection.on('disc:position', handler);
     * DiscCollection.off('disc:position', handler);
     */
    off(event, callback) {
        if (Array.isArray(event)) {
            event.forEach(e => this.off(e, callback));
            return;
        }
        else {
            this.#listeners[event] = this.#listeners[event]?.filter(cb => cb !== callback);
        }
    }

    /**
     * Emits an event, invoking all registered listeners with the provided data.
     * Does nothing if no listeners are registered for the event.
     *
     * @param {string|Array{string}} event - The event name to emit.
     * @param {*} data - The data to pass to each listener callback.
     * @example
     * this.emit('disc:position', { disc: hitDisc });
     */
    emit(event, data) {
        if (Array.isArray(event)) {
            event.forEach(e => this.emit(e, data));
            return;
        }
        else {
            this.#listeners[event]?.forEach(cb => cb(data));
        }
    }

    get length(){
        return this.discs.length;
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
    get firstSelectedDisc(){
        for (let disc of this.discs) {
            if (disc.selected) return disc;
        }
    }
    get lastSelectedDisc(){
        let canidate = this.discs.firstDisc
        for (let disc of this.discs) {
            if (disc.selected) canidate = disc;
        }
        return disc;
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
    get positions(){
        return this.discs.map(d => d.position);
    }
    get widths(){
        return this.discs.map(d => d.width)
    }
    binSearch(position){
    /**
         * implentes binary search to find the index of the disc that is on the right side of the given position. If position is greater than the position of the last disc, it returns the last disc index. Used in this.IndexOf and this.positionNeighbour.
         * 
         * @example 
         * [DiscCollection consists of Discs with positions: 2, 3, 4, 5, 6]]
         * 
         * => binSearch(4.5) = 3
         * => binSearch(4) = 2
         * => binSearch(2.5) = 1
         * => binSearch(100) = 4
         * 
         * IMPORTANT !!!:
         * => binSearch(x < lastDisc.position) = lastDisc.index
         * 
         * 
         * time complexity: O(log(n))  (n = number of discs in DiscCollection)
         */

        var start = 0;
        var end = Math.max(0, this.discs.length - 1);
        var mid;

        var security = 0;
        while (end - start >= 1) {
            security++;
            if(security > 100) {throw new Error("possible infinity loop detected")}
            mid = start + Math.floor((end - start) / 2);

            if (this.discs[mid].position == position) {
                return mid;
            }
            else if (this.discs[mid].position > position) {
                end = mid;
            } 
            else {
                start = mid + 1;
            }

        }
        return start;
    }
    indexOf(disc){
        /**
         * returns the index of an given disc. If disc isnt part of DiscConfig it returns null.
         * 
         * time complexity: O(log(n))
         */
        const binSearchResult = this.binSearch(disc.position);
        return (this.discs[binSearchResult] === disc) ? binSearchResult : null;
    }
    positionNeighbour(position, neighbour="right"){
        /**
         * returns the neighbouring disc for some position. If a disc is at exactly that position it returns its index when neighbour = "left" and otherwise its right neighbour. If there is no disc on the neighbour side it returns null.
         * 
         * time complexity: O(log(n))  (n = number of discs in DiscCollection)
         */

        if (!["right", "left"].includes(neighbour)) throw new Error("Invalid argument for neighbour: " + neighbour)

        if (this.length == 0 || (position > this.lastDisc.position && neighbour=="right")) return null;

        const binSearch = this.discs[this.binSearch(position)]

        if (binSearch == this.lastDisc && position > binSearch.position) {
            return (neighbour == "right") ? null : binSearch;
        }
        return (neighbour == "right") ? binSearch : binSearch.before;
    }
    onDisc(position) {
        const canidate = this.positionNeighbour(position, "left");

        return (canidate.position <= position && canidate.rightEdge >= position) ? canidate : null;
    }
    deleteDisc(disc, triggerEvent = true){
        /**
         * 
         *  deletes single or multiple discs
         * 
         *  @param {number|Disc|Array{number}|Array{Disc}} disc - specifies which discs should be deleted
         *  
         *  time complexities:
         * 
         *  n = number of discs in DiscCollection 
         * 
         *  disc = Array{Disc} => O(n*m)   (m = length of disc)
         *  disc = Disc => O(n)
         *  disc = Array{number} => O(m)
         *  disc = number => O(1)
         */

        if (disc instanceof Array){
            disc.forEach(d => this.deleteDisc(d));
        }
        else {
            const index = disc instanceof Disc ? this.indexOf(disc) : disc; // erlaubt die Übergabe eines Index statt eines Disc-Objekts

            if (index >= 0 && index < this.discs.length) {
                this.discs.splice(index, 1);
                this.updateIndicies(index - 1, index);
                if (triggerEvent) this.emit("disc:removed");
            }
            else {            throw new Error("Disc not found in configuration: " + disc);        }
        }
    }
    deleteDiscs(n=1){
        for (let i = 0; i<n; i++) {
            this.deleteDisc(this.discs.length - 1)
        }
        this.emit("disc:removed", {});
    }
    deleteSelectedDiscs(){
        this.discs = this.discs.filter(disc => !disc.selected);
        this.emit("disc:removed", {});
    }
    loopSelection(callback, kwargs = {}) {
        /**
         * loops through the selected discs and calls the callback function
         */
        this.discs.forEach((disc, i) => {if(disc.selected){callback(disc, i, kwargs)}})
    }
    addDisc(disc = null, deselectOthers = true) {
        // turn the input into a Disc class

        if (deselectOthers) this.clearSelection(false);
        if (disc == null) disc = {};

        if (typeof disc === 'object' && !(disc instanceof Disc)) {
            const defaultDisc = { position: null, width: 0.2, epsilon: 24, selected: false };
            Object.entries(defaultDisc).forEach(([key, value]) => {
                if (disc[key] == null) disc[key] = value;
            });

            if (disc.position == null) {
                disc.position = (this.lastDisc == null) ? 0 : this.lastDisc.position + this.lastDisc.width;
            }

            disc = new Disc(this, disc.position, disc.width, disc.epsilon, disc.selected);
        }

        // determine its index
        const index = this.positionNeighbour(disc.position, "right");
        disc.index = (index == null) ? this.length : index;

        if (disc instanceof Disc) {
            if (this.discs.includes(disc)) {
                throw new Error("Disc is already in the collection: " + disc);
            }
            this.discs.splice(disc.index, 0, disc);
            this.updateIndicies(disc.index);
            this.emit("disc:added", disc);
            if(disc.selected == true || deselectOthers == true) this.emit("disc:selected", this.selectedDiscs);
        } else {
            throw new Error("Only Disc or a plain object are valid inputs. Got: " + String(disc));
        }
        return disc;

    }
    addDiscs(n=1){
        for (let i = 1; i < n; i++){
            this.addDisc(null, false);
        }
        this.addDisc(null, true);
    }
    selectDisc(disc, deselect = true, triggerEvent = true){
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
            disc.forEach(d => this.selectDisc(d, false, false));
            this.emit("disc:selected", this.selectedDiscs)
            return;
        }
        else {
            disc = disc instanceof Disc ? disc : this.discs[disc]; 
            disc.selected = true;
        }

        if(triggerEvent) {this.emit("disc:selected", this.selectedDiscs)}
        return;
    }
    clearSelection(dispatchEvent = true){
        this.discs.forEach(d => d.selected = false);
        if(dispatchEvent) this.emit("disc:selected", []);
        return;
    }
    clear(){
        this.discs = [];
        this.emit("disc:removed", {})
    }
    moveDiscs(discs, value, dx = false, maxPosition = null, errorCorrection = true){
        /**
         * changes the position of a single or multiple discs
         * 
         * @param {Array{Disc}|Disc} discs - Array of discs or single Disc instance that are going to be moved
         * @param {Array{number}|number} value - Array of values that define the new Position
         * @param {boolean} dx - boolean, that decides if the value is an absolute or relative position
         * @param {number} maxPosition - maximum Position the discs are not able to exceed (border). If null then all Positions are allowed. IMPORTANT: this argument is only observed if errorCorrection is enabled.
         * @param {boolean} errorCorrection - boolean, that decides wether overlap between discs and the exceeding maxPosition should be corrected
          */
        if (discs instanceof Disc) {discs = [discs]}

        discs.forEach((disc, index) => {
            // change position
            if (dx) {
                disc.position += value;
            }
            else {
                disc.position = value;
            }
            
            if(errorCorrection){
                // disc cascade to the left
                while(disc.after != null && disc.rightEdge > disc.after.position) {
                    disc.after.position = disc.rightEdge;
                    disc = disc.after;
                }

                // disc cascade to the right
                while(disc.before != null && disc.before.rightEdge > disc.position) {
                    disc.before.position = disc.position - disc.before.width;
                    disc = disc.before;
                }
            }
            
        })

        // correct the borders
        if (errorCorrection){
            // correct maxPosition
            if (maxPosition != null && this.lastDisc.rightEdge >= this.maxPosition ){
                this.moveDiscs(this.lastDisc, this.maxPosition - this.lastDisc.width)
            }

            // correct negative positions
            if (this.firstDisc.position < 0) {
                this.moveDiscs(this.firstDisc, 0)
            }
        }
        
        this.emit("disc:position")
    }
    changeDiscProperty(discs, properties, triggerEvent = true){
        if(Array.isArray(discs)) {discs.forEach((disc) => this.changeDiscs(disc, properties))}
        else{
            for (const [key, value] of Object.entries(properties)) {
                if(discs[key]) continue;
                
                discs[key] = value;
                if(triggerEvent) this.emit("disc:property");
            }
        }
        return;
    }
    updateIndicies(start = 0, stop = null){
        /**
         * sets the indicies for Disc Elements in the Collection
         * 
         * @param {number} start - index from where on the change of the indicies starts. If it is smaller than zero, the iteration starts from 0.
         * @param {number} stop - index where the iteration stops. If null the iteration stops at the end.
         */

        stop = (stop == null) ? this.discs.length - 1 : Math.min(stop, this.discs.length - 1);
        start = Math.max(0, start);

        for (let i = start; i <= stop; i++) {
            this.discs[i].index = i;
        }
    }
}
