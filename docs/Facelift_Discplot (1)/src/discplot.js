import { find_stepvalue, arange, Round, colors } from "./utils.js";

// Section Material:
const mirror_checkbox = document.getElementById("mirror_checkbox");
const epsilon_input = document.getElementById("dielectric-input");
const tan_delta_input = document.getElementById("tan-delta-input");


// Section Positioning:
const discNumberString = document.getElementById("discNumberString");
const counter_field = document.getElementById("disc-number-input");
const position_input = document.getElementById("position-input");
const rel_poisition_input = document.getElementById("rel_position-input");
const width_input = document.getElementById("width-input");


const canvas = document.getElementById("discplot");
const graph_pos_chkbx = document.getElementById("graph_pos_chkbx");
const graph_dist_chkbx = document.getElementById("graph_dist_chkbx");


graph_pos_chkbx.checked = true
var dis_pos_switch = true       // true == pos      false == dis
var mouse_status_sim = false
var mouse_x;
var mouse_y;

// definiere intervalle
let SingleClickIntervall = null;   // speichert das Intervall, in dem ein zweiter Klick als Doppelklick interpretiert wird
let MarqueeSelectionIntervall = null;   // speichert das Intervall, in dem die Multiselection aktualisiert wird
let BoostplotIntervall = null;   // speichert das Intervall, in dem die Boostplot aktualisiert wird



const fine_adjustment_size = 15 // speichert die größe des Feinjustierungskastens in px



