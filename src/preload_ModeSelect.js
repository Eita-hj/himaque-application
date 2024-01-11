const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
	start: (obj) => ipcRenderer.send("start", obj),
	ready: () => ipcRenderer.sendSync("ready")
})