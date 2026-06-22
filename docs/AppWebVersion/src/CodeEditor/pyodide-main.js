const pyodide = await loadPyodide();

// load Packages
await pyodide.loadPackage(["numpy"]);

document.getElementById("run").addEventListener("click", async (event) => {
    if(window.editor == null) return;

    await pyodide.runPythonAsync(window.editor.getValue());
})