class Plot{
    constructor(canvas){
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        this.padd = [80,70,70,70]
        this.context.font = "15px Poppins";
        this.rect_height = this.canvas.height-this.padd[0]-this.padd[2];
        
        this.discs = [];
        this.focus_disc = [];     // speichert welche disc zuletzt im focus war
        this.fdisc_indexlist = [];

        this.multiselect_arr = [];      // Arr to capture the location and dimensions of the multiselect rect

        this.memory = []        // speichert die Disc- und Frequenzeinstellungen der letzten 10 Schritte
        this.memory_pos = 0     // speichert welcher Zustand aus memory gerade gezeigt wird (antiproportional, also 0 = letzter Eintrag aus memory und memory.length = erster Eintrag)

        this.xmax = 10;
        this.Emax = 5;
        this.ticks = [];
        this.unit = "cm";
        this.draw()
    }
    draw(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        // Diese Funktion zeichnet ein Axensystem samt Inhalt
    
        this.context.beginPath();               

        this.context.strokeStyle = colors.color_dark_gray;
        this.context.fillStyle = colors.color_dark_gray;
        this.context.lineWidth = 0.5;


        //Achsenlinien
        this.context.moveTo(this.padd[3], this.canvas.height-this.padd[2]); 
        this.context.lineTo(this.canvas.width-this.padd[1], this.canvas.height-this.padd[2]);

        // draw axticks
        this.ticks.forEach(tick => {
            this.context.moveTo(this.padd[3]+this.cm_to_pixel(tick), this.canvas.height-this.padd[2]);
            this.context.lineTo(this.padd[3]+this.cm_to_pixel(tick), this.canvas.height-this.padd[2]+8);
            this.context.textAlign = "center"
            this.context.fillText(tick, this.padd[3]+this.cm_to_pixel(tick), this.canvas.height-this.padd[2]+25)
        });

        //Label
        this.context.textAlign = "center"
        this.context.fillText("Position [" + this.unit + "]", this.padd[3]+(this.canvas.width-this.padd[1]-this.padd[3])/2, this.canvas.height-this.padd[2]/2+this.context.measureText("Position").emHeightAscent/2+10);

        this.context.stroke();

        // draw discs
        var prev_disc = {"x":0, "width":0};
        var arrow_start;    // hilft bei zeichnen der Abstandspfeile zwischen den Scheiben (Start eines Pfeils)
        var arrow_end;    // hilft bei zeichnen der Abstandspfeile zwischen den Scheiben (Ende eines Pfeils)
        var arrow_y = this.canvas.height/2;  // Höhe auf der der Pfeil gezeichnet wird
        
        for (const rect of this.discs) {
            this.context.beginPath();   
            this.context.rect(this.padd[3]+this.cm_to_pixel(rect.x), this.padd[0], this.cm_to_pixel(rect.width), this.rect_height);
            if (this.focus_disc.some(element => element==rect)){
                this.context.fillStyle = "rgba(133, 144, 170, 0.54)";
            }
            else {
                this.context.fillStyle = "rgba(133, 144, 170, 0.19)";
            }

            this.context.fill();
            this.context.stroke();
            
            this.context.beginPath();   
            this.context.rect(this.padd[3]+this.cm_to_pixel(rect.x), this.padd[0], this.cm_to_pixel(rect.width), fine_adjustment_size);
            this.context.fillStyle = "rgb(52, 71, 122)";
            this.context.fill();


            this.context.fillStyle = colors.color_dark_gray;
            if(graph_dist_chkbx.checked && parseFloat(-(prev_disc.x+prev_disc.width-rect.x).toFixed(3))!=0){
                // zeichne Abstandspfeil zwischen der aktuellen und vorherigen Scheibe
                arrow_start = this.cm_to_pixel(prev_disc.x+prev_disc.width)+this.padd[3];
                arrow_end = this.cm_to_pixel(rect.x)+this.padd[3];

                this.context.moveTo(arrow_start+5, arrow_y+5);
                this.context.lineTo(arrow_start, arrow_y);
                this.context.lineTo(arrow_start+5, arrow_y-5);
                this.context.moveTo(arrow_start, arrow_y);
                this.context.lineTo(arrow_end, arrow_y);
                this.context.moveTo(arrow_end-5, arrow_y+5);
                this.context.lineTo(arrow_end, arrow_y);
                this.context.lineTo(arrow_end-5, arrow_y-5);

                // zeiche Abstandszahl über Pfeil
                if(arrow_end-arrow_start<this.context.measureText(String(parseFloat(-(prev_disc.x+prev_disc.width-rect.x).toFixed(3)))+this.unit).width){
                    this.context.save();
                    this.context.translate(arrow_start+(arrow_end-arrow_start)/2,arrow_y-10);
                    this.context.rotate(-Math.PI/2);
                    this.context.textBaseline = "middle";
                    this.context.textAlign = "left"
                    this.context.fillText(String(parseFloat(-(prev_disc.x+prev_disc.width-rect.x).toFixed(3)))+this.unit, 0, 0)
                    this.context.restore();
                }
                else{
                    this.context.fillText(String(parseFloat(-(prev_disc.x+prev_disc.width-rect.x).toFixed(3)))+this.unit, arrow_start+(arrow_end-arrow_start)/2,arrow_y-10)
                }
            }
            if (graph_pos_chkbx.checked){
                this.context.save();
                this.context.translate(this.cm_to_pixel(rect.x+rect.width/2)+this.padd[3], this.padd[0]-this.context.measureText(String(parseFloat(rect.x.toFixed(3)))+this.unit).width/2-10);
                this.context.rotate(-Math.PI/2);
                this.context.textBaseline = "middle";
                this.context.fillText(String(parseFloat(rect.x.toFixed(3)))+this.unit, 0, 0);
                this.context.restore();
            }
            prev_disc = rect
            this.context.stroke();
        }
        // draw Multiselect
        if (this.multiselect_arr.length !== 0){
            this.context.beginPath();   
            this.context.strokeStyle = "rgba(39, 51, 161, 0.35)"
            this.context.rect(this.multiselect_arr[0][0]+this.padd[3], this.canvas.height - this.multiselect_arr[0][1] - this.padd[2], this.multiselect_arr[1][0]-this.multiselect_arr[0][0], this.multiselect_arr[0][1]-this.multiselect_arr[1][1])
            this.context.fillStyle = "rgba(145, 163, 209, 0.27)";
            this.context.fill();
            this.context.stroke();
            this.context.strokeStyle = "rgb(0, 0, 0)"
        }
        //draw mirror
        if (mirror_checkbox.checked==true){
            this.context.beginPath();   
            this.context.fillStyle = colors.madmax_yellow_light;
            this.context.fillRect(this.padd[3], this.canvas.height-this.padd[2], -10, -this.canvas.height+this.padd[0]+this.padd[2])
            this.context.stroke();
        }
        this.onchange({type: "disc_change"})
    }
    add_disc(n = 1){
        var dielect_const = (this.discs.length>0) ? this.discs[0].dielect_const : 24;
        for (var i = 0; i<n; i++){
            if(this.discs.length>0){
                var x = Round(this.discs.slice(-1)[0].x+this.discs.slice(-1)[0].width, 10);
                this.discs.push({x: x, width: 0.1, dielect_const: dielect_const});
            }
            else{
                // Falls keine Discs existieren füge eins bei x = 0 dazu
                this.discs.push({x: 0, width: 0.1, dielect_const: dielect_const});
            }
        }

        this.focus_disc = [this.discs.slice(-1)[0]];
        this.fdisc_indexlist = [this.discs.length-1]
        synch_fdisc_text()

        this.draw();
        this.correct_overlap(true);
        synch_graphtoinput();
        discplot.load_to_memory();
        return this.discs.slice(-1)[0];
    }
    delete_discs(n = 1){
        // deletes the last n discs
        for (var i = 0; i<n; i++){
            // synch indexlist of focusdiscs
            this.fdisc_indexlist = this.fdisc_indexlist.filter(element => element !== this.discs.length-1)
            synch_fdisc_text()

            this.discs.pop();
            this.draw();
        }
        discplot.load_to_memory()
    }
    delete_fdiscs(){
        // deletes all focus_discs
        for (const value of this.focus_disc){
            if (value != null){
                this.discs = this.discs.filter(item => item != value)
                this.focus_disc = [];
                this.fdisc_indexlist = []
                synch_fdisc_text()
                synch_graphtoinput();
                this.draw();
            }
        }
        discplot.load_to_memory()
    }
    clear_discs(){
        this.discs = [];
        this.draw();
    }
    isOverlap(a, b){
        a.sort((x, y) => x - y);
        b.sort((x, y) => x - y);
        return Math.max(a[1], b[1])-Math.min(a[0], b[0]) <= (a[1]-a[0]+b[1]-b[0])
    }
    multiselect(origin, mouse){
        this.multiselect_arr = [origin, mouse]

        // bestimme die ausgewählten discs
        this.focus_disc = []
        this.fdisc_indexlist = []
        this.discs.forEach((rect, index) => {
            if(this.isOverlap([this.cm_to_pixel(rect.x), this.cm_to_pixel(rect.x)+this.cm_to_pixel(rect.width)], [origin[0], mouse[0]]) && this.isOverlap([0,this.canvas.height-this.padd[0]-this.padd[2]],[mouse[1],origin[1]])){
                this.focus_disc.push(rect)
                this.fdisc_indexlist.push(index)
            }
        });

        this.draw();
        synch_graphtoinput();
        synch_fdisc_text();
    }

