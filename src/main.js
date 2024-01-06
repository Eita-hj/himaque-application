const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
let c = 0;

app.on("ready", () => {
	const modeSelectWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload_ModeSelect.js")
		},
	});
	app.on("activate", () => {
		if (!BrowserWindow.getAllWindows().length) createWindow();
	});
	modeSelectWindow.loadFile( path.join(__dirname, "ModeSelect.html"))
	modeSelectWindow.once("ready-to-show", () => {
		modeSelectWindow.show();
	});
	modeSelectWindow.on("close", () => {
		if (process.platform === "darwin") return;
		if (!c) app.exit();
	});
	modeSelectWindow.webContents.on("did-create-window", (w, e) => {
		w.setMenuBarVisibility(false)
	});
	modeSelectWindow.setMenuBarVisibility(false);
	ipcMain.on('start', (e, obj) => {
		c = 1;
		modeSelectWindow.close();
		const mainWindow = new BrowserWindow({
			width: 800,
			height: 600,
			show: false,
			webPreferences:  {
				preload: path.join(__dirname, obj.addon ? "preload.js" : "preload_noaddon.js"),
				contextIsolation: false,
				nodeIntegrationInSubFrames: true
			}
		});
		const url = obj.windowCount == 1 
			? "https://himaquest.com/"
			: obj?.type == "a"
				? `http://sub.eita.f5.si/HIMAQUESTx${obj.windowCount}`
				: `http://sub.eita.f5.si/HIMACHATQUESTx${obj.windowCount}`
		mainWindow.loadURL(url);
		mainWindow.once("ready-to-show", () => {
			mainWindow.show();
		});
		mainWindow.on("close", () => {
			if (process.platform === "darwin") return;
			app.exit();
		});
		mainWindow.webContents.on("did-create-window", (w, e) => {
			w.setMenuBarVisibility(false)
		});
		modeSelectWindow.setMenuBarVisibility(false);
	})
});