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

        this.index = (index == null) ? this.collection.indexOf(this) : index;
    }
    get before(){
        /**
         * time complexity: O(1)
         */
        return (this.index + 1 < this.collection.length) ? this.collection.discs[index + 1] : null;
    }
    get before(){
        /**
         * time complexity: O(1)
         */
        return (this.index - 1 >= 0) ? this.collection.discs[index - 1] : null;
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
     * @param {string|Array{string}} events - The event name to listen for (e.g. 'change:position', 'change:selection', 'disc:added', 'disc:removed')
     * @param {Function} callback - The function to call when the event fires.
     *                              Receives the data passed to emit() as its argument.
     * @example
     * DiscCollection.on('change:position', (disc) => console.log('position changed:', disc));
     */
    on(events, callback) {
        if (Array.isArray(events)) {
            events.forEach(event => this.on(event, callback));
            return;
        }
        
        if (!this.#listeners[event]) this.#listeners[event] = [];
            this.#listeners[event].push(callback);
        }

    /**
     * Removes a previously registered listener for the given event.
     * The callback reference must be identical to the one passed to on().
     *
     * @param {string|Array{string}} events - The event name to remove the listener from.
     * @param {Function} callback - The exact function reference that was registered.
     * @example
     * const handler = (disc) => console.log(disc);
     * DiscCollection.on('change:position', handler);
     * DiscCollection.off('change:position', handler);
     */
    off(events, callback) {
        if (Array.isArray(events)) {
            events.forEach(event => this.off(event, callback));
            return;
        }
        this.#listeners[event] = this.#listeners[event]?.filter(cb => cb !== callback);
    }

    /**
     * Emits an event, invoking all registered listeners with the provided data.
     * Does nothing if no listeners are registered for the event.
     *
     * @param {string|Array{string}} events - The event name to emit.
     * @param {*} data - The data to pass to each listener callback.
     * @example
     * this.emit('change:position', { disc: hitDisc });
     */
    emit(events, data) {
        if (Array.isArray(events)) {
            events.forEach(event => this.emit(event, callback));
            return;
        }

        this.#listeners[event]?.forEach(cb => cb(data));
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
         * implentes binary search to find the index of given disc (
         * 
         * time complexity: O(log(n))  (n = number of discs in DiscCollection)
         */
        if (this.length == 0) {return 0;}

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
        return (this.discs[start] == disc) ? start : null;
    }
    deleteDisc(disc){
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

                // update the indicies
                this.updateIndicies(index - 1, index);
            }
            else {            throw new Error("Disc not found in configuration: " + disc);        }
        }
    }
    deleteSelectedDiscs(){
        this.discs = this.discs.filter(disc => !disc.selected);
        this.emit("disc:removed", {});
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
                this.emit("disc:added", disc)
            }
        }
        else {
            throw new Error("Only Disc or a List are valid attributes. You tried to add: " + disc);
        }
        
        return disc;
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
            this.emit("change:selection", this.selectedDiscs())
            return;
        }
        else {
            disc = disc instanceof Disc ? disc : this.discs[disc]; 
            disc.selected = true;
        }

        if(triggerEvent) {this.emit("change:selection", this.selectedDiscs)}
        return;
    }
    clearSelection(){
        this.discs.forEach(d => d.selected = false);
        this.emit("change:selection", [])
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
            if (dx && value >= 0) {
                this.position += value;
            }
            else {
                this.position = value;
            }

            // move overlapping discs
            disc = disc.after;
            while(disc != null) {
                if (disc.before.position){

                }

            }

        })

        this.emit("position_change")
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

        for (const i = start; i <= stop; i++) {
            this.discs[i].index = i;
        }
    }
}