    update_scale(start=0, unit="cm"){
        this.unit = unit;
        let step = find_stepvalue(start, this.xmax, 5);
        this.ticks = arange(start, this.xmax, step);
        this.draw();
    }

    pixel_to_cm(x_pixel){
        return (x_pixel/(this.canvas.width-this.padd[1]-this.padd[3]-20)*this.xmax)
    }
    cm_to_pixel(x){
        return Math.trunc(x*(this.canvas.width-this.padd[1]-this.padd[3]-20)/this.xmax)
    }
    correct_overlap(flexible_xmax=false){
        /* ToDo: Verlagere diese Codezeilen in eine andere Funtion, sodass sie nicht bei jeder Korrektur des Overlaps geladen werden*/
        if(this.focus_disc.length==0){
            var last_fdisc = discplot.discs[discplot.discs.length-1]

        }
        else{
            var last_fdisc = this.focus_disc[this.focus_disc.length-1];
        }

        const scale_length = this.xmax;
        var index1 = 0;
        var length1 = 0;
        var length2 = 0;

        while(index1<this.discs.length-1 && this.discs[index1]!=this.focus_disc[0]){
            length1 += this.discs[index1].width
            index1++
        }
        for(var i = index1 + this.focus_disc.length; i < this.discs.length; i++){
            length2 += this.discs[i].width;
        }

        var index2 = index1 + this.focus_disc.length - 1

        // korrigiere die focus_discs
        for(var i = 0; i<this.focus_disc.length-1; i++){
            if(this.focus_disc[i].x+this.focus_disc[i].width>this.focus_disc[i+1].x){
                this.focus_disc[i+1].x=this.focus_disc[i].x+this.focus_disc[i].width
            }
        }
        
        // sorge dafür, dass keine negativen Positionen möglich sind
        if (this.focus_disc.length!=0 && this.focus_disc[0].x<length1){
            const diff_x = length1-this.focus_disc[0].x
            this.focus_disc.reverse().forEach((element) => {
                canvas.x += diff_x
            })
            this.focus_disc.reverse()
        }
        // sorge dafür, dass keine zu großen Positionen möglich sind
        if(scale_length<last_fdisc.x+last_fdisc.width+length2){
            if(flexible_xmax){
                this.xmax = last_fdisc.x+last_fdisc.width+length2
            }
            else{
                const diff_x = scale_length-length2-last_fdisc.x-last_fdisc.width
                this.focus_disc.forEach((element) => {
                    canvas.x += diff_x
                })   
            }  
        }
        
        discplot.update_scale()


        // Korrigiere die Discs links von den Focusdiscs
        while(index1>0 && this.discs[index1-1].x+this.discs[index1-1].width>this.discs[index1].x){
            this.discs[index1-1].x=this.discs[index1].x-this.discs[index1-1].width
            index1--
            }
        // Korrigiere die Discs rechts von den Focusdiscs
        while(index2+1<this.discs.length && this.discs[index2].x+this.discs[index2].width>this.discs[index2+1].x){
            this.discs[index2+1].x=this.discs[index2].x+this.discs[index2].width
            index2++
            }
        }

