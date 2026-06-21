const pyodide = await loadPyodide();

// load Packages
await pyodide.loadPackage(["numpy"]);

document.getElementById("run").addEventListener("click", (event) => {
    if(window.editor == null) return;

    pyodide.runPython(window.editor.getValue());
})
