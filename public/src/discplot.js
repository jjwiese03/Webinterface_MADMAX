graph_pos_chkbx.checked = true
var dis_pos_switch = true       // true == pos      false == dis
var mouse_status_sim = false


const fine_adjustment_size = 15 // speichert die größe des Feinjustierungskastens in px

canvas.width  = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

class Plot{
    constructor(element){
        this.element = element;
        this.context = element.getContext("2d");

        this.padd = [80,70,70,70]
        this.context.font = "17px Arial";
        this.rect_height = this.element.height-this.padd[0]-this.padd[2];
        
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
        this.context.clearRect(0, 0, canvas.width, canvas.height)
        // Diese Funktion zeichnet ein Axensystem samt Inhalt
    
        this.context.beginPath();       
        this.context.fillStyle = "black";

        //Pfeil der y-Achse
        this.context.moveTo(this.padd[3]+8, this.padd[0]+8);
        this.context.lineTo(this.padd[3], this.padd[0]);
        this.context.lineTo(this.padd[3]-8, this.padd[0]+8);
        this.context.moveTo(this.padd[3], this.padd[0]);

        //Achsenlinien
        this.context.lineTo(this.padd[3], this.element.height-this.padd[2]); 
        this.context.lineTo(this.element.width-this.padd[1], this.element.height-this.padd[2]);

        //Pfeil der x-Achse
        this.context.lineTo(this.element.width-this.padd[1]-8, this.element.height-this.padd[2]+8);
        this.context.moveTo(this.element.width-this.padd[1], this.element.height-this.padd[2]);
        this.context.lineTo(this.element.width-this.padd[1]-8, this.element.height-this.padd[2]-8);

        //Label
        this.context.textAlign = "center"
        this.context.font;
        this.context.fillText("Position [" + this.unit + "]", this.padd[3]+(this.element.width-this.padd[1]-this.padd[3])/2, this.element.height-this.padd[2]/2+this.context.measureText("Position").emHeightAscent/2+10);
        this.context.fillText("E/E₀", this.padd[3]/2, this.padd[0]+(this.element.height-this.padd[0]-this.padd[2]+this.context.measureText("E/E₀").emHeightAscent)/2);

        this.context.stroke();

        // draw axticks
        this.ticks.forEach(tick => {
            this.context.beginPath();
            this.context.fillStyle = "black";
            this.context.moveTo(this.padd[3]+this.cm_to_pixel(tick), this.element.height-this.padd[2]);
            this.context.lineTo(this.padd[3]+this.cm_to_pixel(tick), this.element.height-this.padd[2]+8);
            this.context.textAlign = "center"
            this.context.fillText(tick, this.padd[3]+this.cm_to_pixel(tick), this.element.height-this.padd[2]+25)
            this.context.stroke();
        });

        // draw discs
        var prev_disc = {"x":0, "width":0};
        var arrow_start;    // hilft bei zeichnen der Abstandspfeile zwischen den Scheiben (Start eines Pfeils)
        var arrow_end;    // hilft bei zeichnen der Abstandspfeile zwischen den Scheiben (Ende eines Pfeils)
        var arrow_y = this.element.height/2;  // Höhe auf der der Pfeil gezeichnet wird
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


            this.context.fillStyle = "black";
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
            this.context.rect(this.multiselect_arr[0][0]+this.padd[3], this.element.height - this.multiselect_arr[0][1] - this.padd[2], this.multiselect_arr[1][0]-this.multiselect_arr[0][0], this.multiselect_arr[0][1]-this.multiselect_arr[1][1])
            this.context.fillStyle = "rgba(145, 163, 209, 0.27)";
            this.context.fill();
            this.context.stroke();
            this.context.strokeStyle = "rgb(0, 0, 0)"
        }
        //draw mirror
        if (mirror_checkbox.checked==true){
            this.context.beginPath();   
            this.context.fillStyle = "rgba(219, 212, 1, 0.54)";
            this.context.fillRect(this.padd[3], this.element.height-this.padd[2], -10, -this.element.height+this.padd[0]+this.padd[2])
            this.context.stroke();
        }
    }
    // ax.draw_E_field([[0,0],[1,5],[3,-2]])
    draw_E_field(data){
        // draw data
        this.context.beginPath(); 

        this.context.moveTo(this.padd[1]+this.cm_to_pixel(data[0][0]), canvas.height-this.E_to_pixel(data[0][1])-this.padd[2])
        data.forEach(element => {
            this.context.lineTo(this.padd[1]+this.cm_to_pixel(element[0]), canvas.height-this.E_to_pixel(element[1])-this.padd[2]);
        })
        
        // draw y-axticks

        this.context.stroke();

    }
    E_to_pixel(E){
        return Math.trunc((this.element.height-this.padd[0]-this.padd[2])/2*(1+E/(this.Emax)))
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
        ax.load_to_memory();
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
        ax.load_to_memory()
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
        ax.load_to_memory()
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
            if(this.isOverlap([this.cm_to_pixel(rect.x), this.cm_to_pixel(rect.x)+this.cm_to_pixel(rect.width)], [origin[0], mouse[0]]) && this.isOverlap([0,this.element.height-this.padd[0]-this.padd[2]],[mouse[1],origin[1]])){
                this.focus_disc.push(rect)
                this.fdisc_indexlist.push(index)
            }
        });

        this.draw();
        synch_graphtoinput();
        synch_fdisc_text();
    }
    send_settings_to_backend(wc = 'Boost'){
        //send setting data to backend
        
        if(tan_delta_field.value==""){
            document.getElementById("alert_div").innerHTML = "choose your tan(&delta;)"
            update_boostplot([[0,0],[0,0]])
        }
        else if (freq_min_field.value.length!=0 && freq_max_field.value.length!=0){
            document.getElementById("alert_div").innerHTML = ""

            const disc_data = this.discs.map(element => ({"x": element.x/100, "width":element.width/100, dielect_const: element.dielect_const}));
            try{Genie.WebChannels.sendMessageTo(wc, 'echo', {"disc_data": disc_data, "f_min": parseFloat(freq_min_field.value)*10**9, "f_max": parseFloat(freq_max_field.value)*10**9, "n": parseInt(slider_resolution.value), "mirror": document.getElementById("mirror_checkbox").checked, "tan_delta":parseFloat(tan_delta_field.value)*10**-6})}
            catch{console.log("Daten konnten nicht gesendet werden")}
        }
        else{
            document.getElementById("alert_div").innerHTML = "specify a valid frequency range"
            update_boostplot([[0,0],[0,0]])
        }
    }

    update_scale(start=0, unit="cm"){
        this.unit = unit;
        let step = find_stepvalue(start, this.xmax, 5);
        this.ticks = arange(start, this.xmax, step);
        this.draw();
    }

    pixel_to_cm(x_pixel){
        return (x_pixel/(this.element.width-this.padd[1]-this.padd[3]-20)*this.xmax)
    }
    cm_to_pixel(x){
        return Math.trunc(x*(this.element.width-this.padd[1]-this.padd[3]-20)/this.xmax)
    }
    correct_overlap(flexible_xmax=false){
        /* ToDo: Verlagere diese Codezeilen in eine andere Funtion, sodass sie nicht bei jeder Korrektur des Overlaps geladen werden*/
        if(this.focus_disc.length==0){
            var last_fdisc = ax.discs[ax.discs.length-1]

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
                element.x += diff_x
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
                    element.x += diff_x
                })   
            }  
        }
        
        ax.update_scale()


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
            "freq":[freq_min_field.value, freq_max_field.value], 
            "tand": tan_delta_field.value, 
            "slider":slider_resolution.value, 
            "fdisc_indexlist":this.fdisc_indexlist,
            "graph_settings":[graph_pos_chkbx.checked, graph_dist_chkbx.checked],
            "boostplot_log_lin_scale":[boostplot_chkbx_1.checked, boostplot_chkbx_2.checked],
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
        tan_delta_field.value = this.memory[this.memory_pos]["tand"]
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
}