    load_to_memory(){
        if(this.memory.length >= 10){
            this.memory.pop()
        }
        const mem_data = structuredClone({"data": this.discs,
            // "freq":[freq_min_field.value, freq_max_field.value], 
            "tand": tan_delta_input.value, 
            // "slider":slider_resolution.value, 
            "fdisc_indexlist":this.fdisc_indexlist,
            "graph_settings":[graph_pos_chkbx.checked, graph_dist_chkbx.checked],
            // "boostplot_log_lin_scale":[boostplot_chkbx_1.checked, boostplot_chkbx_2.checked],
            "xmax":this.xmax});
        
        if(JSON.stringify(mem_data) !== JSON.stringify(this.memory[0])){
            this.memory.splice(0, this.memory_pos, mem_data)
            this.memory_pos = 0
        }
    }
    load_from_memory(){
        // lade die Einstellungen aus memory 
        // code is piece of shit
        this.discs = this.memory[this.memory_pos]["data"]
        this.xmthis = this.memory[this.memory_pos]["xmthis"]
        freq_min_field.value = this.memory[this.memory_pos]["freq"][0]
        freq_max_field.value = this.memory[this.memory_pos]["freq"][1]
        tan_delta_input.value = this.memory[this.memory_pos]["tand"]
        slider_resolution.value = this.memory[this.memory_pos]["slider"]
        this.fdisc_indexlist = this.memory[this.memory_pos]["fdisc_indexlist"]
        graph_pos_chkbx.checked = this.memory[this.memory_pos]["graph_settings"][0]
        graph_dist_chkbx.checked = this.memory[this.memory_pos]["graph_settings"][1]
        boostplot_chkbx_1.checked = this.memory[this.memory_pos]["boostplot_log_lin_scale"][0]
        boostplot_chkbx_2.checked = this.memory[this.memory_pos]["boostplot_log_lin_scale"][1]

        this.focus_disc = []
        this.fdisc_indexlist.forEach(element => this.focus_disc.push(this.discs[element]))

        
        this.draw();
        synch_graphtoinput();
        this.update_scale()
        this.send_settings_to_backend();
        update_log_lin_1();
        update_log_lin_2();
    }
    onchange(event){
        // function to call when a change in the settings occurs
        null
    }
}

