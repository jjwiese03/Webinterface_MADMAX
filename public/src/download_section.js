
function data_export(indices = [true, true, true]){
    var df = new dfd.DataFrame(ax.discs)
    var select_cols = df.columns.filter((value, n) => indices[n])

    df = df.loc({columns: select_cols})

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
            if (no_rectx && ax.discs.length!=0){
                default_rect["x"] = ax.discs[ax.discs.length-1].x+ax.discs[ax.discs.length-1].width
            }
            for (var [i, e] of element.split(";").entries()){
                default_rect[header[i]] = Round(parseFloat(e), 10)
            }
            ax.discs.push(default_rect)
        }
        ax.correct_overlap(true);
        focus_disc = [];
        fdisc_indexlist = [];

        ax.draw();
        ax.send_settings_to_backend()
        synch_graphtoinput();
        ax.load_setting_to_memory();
    });
});


function load_example(){
    ax.clear_discs();
    ax.discs = [{ x: 0.71, width: 0.1, dielect_const: 24 },
        { x: 1.52, width: 0.1, dielect_const: 24 },
        { x: 2.33, width: 0.1, dielect_const: 24 },
        { x: 3.14, width: 0.1, dielect_const: 24 },
        { x: 3.95, width: 0.1, dielect_const: 24 },
        { x: 4.76, width: 0.1, dielect_const: 24 },
        { x: 5.57, width: 0.1, dielect_const: 24 }
    ]
    ax.draw();

    focus_disc = [];
    fdisc_indexlist = [];
    synch_graphtoinput();
    ax.correct_overlap(true);
    ax.send_settings_to_backend()
    ax.load_setting_to_memory();
}