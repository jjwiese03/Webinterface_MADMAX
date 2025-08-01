const canvas = document.getElementById("Graph");
//const ctx = canvas.getContext("2d");

const position_field = document.getElementById("pos");
const width_field = document.getElementById("width");
const dielectric_field = document.getElementById("dielectric");
const counter_field = document.getElementById("counter_txt_id");
const import_button = document.getElementById("input_select");
const mirror_checkbox = document.getElementById("mirror_checkbox");
const boostfactor_plot = document.getElementById("boostfactor");
const graph_pos_chkbx = document.getElementById("graph_pos_chkbx");
const graph_dist_chkbx = document.getElementById("graph_dist_chkbx");


const freq_min_field = document.getElementById("freq_min")
const freq_max_field = document.getElementById("freq_max")
const tan_delta_field = document.getElementById("tan_delta")
const slider_resolution = document.getElementById("slider_resolution");

graph_pos_chkbx.checked = true
var dis_pos_switch = true       // true == pos      false == dis
var mouse_status_sim = false


// Erstelle einen Efield channel
// Genie.initWebChannel("Efield")
// process_payload("Efield", event => {
//     console.log("Nachricht über Efield Channel erhalten")
// })


// console.log(Genie.WebChannels.WebChannel.socket.readyState)
// Genie.WebChannels.process_payload("____", event => {
//     console.log("anfrage von Webchannel")
// })

var focus_disc = [];     // speichert welche disc zuletzt im focus war
var fdisc_indexlist = [];

const fine_adjustment_size = 15 // speichert die größe des Feinjustierungskastens in px



class Axes{
    constructor(element, padding = [80,70,null,null], arrowsize=8, labelfont="17px Arial"){
        this.element = element;
        this.context = element.getContext("2d");
        this.context.font = labelfont;
        this.xlabel = "Position";
        this.ylabel = "E/E₀";

        // calculate padding
        if (padding[2]==null){
            padding[2] = this.context.measureText(this.ylabel).emHeightAscent+2*20
        }
        if (padding[3]==null){
            padding[3] = this.context.measureText(this.xlabel).width+2*20
        }
        this.padd = padding
        this.arrowsize = arrowsize;
        this.context.font = labelfont;
        this.rects = [];
        this.rect_height = this.element.height-this.padd[0]-this.padd[2];
        this.multiselect_arr = [];      // Arr to capture the location and dimensions of the multiselect rect

        this.memory = []        // speichert die Disc- und Frequenzeinstellungen der letzten 10 Schritte
        this.memory_pos = 0     // speichert welcher Zustand aus memory gerade gezeigt wird (antiproportional, also 0 = letzter Eintrag aus memory und memory.length = erster Eintrag)

        this.xmax = 10;
        this.Emax = 5;
        this.ticks = [];
        this.yticks = [];
        this.unit = "cm";
        this.draw()
    }