const discplot = new Plot(canvas);   
export default discplot;


function synch_fdisc_text(){
    // aktualisiert den Textschriftzug der aktuell ausgewählten discs
    if(discplot.fdisc_indexlist.length > 1){
        discNumberString.innerHTML = "discs " + String(discplot.fdisc_indexlist[0]+1) + " - " + String(discplot.fdisc_indexlist[discplot.fdisc_indexlist.length-1]+1 + " selected")
    }
    else if(discplot.fdisc_indexlist.length == 1){
        discNumberString.innerHTML = "disc " + String(discplot.fdisc_indexlist[0]+1 + " selected")
    }
    else{
        discNumberString.innerHTML = "no disc selected"
    }
}


function synch_graphtoinput(){
    // synchronisiert die Einstellungen der Scheiben im Graph mit den Inputfeldern
    if (discplot.focus_disc.length == 1){
        if(dis_pos_switch){
            position_input.value = discplot.focus_disc[0].x;    
        }
        else{
            if(discplot.fdisc_indexlist[0]==0){
                position_input.value = discplot.focus_disc[0].x;
            }
            else{
                position_input.value = Round(discplot.discs[discplot.fdisc_indexlist[0]].x-discplot.discs[discplot.fdisc_indexlist[0]-1].x-discplot.discs[discplot.fdisc_indexlist[0]-1].width, 10);
            }
        }
        width_input.value = discplot.focus_disc[0].width;
        epsilon_input.value = discplot.focus_disc[0].dielect_const;
        counter_field.value = Object.keys(discplot.discs).length;
    } 
    else if (discplot.focus_disc.length == 0){
        position_input.value = "";
        width_input.value = "";
        epsilon_input.value = "";
        counter_field.value = Object.keys(discplot.discs).length;
    }
    else{
        position_input.value = "";
        width_input.value = "";
        epsilon_input.value = "";
        counter_field.value = Object.keys(discplot.discs).length;

        if(dis_pos_switch){
            position_input.value = discplot.focus_disc[0].x;
        }
        else{
            var distances = [];
            for (var i = 1; i < discplot.focus_disc.length; i++){
                distances.push(Round(discplot.focus_disc[i].x-discplot.focus_disc[i-1].x-discplot.focus_disc[i-1].width, 6))
            }
            if(distances.every((element)=> element === distances[0])){
                position_input.value = distances[0];
            }
        }
        if(discplot.focus_disc.map((value) => value.width).every((element)=> element === discplot.focus_disc[0].width)){
            width_input.value = discplot.focus_disc[0].width;
        }
        if(discplot.focus_disc.map((value) => value.dielect_const).every((element)=> element === discplot.focus_disc[0].dielect_const)){
            epsilon_input.value = discplot.focus_disc[0].dielect_const;
        }
    }
    try{
            resize_font(position_input);
            resize_font(width_input);
        }
    catch{}

    // synchronisiere die Längeneinheiten
    Object.values(document.getElementsByClassName("unit_label")).forEach(element => element.innerHTML = discplot.unit);
}

