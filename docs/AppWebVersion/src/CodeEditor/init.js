require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor/min/vs' } });
require(['vs/editor/editor.main'], () => {
    monaco.editor.create(document.getElementById('editor'), {
        value: 'def test():',
        language: 'python',
        theme: 'vs',
        minimap: { enabled: false },      // keine Minimap rechts   
        overviewRulerLanes: 0,            // keine Scrollbar Indikation
        lineNumbers: 'on',               // keine Zeilennummern
        folding: true,                   // kein Code-Folding
        lineDecorationsWidth: 5,          // kein linker Rand
        lineNumbersMinChars: 2,
        scrollBeyondLastLine: false,
        fontSize: 12,
    });
});