function synch_graphtoinput(){
    // synchronisiert die Einstellungen der Scheiben im Graph mit den Inputfeldern
    if (ax.focus_disc.length == 1){
        if(dis_pos_switch){
            position_field.value = ax.focus_disc[0].x;    
        }
        else{
            if(ax.fdisc_indexlist[0]==0){
                position_field.value = ax.focus_disc[0].x;
            }
            else{
                position_field.value = Round(ax.discs[ax.fdisc_indexlist[0]].x-ax.discs[ax.fdisc_indexlist[0]-1].x-ax.discs[ax.fdisc_indexlist[0]-1].width, 10);
            }
        }
        width_field.value = ax.focus_disc[0].width;
        dielectric_field.value = ax.focus_disc[0].dielect_const;
        counter_field.value = Object.keys(ax.discs).length;
    } 
    else if (ax.focus_disc.length == 0){
        position_field.value = "";
        width_field.value = "";
        dielectric_field.value = "";
        counter_field.value = Object.keys(ax.discs).length;
    }
    else{
        position_field.value = "";
        width_field.value = "";
        dielectric_field.value = "";
        counter_field.value = Object.keys(ax.discs).length;

        if(dis_pos_switch){
            position_field.value = ax.focus_disc[0].x;
        }
        else{
            var distances = [];
            for (var i = 1; i < ax.focus_disc.length; i++){
                distances.push(Round(ax.focus_disc[i].x-ax.focus_disc[i-1].x-ax.focus_disc[i-1].width, 6))
            }
            if(distances.every((element)=> element === distances[0])){
                position_field.value = distances[0];
            }
        }
        if(ax.focus_disc.map((value) => value.width).every((element)=> element === ax.focus_disc[0].width)){
            width_field.value = ax.focus_disc[0].width;
        }
        if(ax.focus_disc.map((value) => value.dielect_const).every((element)=> element === ax.focus_disc[0].dielect_const)){
            dielectric_field.value = ax.focus_disc[0].dielect_const;
        }
    }
    try{
            resize_font(position_field);
            resize_font(width_field);
        }
    catch{}

    // synchronisiere die Längeneinheiten
    Object.values(document.getElementsByClassName("unit_label")).forEach(element => element.innerHTML = ax.unit);
}
function synch_inputtograph(){
    // synchronisiere die Inputfelder mit der den Einstellungen der Scheiben im Graph

    // Single Select
    if(ax.focus_disc.length == 1){
        if(dis_pos_switch){
            ax.focus_disc[0].x = parseFloat(position_field.value);
        }
        else{
            if(ax.fdisc_indexlist[0]==0){
                ax.focus_disc[0].x = parseFloat(position_field.value);
            }
            else{
                ax.focus_disc[0].x = Round(parseFloat(position_field.value) + ax.discs[ax.fdisc_indexlist[0]-1].x + ax.discs[ax.fdisc_indexlist[0]-1].width, 10)
            }
        }
        ax.focus_disc[0].width = parseFloat(width_field.value);

        // focus_disc[0].dielect_const = parseFloat(dielectric_field.value);
        ax.discs.map(element => element.dielect_const=parseFloat(dielectric_field.value))
    }

    // Multiselect
    else if(ax.focus_disc.length > 1){
        if(dis_pos_switch){
            if (position_field.value!=""){
                var dx = parseFloat(position_field.value)-ax.focus_disc[0].x
                console.log(parseFloat(position_field.value)-ax.focus_disc[0].x)
                ax.focus_disc.forEach(element => {
                    element.x += dx + 0
                })
            }
        }
        else{
            if(width_field.value!=""){
                ax.focus_disc.forEach(element => {
                    element.width = parseFloat(width_field.value);
                })
            }
            if(position_field.value!=""){
                var curr_pos = ax.focus_disc[0].x
                ax.focus_disc.forEach((element) => {
                    element.x = curr_pos;
                    curr_pos += element.width + parseFloat(position_field.value);
                })
            }
        }
        ax.discs.map(element => element.dielect_const=parseFloat(dielectric_field.value)) 
    }
    ax.correct_overlap(true);
    ax.draw();
    ax.send_settings_to_backend();
}