function synch_inputtograph(){
    // synchronisiere die Inputfelder mit der den Einstellungen der Scheiben im Graph

    // Single Select
    if(discplot.focus_disc.length == 1){
        if(dis_pos_switch){
            discplot.focus_disc[0].x = parseFloat(position_input.value);
        }
        else{
            if(discplot.fdisc_indexlist[0]==0){
                discplot.focus_disc[0].x = parseFloat(position_input.value);
            }
            else{
                discplot.focus_disc[0].x = Round(parseFloat(position_input.value) + discplot.discs[discplot.fdisc_indexlist[0]-1].x + discplot.discs[discplot.fdisc_indexlist[0]-1].width, 10)
            }
        }
        discplot.focus_disc[0].width = parseFloat(width_input.value);

        // focus_disc[0].dielect_const = parseFloat(epsilon_input.value);
        discplot.discs.map(element => element.dielect_const=parseFloat(epsilon_input.value))
    }

    // Multiselect
    else if(discplot.focus_disc.length > 1){
        if(dis_pos_switch){
            if (position_input.value!=""){
                var dx = parseFloat(position_input.value)-discplot.focus_disc[0].x
                console.log(parseFloat(position_input.value)-discplot.focus_disc[0].x)
                discplot.focus_disc.forEach(element => {
                    element.x += dx + 0
                })
            }
        }
        else{
            if(width_input.value!=""){
                discplot.focus_disc.forEach(element => {
                    element.width = parseFloat(width_input.value);
                })
            }
            if(position_input.value!=""){
                var curr_pos = discplot.focus_disc[0].x
                discplot.focus_disc.forEach((element) => {
                    element.x = curr_pos;
                    curr_pos += element.width + parseFloat(position_input.value);
                })
            }
        }
        discplot.discs.map(element => element.dielect_const=parseFloat(epsilon_input.value)) 
    }
    discplot.correct_overlap(true);
    discplot.draw();
    discplot.send_settings_to_backend();
}

// EventListener
discplot.canvas.addEventListener("mousedown", () => {
    mouse_status_sim = true;
    for (const [index,rect] of Object.entries(discplot.discs)) {
        // Rechteck verschieben
        // Prüfe ob Click in Rechteck liegt
        if (mouse_x > discplot.cm_to_pixel(rect.x) && mouse_x < discplot.cm_to_pixel(rect.x+rect.width) && mouse_y>0 && mouse_y<discplot.rect_height){
            if (!(discplot.focus_disc.some(element => element==rect))){
                discplot.focus_disc = [rect]
                discplot.fdisc_indexlist = [parseInt(index)]
                synch_fdisc_text();
            }
            var dx = []
            var scale_factor = (mouse_y<discplot.rect_height-fine_adjustment_size) ? 1 : 0.2
            for (const element of discplot.focus_disc){
                dx.push([mouse_x, element.x])
            }
            SingleClickIntervall = setInterval(() => {
                for (const [index, element] of Object.entries(discplot.focus_disc)){
                    element.x = Round(dx[index][1]+Round(discplot.pixel_to_cm(mouse_x-dx[index][0])*scale_factor, 3), 10)
                }
                discplot.correct_overlap();
                synch_graphtoinput();
                discplot.draw();
            }, 2);
            // sende Einstellungen in regelmäßigen Abständen an das Backend
            BoostplotIntervall = setInterval(() => {try{discplot.send_settings_to_backend()}catch{console.log("senden fehlgeschlagen")}}, 20);
            return;
        }
    }
    const origin = [mouse_x, mouse_y]
    MarqueeSelectionIntervall = setInterval(() => {
        discplot.multiselect(origin, [mouse_x, mouse_y]);
    }, 2)
});

