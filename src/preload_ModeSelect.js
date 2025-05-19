const { contextBridge, ipcRenderer } = require("electron/renderer");

ipcRenderer.on("test", console.log)

contextBridge.exposeInMainWorld("electronAPI", {
	start: (obj) => ipcRenderer.send("start", obj),
	ready: () => ipcRenderer.sendSync("ready"),
});