function synch_fdisc_text(){
    // aktualisiert den Textschriftzug der aktuell ausgewählten discs
    if(ax.fdisc_indexlist.length > 1){
        document.getElementById("scheibenauswahl").innerHTML = "discs " + String(ax.fdisc_indexlist[0]+1) + " - " + String(ax.fdisc_indexlist[ax.fdisc_indexlist.length-1]+1 + " selected")
    }
    else if(ax.fdisc_indexlist.length == 1){
        document.getElementById("scheibenauswahl").innerHTML = "disc " + String(ax.fdisc_indexlist[0]+1 + " selected")
    }
    else{
        document.getElementById("scheibenauswahl").innerHTML = "no disc selected"
    }
}

// EventListener
canvas.addEventListener("mousedown", () => {
    mouse_status_sim = true;
    for (const [index,rect] of Object.entries(ax.discs)) {
        // Rechteck verschieben
        // Prüfe ob Click in Rechteck liegt
        if (mouse_x > ax.cm_to_pixel(rect.x) && mouse_x < ax.cm_to_pixel(rect.x+rect.width) && mouse_y>0 && mouse_y<ax.rect_height){
            if (!(ax.focus_disc.some(element => element==rect))){
                ax.focus_disc = [rect]
                ax.fdisc_indexlist = [parseInt(index)]
                synch_fdisc_text();
            }
            var dx = []
            var scale_factor = (mouse_y<ax.rect_height-fine_adjustment_size) ? 1 : 0.2
            for (const element of ax.focus_disc){
                dx.push([mouse_x, element.x])
            }
            IntervallId = setInterval(() => {
                for (const [index, element] of Object.entries(ax.focus_disc)){
                    element.x = Round(dx[index][1]+Round(ax.pixel_to_cm(mouse_x-dx[index][0])*scale_factor, 3), 10)
                }
                ax.correct_overlap();
                synch_graphtoinput();
                ax.draw();
            }, 2);
            // sende Einstellungen in regelmäßigen Abständen an das Backend
            boostplot_intervall = setInterval(() => {try{ax.send_settings_to_backend()}catch{console.log("senden fehlgeschlagen")}}, 20);
            return;
        }
    }
    const origin = [mouse_x, mouse_y]
    Intervall_multiselect = setInterval(() => {
        ax.multiselect(origin, [mouse_x, mouse_y]);
    }, 2)
});