document.addEventListener("mouseup", () => {mouse_status_sim = false; try{clearInterval(SingleClickIntervall); /* lade die Einstellungen in den speicher wenn das Intervall existiert */ discplot.load_to_memory()} catch(error){}; try{clearInterval(MarqueeSelectionIntervall); discplot.load_to_memory();} catch(error){}; try{clearInterval(BoostplotIntervall)}catch{}; discplot.multiselect_arr = []; discplot.draw(); canvas.style.cursor = "default";});
canvas.addEventListener("mousemove", event => {
    const canvas_coordinates = canvas.getBoundingClientRect();
    mouse_x = event.clientX - canvas_coordinates.left - discplot.padd[3];
    mouse_y = canvas_coordinates.top - event.clientY + canvas.height - discplot.padd[2];
    
    
    for (const rect of discplot.discs) {
        if (mouse_x>=discplot.cm_to_pixel(rect.x) && mouse_x<=discplot.cm_to_pixel(rect.x+rect.width) && mouse_y<=discplot.rect_height && mouse_y>=discplot.rect_height-fine_adjustment_size){
            canvas.style.cursor = "ew-resize";
            break;
        }
        else if(!mouse_status_sim){
            canvas.style.cursor = "default";
        }
    };
});


// Zoom mit Scrollrad

canvas.addEventListener("wheel", (event) => { 
    if(event.shiftKey){
        const step = 1;
        const last_disc = discplot.discs[discplot.discs.length-1]

        if (event.deltaY>0){
            discplot.xmax += step
            }
        else if (discplot.cm_to_pixel(last_disc.x+last_disc.width+step)<discplot.element.width-discplot.padd[1]-discplot.padd[3]){
            discplot.xmax = discplot.xmax - step
        }
        discplot.update_scale()
        discplot.draw()
        }
})


// implementiere shift+Pfeiltasten
var lr_status_frects = undefined;

document.addEventListener("keydown", (event)=>{
    if(event.shiftKey && lr_status_frects == undefined && event.code == "ArrowLeft"){
        lr_status_frects = "ArrowLeft"
    }
    else if(event.shiftKey && lr_status_frects == undefined && event.code == "ArrowRight"){
        lr_status_frects = "ArrowRight"
    }

    if (event.shiftKey && lr_status_frects==="ArrowLeft"){
        if(event.code==="ArrowLeft"){
            if(discplot.fdisc_indexlist.length!=0, discplot.fdisc_indexlist[0]>0){
                discplot.focus_disc.unshift(discplot.discs[discplot.fdisc_indexlist[0]-1])
                discplot.fdisc_indexlist.unshift(discplot.fdisc_indexlist[0]-1)
            }
        }
        else if(event.code==="ArrowRight"){
            if(discplot.fdisc_indexlist.length>1){
                discplot.focus_disc.shift()
                discplot.fdisc_indexlist.shift()
            }
        }
    }
    if (event.shiftKey && lr_status_frects==="ArrowRight"){
        if(event.code==="ArrowRight"){
            if(discplot.fdisc_indexlist.slice(-1)[0]<discplot.discs.length-1){
                discplot.focus_disc.push(discplot.discs[parseInt(discplot.fdisc_indexlist.slice(-1))+1])
                discplot.fdisc_indexlist.push(parseInt(discplot.fdisc_indexlist.slice(-1))+1)
            }
        }
        else if(event.code==="ArrowLeft"){
            if(discplot.fdisc_indexlist.length>1){
                discplot.focus_disc.pop()
                discplot.fdisc_indexlist.pop()
            }
        }
    }
    discplot.draw()
    synch_fdisc_text()

})
document.addEventListener("keyup", (up_event)=>{
    if(up_event.code == "ShiftLeft"){
        lr_status_frects = undefined;
    }
})


// implementiere Strg+Z und Strg+Y

document.addEventListener("keydown", event => {
    if(event.ctrlKey){
        if (event.code == "KeyY" && discplot.memory_pos < discplot.memory.length-1){
            discplot.memory_pos += 1
            // lade die Einstellungen aus memory
            discplot.load_from_memory();
        }
        if (event.code == "KeyZ" && discplot.memory_pos > 0){
            discplot.memory_pos -= 1
            // lade die Einstellungen aus memory
            discplot.load_from_memory();
        }
    }
})




discplot.update_scale();
discplot.focus_disc = [discplot.add_disc()];
synch_graphtoinput();

console.log("discplot.js loaded")