    pos_canvas_to_graph(x,y){
        // berechnet die Koordinaten (in Pixeln) von Canvas-Koordinaten in die des Koordinatensystems
        return {"x":x-this.padd[3], "y":this.element.height-y-this.padd[2]}
    }
    pos_graph_to_canvas(x,y){
        // berechnet die Koordinaten (in Pixeln) des Koordinatensystems in die des Canvas
        return {"x":x+this.padd[3], "y":this.element.height-this.padd[2]-y}
    }
    draw(){
        this.context.clearRect(0, 0, canvas.width, canvas.height)
        // Diese Funktion zeichnet ein Axensystem samt Inhalt
    
        this.context.beginPath();       
        this.context.fillStyle = "black";

        //Pfeil der y-Achse
        this.context.moveTo(this.padd[3]+this.arrowsize, this.padd[0]+this.arrowsize);
        this.context.lineTo(this.padd[3], this.padd[0]);
        this.context.lineTo(this.padd[3]-this.arrowsize, this.padd[0]+this.arrowsize);
        this.context.moveTo(this.padd[3], this.padd[0]);

        //Achsenlinien
        this.context.lineTo(this.padd[3], this.element.height-this.padd[2]); 
        this.context.lineTo(this.element.width-this.padd[1], this.element.height-this.padd[2]);

        //Pfeil der x-Achse
        this.context.lineTo(this.element.width-this.padd[1]-this.arrowsize, this.element.height-this.padd[2]+this.arrowsize);
        this.context.moveTo(this.element.width-this.padd[1], this.element.height-this.padd[2]);
        this.context.lineTo(this.element.width-this.padd[1]-this.arrowsize, this.element.height-this.padd[2]-this.arrowsize);

        //Label
        this.context.textAlign = "center"
        this.context.font;
        this.context.fillText(this.xlabel + " [" + this.unit + "]", this.padd[3]+(this.element.width-this.padd[1]-this.padd[3])/2, this.element.height-this.padd[2]/2+this.context.measureText(this.xlabel).emHeightAscent/2+10);
        this.context.fillText(this.ylabel, this.padd[3]/2, this.padd[0]+(this.element.height-this.padd[0]-this.padd[2]+this.context.measureText(this.ylabel).emHeightAscent)/2);

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
        for (const rect of this.rects) {
            this.context.beginPath();   
            this.context.rect(this.padd[3]+this.cm_to_pixel(rect.x), this.padd[0], this.cm_to_pixel(rect.width), this.rect_height);
            if (focus_disc.some(element => element==rect)){
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
    add_disc(x=null, width=0.1, dielect_const=24, n=1){

        if (this.rects.length>0){
            dielect_const = this.rects[0].dielect_const
        }
        if (x == null){
            for (var i = 0; i<n; i++){
                try{
                    x = Round(this.rects.slice(-1)[0].x+this.rects.slice(-1)[0].width, 10);
                    this.rects.push({x: x, width: width, dielect_const: dielect_const});

                }
                catch{
                    // Falls keine Discs existieren füge eins bei x = 0 dazu
                    this.rects.push({x: 0, width: width, dielect_const: dielect_const});
                }
            }
        }
        else{
            this.rects.push({x: x, width: width, dielect_const: dielect_const});
        }

        focus_disc = [this.rects.slice(-1)[0]];
        fdisc_indexlist = [this.rects.length-1]
        synch_fdisc_text()

        this.draw();
        this.correct_overlap(true);
        synch_graphtoinput();
        ax.load_setting_to_memory();
        return this.rects.slice(-1)[0];
    }
    delete_discs(n = 0){
        // deletes the last n discs
        for (var i = 1; i<=n; i++){
            // synch indexlist of focusdiscs
            fdisc_indexlist = fdisc_indexlist.filter(element => element !== this.rects.length-1)
            synch_fdisc_text()

            this.rects.pop();
            this.draw();
        }
        ax.load_setting_to_memory()
    }
    delete_fdiscs(){
        // deletes all focus_discs
        for (const value of focus_disc){
            if (value != null){
                this.rects = this.rects.filter(item => item != value)
                focus_disc = [];
                fdisc_indexlist = []
                synch_fdisc_text()
                synch_graphtoinput();
                this.draw();
            }
        }
        ax.load_setting_to_memory()
    }
    clear_discs(){
        this.rects = [];
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
        focus_disc = []
        fdisc_indexlist = []
        this.rects.forEach((rect, index) => {
            if(this.isOverlap([this.cm_to_pixel(rect.x), this.cm_to_pixel(rect.x)+this.cm_to_pixel(rect.width)], [origin[0], mouse[0]]) && this.isOverlap([0,this.element.height-this.padd[0]-this.padd[2]],[mouse[1],origin[1]])){
                focus_disc.push(rect)
                fdisc_indexlist.push(index)
            }
        });

        this.draw();
        synch_graphtoinput();
        synch_fdisc_text();
    }
    send_settings_to_backend(){
        //send setting data to backend
        
        if(tan_delta_field.value==""){
            document.getElementById("alert_div").innerHTML = "choose your tan(&delta;)"
        }
        else if (freq_min_field.value.length!=0 && freq_max_field.value.length!=0){
            document.getElementById("alert_div").innerHTML = ""

            const disc_data = this.rects.map(element => ({"x": element.x/100, "width":element.width/100, dielect_const: element.dielect_const}));
            document.getElementById("alert_div").innerHTML = ""
            try{Genie.WebChannels.sendMessageTo('____', 'echo', {"disc_data": disc_data, "f_min": parseFloat(freq_min_field.value)*10**9, "f_max": parseFloat(freq_max_field.value)*10**9, "n": parseInt(slider_resolution.value), "mirror": document.getElementById("mirror_checkbox").checked, "tan_delta":parseFloat(tan_delta_field.value)*10**-6})}
            catch{console.log("Daten konnten nicht gesendet werden")}
        }
        else{
            document.getElementById("alert_div").innerHTML = "specify a valid frequency range"
            update_boostplot([0,0],[0,0])
        }
    }
    send_settings_for_Efield(){
        // sende die Scheibeneinstellungen über den Channel "Efield" an den Server
        const disc_data = this.rects.map(element => ({"x": element.x/100, "width":element.width/100, dielect_const: element.dielect_const}));

        Genie.WebChannels.sendMessageTo('____', 'Efield', {"disc_data": disc_data, "mirror": document.getElementById("mirror_checkbox").checked, "tan_delta":parseFloat(tan_delta_field.value)*10**-6, "xmax":this.xmax})
    }

    update_scale(start=0, unit="cm", num=5){
        this.unit = unit;
        let step = find_stepvalue(start, this.xmax, num);
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
        if(focus_disc.length==0){
            var last_fdisc = ax.rects[ax.rects.length-1]

        }
        else{
            var last_fdisc = focus_disc[focus_disc.length-1];
        }

        const scale_length = this.xmax;
        var index1 = 0;
        var length1 = 0;
        var length2 = 0;

        while(index1<this.rects.length-1 && this.rects[index1]!=focus_disc[0]){
            length1 += this.rects[index1].width
            index1++
        }
        for(var i = index1 + focus_disc.length; i < this.rects.length; i++){
            length2 += this.rects[i].width;
        }

        var index2 = index1 + focus_disc.length - 1

        // korrigiere die focus_discs
        for(var i = 0; i<focus_disc.length-1; i++){
            if(focus_disc[i].x+focus_disc[i].width>focus_disc[i+1].x){
                focus_disc[i+1].x=focus_disc[i].x+focus_disc[i].width
            }
        }
        
        // sorge dafür, dass keine negativen Positionen möglich sind
        if (focus_disc.length!=0 && focus_disc[0].x<length1){
            const diff_x = length1-focus_disc[0].x
            focus_disc.reverse().forEach((element) => {
                element.x += diff_x
            })
            focus_disc.reverse()
        }
        // sorge dafür, dass keine zu großen Positionen möglich sind
        if(scale_length<last_fdisc.x+last_fdisc.width+length2){
            if(flexible_xmax){
                this.xmax = last_fdisc.x+last_fdisc.width+length2
            }
            else{
                const diff_x = scale_length-length2-last_fdisc.x-last_fdisc.width
                focus_disc.forEach((element) => {
                    element.x += diff_x
                })   
            }  
        }
        
        ax.update_scale()


        // Korrigiere die Discs links von den Focusdiscs
        while(index1>0 && this.rects[index1-1].x+this.rects[index1-1].width>this.rects[index1].x){
            this.rects[index1-1].x=this.rects[index1].x-this.rects[index1-1].width
            index1--
            }
        // Korrigiere die Discs rechts von den Focusdiscs
        while(index2+1<this.rects.length && this.rects[index2].x+this.rects[index2].width>this.rects[index2+1].x){
            this.rects[index2+1].x=this.rects[index2].x+this.rects[index2].width
            index2++
            }
        }

    load_setting_to_memory(){
        if(this.memory.length >= 10){
            this.memory.pop()
        }
        const mem_data = structuredClone({"data": this.rects,
            "freq":[freq_min_field.value, freq_max_field.value], 
            "tand": tan_delta_field.value, 
            "slider":slider_resolution.value, 
            "fdisc_indexlist":fdisc_indexlist,
            "graph_settings":[graph_pos_chkbx.checked, graph_dist_chkbx.checked],
            "boostplot_log_lin_scale":[boostplot_chkbx_1.checked, boostplot_chkbx_2.checked],
            "xmax":this.xmax});
        
        if(JSON.stringify(mem_data) !== JSON.stringify(this.memory[0])){
            this.memory.splice(0, this.memory_pos, mem_data)
            this.memory_pos = 0
        }
    }
}

function synch_graphtoinput(){
    // synchronisiert die Einstellungen der Scheiben im Graph mit den Inputfeldern
    if (focus_disc.length == 1){
        if(dis_pos_switch){
            position_field.value = focus_disc[0].x;    
        }
        else{
            if(fdisc_indexlist[0]==0){
                position_field.value = focus_disc[0].x;
            }
            else{
                position_field.value = Round(ax.rects[fdisc_indexlist[0]].x-ax.rects[fdisc_indexlist[0]-1].x-ax.rects[fdisc_indexlist[0]-1].width, 10);
            }
        }
        width_field.value = focus_disc[0].width;
        dielectric_field.value = focus_disc[0].dielect_const;
        counter_field.value = Object.keys(ax.rects).length;
    } 
    else if (focus_disc.length == 0){
        position_field.value = "";
        width_field.value = "";
        dielectric_field.value = "";
        counter_field.value = Object.keys(ax.rects).length;
    }
    else{
        position_field.value = "";
        width_field.value = "";
        dielectric_field.value = "";
        counter_field.value = Object.keys(ax.rects).length;

        if(dis_pos_switch){
            position_field.value = focus_disc[0].x;
        }
        else{
            var distances = [];
            for (var i = 1; i < focus_disc.length; i++){
                distances.push(Round(focus_disc[i].x-focus_disc[i-1].x-focus_disc[i-1].width, 6))
            }
            if(distances.every((element)=> element === distances[0])){
                position_field.value = distances[0];
            }
        }
        if(focus_disc.map((value) => value.width).every((element)=> element === focus_disc[0].width)){
            width_field.value = focus_disc[0].width;
        }
        if(focus_disc.map((value) => value.dielect_const).every((element)=> element === focus_disc[0].dielect_const)){
            dielectric_field.value = focus_disc[0].dielect_const;
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
    console.log("synch_inputtograph()")

    // Single Select
    if(focus_disc.length == 1){
        if(dis_pos_switch){
            focus_disc[0].x = parseFloat(position_field.value);
        }
        else{
            if(fdisc_indexlist[0]==0){
                focus_disc[0].x = parseFloat(position_field.value);
            }
            else{
                focus_disc[0].x = Round(parseFloat(position_field.value) + ax.rects[fdisc_indexlist[0]-1].x + ax.rects[fdisc_indexlist[0]-1].width, 10)
            }
        }
        focus_disc[0].width = parseFloat(width_field.value);

        // focus_disc[0].dielect_const = parseFloat(dielectric_field.value);
        ax.rects.map(element => element.dielect_const=parseFloat(dielectric_field.value))
    }
    // Multiselect
    else if(focus_disc.length > 1){
        console.log("dis_pos_switch: ", dis_pos_switch)
        if(dis_pos_switch){
            if (position_field.value!=""){
                var dx = parseFloat(position_field.value)-focus_disc[0].x
                console.log(parseFloat(position_field.value)-focus_disc[0].x)
                focus_disc.forEach(element => {
                    element.x += dx + 0
                })
            }
        }
        else{
            if(width_field.value!=""){
                focus_disc.forEach(element => {
                    element.width = parseFloat(width_field.value);
                })
            }
            if(position_field.value!=""){
                var curr_pos = focus_disc[0].x
                focus_disc.forEach((element) => {
                    element.x = curr_pos;
                    curr_pos += element.width + parseFloat(position_field.value);
                })
            }
        }
        ax.rects.map(element => element.dielect_const=parseFloat(dielectric_field.value)) 
    }
    ax.correct_overlap(true);
    ax.draw();
    ax.send_settings_to_backend();
}

function synch_fdisc_text(){
    if(fdisc_indexlist.length > 1){
        document.getElementById("scheibenauswahl").innerHTML = "discs " + String(fdisc_indexlist[0]+1) + " - " + String(fdisc_indexlist[fdisc_indexlist.length-1]+1 + " selected")
    }
    else if(fdisc_indexlist.length == 1){
        document.getElementById("scheibenauswahl").innerHTML = "disc " + String(fdisc_indexlist[0]+1 + " selected")
    }
    else{
        document.getElementById("scheibenauswahl").innerHTML = "no disc selected"
    }
}

function data_export(indices = [true, true, true]){
    var df = new dfd.DataFrame(ax.rects)
    var select_cols = df.columns.filter((value, n) => indices[n])

    df = df.loc({columns: select_cols})
    df.print()

    var csv = dfd.toCSV(df)
    
    csv = csv.replaceAll(",", ";")
    // Blob erstellen
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    // Download-Link erzeugen
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "daten.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Datenupload
import_button.addEventListener("change", function(f){
    reader_ = new FileReader();
    reader_.readAsText(f.target.files[0])

    reader_.addEventListener('load', () => {
        alert("Data is overwritten!")

        data = reader_.result.replaceAll("\r", "").split("\n")

        if (data[data.length-1] == ""){
            data.pop();
        }

        header = data[0].split(";")
        const no_rectx = !header.some((e) => e ==="x")
        data.shift();

        ax.clear_discs();
        for (var element of data){
            var default_rect = {"x": 0, "width": 0.1, "dielect_const": 24}
            if (no_rectx && ax.rects.length!=0){
                default_rect["x"] = ax.rects[ax.rects.length-1].x+ax.rects[ax.rects.length-1].width
            }
            for (var [i, e] of element.split(";").entries()){
                default_rect[header[i]] = Round(parseFloat(e), 10)
            }
            ax.rects.push(default_rect)
        }

        ax.draw();
        ax.send_settings_to_backend()

        focus_disc = [];
        fdisc_indexlist = [];
        synch_graphtoinput();
        ax.correct_overlap(true);
        ax.load_setting_to_memory();
    });
});
// EventListener
canvas.addEventListener("mousedown", () => {
    mouse_status_sim = true;
    for (const [index,rect] of Object.entries(ax.rects)) {
        // Rechteck verschieben
        // Prüfe ob Click in Rechteck liegt
        if (mouse_x > ax.cm_to_pixel(rect.x) && mouse_x < ax.cm_to_pixel(rect.x+rect.width) && mouse_y>0 && mouse_y<ax.rect_height){
            if (!(focus_disc.some(element => element==rect))){
                focus_disc = [rect]
                fdisc_indexlist = [index]
            }
            var dx = []
            var scale_factor = (mouse_y<ax.rect_height-fine_adjustment_size) ? 1 : 0.2
            for (const element of focus_disc){
                dx.push([mouse_x, element.x])
            }
            IntervallId = setInterval(() => {
                for (const [index, element] of Object.entries(focus_disc)){
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


        // // Rechteck skalieren (Feature vorerst herausgenommen)
        // // Prüfe ob Click am Rand des Rechtecks liegt
        // else if (mouse_x<=rect.x && mouse_x>=rect.x-3){
        //     focus_disc = [rect];
        //     var mausposition = mouse_x;
        //     IntervallId = setInterval(() => {
        //             if(ax.pixel_to_cm(rect.width)-mouse_x+mausposition>0){
        //                 rect.x = parseFloat(ax.pixel_to_cm(mouse_x).toFixed(3))
        //                 rect.width = parseFloat((ax.pixel_to_cm(ax.cm_to_pixel(rect.width)-mouse_x+mausposition)).toFixed(3))
        //                 mausposition = mouse_x;
        //                 ax.correct_overlap()
        //             }
        //             else{
        //                 rect.width = 0
        //             }
        //             synch_graphtoinput();
        //             ax.draw()
        //     }, 2)
        //     return;
        // }
        // else if (mouse_x>=ax.cm_to_pixel(rect.x+rect.width) && mouse_x<=ax.cm_to_pixel(rect.x+rect.width)+3){
        //     focus_disc = [rect];
        //     var mausposition = mouse_x;
        //     IntervallId = setInterval(() => {
        //         if(ax.cm_to_pixel(rect.width)+mouse_x-mausposition>0){
        //             rect.width = parseFloat((rect.width+ax.pixel_to_cm(mouse_x-mausposition)).toFixed(3))
        //             mausposition = mouse_x;
        //             ax.correct_overlap()
        //         }
        //         else{
        //             rect.width = 0
        //         }
        //         synch_graphtoinput();
        //         ax.draw()
        //     }, 2)
        //     return;
        // }
    }
    const origin = [mouse_x, mouse_y]
    Intervall_multiselect = setInterval(() => {
        ax.multiselect(origin, [mouse_x, mouse_y]);
    }, 2)
});

document.addEventListener("mouseup", () => {mouse_status_sim = false; try{clearInterval(IntervallId); /* lade die Einstellungen in den speicher wenn das Intervall existiert */ ax.load_setting_to_memory()} catch(error){}; try{clearInterval(Intervall_multiselect); ax.load_setting_to_memory();} catch(error){}; try{clearInterval(boostplot_intervall)}catch{}; ax.multiselect_arr = []; ax.draw(); canvas.style.cursor = "default";});
canvas.addEventListener("mousemove", event => {
    const canvas_coordinates = canvas.getBoundingClientRect();
    mouse_x = event.clientX - canvas_coordinates.left - ax.padd[3];
    mouse_y = canvas_coordinates.top - event.clientY + canvas.height - ax.padd[2];
    
    // // Änderung der Dicke (Mausänderung) (Feature vorerst herausgenommen)
    // for (const rect of ax.rects) {
    //     if ((mouse_x<ax.cm_to_pixel(rect.x) && mouse_x>=ax.cm_to_pixel(rect.x)-3)||(mouse_x>ax.cm_to_pixel(rect.x)+ax.cm_to_pixel(rect.width) && mouse_x<=ax.cm_to_pixel(rect.x+rect.width)+3)){
    //         setTimeout(() => {
    //             if ((mouse_x<ax.cm_to_pixel(rect.x) && mouse_x>=ax.cm_to_pixel(rect.x)-3)||(mouse_x>ax.cm_to_pixel(rect.x+rect.width) && mouse_x<=ax.cm_to_pixel(rect.x+rect.width)+3)){
    //                 canvas.style.cursor = "col-resize";
    //             }
    //         }, 4);
    //         break;
    //     }
    //     else{
    //         canvas.style.cursor = "default";
    //     }
    // };

    // Änderung der Dicke (Mausänderung) (Feature vorerst herausgenommen)
    for (const rect of ax.rects) {
        if (mouse_x>=ax.cm_to_pixel(rect.x) && mouse_x<=ax.cm_to_pixel(rect.x+rect.width) && mouse_y<=ax.rect_height && mouse_y>=ax.rect_height-fine_adjustment_size){
            canvas.style.cursor = "ew-resize";
            break;
        }
        else if(!mouse_status_sim){
            canvas.style.cursor = "default";
        }
    };
    document.getElementById("Terminal").innerHTML = "x = " + String(mouse_x) + "px <br> y = " + String(parseInt(mouse_y)) + "px";
});


// Zoom mit Scrollrad

canvas.addEventListener("wheel", (event) => { 
    if(event.shiftKey){
        const step = 1;
        const last_disc = ax.rects[ax.rects.length-1]

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
            if(fdisc_indexlist.length!=0, fdisc_indexlist[0]>0){
                focus_disc.unshift(ax.rects[fdisc_indexlist[0]-1])
                fdisc_indexlist.unshift(fdisc_indexlist[0]-1)
            }
        }
        else if(event.code==="ArrowRight"){
            if(fdisc_indexlist.length>1){
                focus_disc.shift()
                fdisc_indexlist.shift()
            }
        }
    }
    if (event.shiftKey && lr_status_frects==="ArrowRight"){
        if(event.code==="ArrowRight"){
            if(fdisc_indexlist.slice(-1)[0]<ax.rects.length-1){
                focus_disc.push(ax.rects[parseInt(fdisc_indexlist.slice(-1))+1])
                fdisc_indexlist.push(parseInt(fdisc_indexlist.slice(-1))+1)
            }
        }
        else if(event.code==="ArrowLeft"){
            if(fdisc_indexlist.length>1){
                focus_disc.pop()
                fdisc_indexlist.pop()
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

function load_from_memory(){
    // lade die Einstellungen aus memory
    ax.rects = ax.memory[ax.memory_pos]["data"]
    ax.xmax = ax.memory[ax.memory_pos]["xmax"]
    freq_min_field.value = ax.memory[ax.memory_pos]["freq"][0]
    freq_max_field.value = ax.memory[ax.memory_pos]["freq"][1]
    tan_delta_field.value = ax.memory[ax.memory_pos]["tand"]
    slider_resolution.value = ax.memory[ax.memory_pos]["slider"]
    fdisc_indexlist = ax.memory[ax.memory_pos]["fdisc_indexlist"]
    graph_pos_chkbx.checked = ax.memory[ax.memory_pos]["graph_settings"][0]
    graph_dist_chkbx.checked = ax.memory[ax.memory_pos]["graph_settings"][1]
    boostplot_chkbx_1.checked = ax.memory[ax.memory_pos]["boostplot_log_lin_scale"][0]
    boostplot_chkbx_2.checked = ax.memory[ax.memory_pos]["boostplot_log_lin_scale"][1]

    focus_disc = []
    fdisc_indexlist.forEach(element => focus_disc.push(ax.rects[element]))

    
    ax.draw();
    synch_graphtoinput();
    ax.update_scale()
    ax.send_settings_to_backend();
    update_log_lin_1();
    update_log_lin_2();
}

document.addEventListener("keydown", event => {
    if(event.ctrlKey){
        if (event.code == "KeyY" && ax.memory_pos < ax.memory.length-1){
            ax.memory_pos += 1
            // lade die Einstellungen aus memory
            load_from_memory();
        }
        if (event.code == "KeyZ" && ax.memory_pos > 0){
            ax.memory_pos -= 1
            // lade die Einstellungen aus memory
            load_from_memory();
        }
    }
})




ax = new Axes(canvas, [86,70,70,70]);
ax.update_scale();
focus_disc = [ax.add_disc(3, 0.1, 24)];
synch_graphtoinput();