document.addEventListener("mouseup", () => {mouse_status_sim = false; try{clearInterval(IntervallId); /* lade die Einstellungen in den speicher wenn das Intervall existiert */ ax.load_to_memory()} catch(error){}; try{clearInterval(Intervall_multiselect); ax.load_to_memory();} catch(error){}; try{clearInterval(boostplot_intervall)}catch{}; ax.multiselect_arr = []; ax.draw(); canvas.style.cursor = "default";});
canvas.addEventListener("mousemove", event => {
    const canvas_coordinates = canvas.getBoundingClientRect();
    mouse_x = event.clientX - canvas_coordinates.left - ax.padd[3];
    mouse_y = canvas_coordinates.top - event.clientY + canvas.height - ax.padd[2];
    
    
    for (const rect of ax.discs) {
        if (mouse_x>=ax.cm_to_pixel(rect.x) && mouse_x<=ax.cm_to_pixel(rect.x+rect.width) && mouse_y<=ax.rect_height && mouse_y>=ax.rect_height-fine_adjustment_size){
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
        const last_disc = ax.discs[ax.discs.length-1]
        console.log(event.deltaY)

        if (event.deltaY>0){
            ax.xmax += step
            }
        else if (ax.cm_to_pixel(last_disc.x+last_disc.width+step)<ax.element.width-ax.padd[1]-ax.padd[3]){
            ax.xmax = ax.xmax - step
        }
        ax.update_scale()
        ax.draw()
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
            if(ax.fdisc_indexlist.length!=0, ax.fdisc_indexlist[0]>0){
                ax.focus_disc.unshift(ax.discs[ax.fdisc_indexlist[0]-1])
                ax.fdisc_indexlist.unshift(ax.fdisc_indexlist[0]-1)
            }
        }
        else if(event.code==="ArrowRight"){
            if(ax.fdisc_indexlist.length>1){
                ax.focus_disc.shift()
                ax.fdisc_indexlist.shift()
            }
        }
    }
    if (event.shiftKey && lr_status_frects==="ArrowRight"){
        if(event.code==="ArrowRight"){
            if(ax.fdisc_indexlist.slice(-1)[0]<ax.discs.length-1){
                ax.focus_disc.push(ax.discs[parseInt(ax.fdisc_indexlist.slice(-1))+1])
                ax.fdisc_indexlist.push(parseInt(ax.fdisc_indexlist.slice(-1))+1)
            }
        }
        else if(event.code==="ArrowLeft"){
            if(ax.fdisc_indexlist.length>1){
                ax.focus_disc.pop()
                ax.fdisc_indexlist.pop()
            }
        }
    }
    ax.draw()
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
        if (event.code == "KeyY" && ax.memory_pos < ax.memory.length-1){
            ax.memory_pos += 1
            // lade die Einstellungen aus memory
            ax.load_from_memory();
        }
        if (event.code == "KeyZ" && ax.memory_pos > 0){
            ax.memory_pos -= 1
            // lade die Einstellungen aus memory
            ax.load_from_memory();
        }
    }
})



ax = new Plot(canvas);
ax.update_scale();
ax.focus_disc = [ax.add_disc()];
synch_graphtoinput();
// function openFullscreen() {
//   if (document.documentElement.requestFullscreen) {
//     document.documentElement.requestFullscreen();
//   } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
//     document.documentElement.webkitRequestFullscreen();
//   } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
//     document.documentElement.msRequestFullscreen();
//   }
// }
// openFullscreen()