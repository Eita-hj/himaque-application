const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
let c1 = 0, c2 = 0;

app.once("ready", start)
function start() {
	c2 = 0;
	const modeSelectWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload_ModeSelect.js")
		},
	});
	app.once("activate", () => {
		if (!BrowserWindow.getAllWindows().length) createWindow();
	});
	modeSelectWindow.loadFile( path.join(__dirname, "ModeSelect.html"))
	modeSelectWindow.once("ready-to-show", () => {
		modeSelectWindow.show();
	});
	modeSelectWindow.once("close", () => {
		if (c1) return;
		if (process.platform === "darwin") return;
		app.exit();
	});
	modeSelectWindow.webContents.on("did-create-window", (w, e) => {
		w.setMenuBarVisibility(false)
	});
	modeSelectWindow.setMenuBarVisibility(false);
	ipcMain.once('start', (e, obj) => {
		c1 = 1;
		modeSelectWindow.close();
		const mainWindow = new BrowserWindow({
			width: 960,
			height: 720,
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
			if (c2) return;
			if (process.platform === "darwin") return;
			app.exit();
		});
		mainWindow.webContents.once("did-create-window", (w, e) => {
			w.setMenuBarVisibility(false)
		});
	})
};

const templateMenu = [
	{
		label: '表示',
		submenu: [
			{
				label: '再読み込み',
				role: 'reload',
				click(item, focusedWindow){
					if(focusedWindow) focusedWindow.reload()
				},
			},
			{
				type: 'separator',
			},
			{
				role: 'togglefullscreen',
				label: '全画面表示'
			}
		]
	},
	{
		label: '設定',
		submenu: [
			{
				label: '窓数・アドオン有無の切り替え',
				click(item, focusedWindow){
					if (focusedWindow) {
						c2 = 1;
						focusedWindow.close();
						start();
					};
				},
			}
		]
	}
];

const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);