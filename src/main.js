const {
	app,
	BrowserWindow,
	ipcMain,
	Menu,
	dialog,
	session,
} = require("electron");
const path = require("path");
let c1 = 0,
	c2 = 0;

let isMainWindow = false;

const Store = require("electron-store").default;
const store = new Store();

//const { autoUpdater } = require("electron-updater");
const state = {
	use: {
		exitField: false,
		partyReady: false,
	},
	links: {
		exitField: [],
		partyReady: [],
	}
}

const beforeSetting = store.get("setting") || {
	windowCount: 1,
	addon: false,
	more_setting: "a",
	addonModules: {
		multilinechat: false,
		chatmaxup: false,
		displaystatus: false,
	},
	type: "a",
	mode: "tab",
};

app.setAboutPanelOptions({
	applicationName: "ヒマクエ専用ブラウザ Meteor",
	applicationVersion: require("../package.json").version,
	copyright: "©︎マグナム中野 (HIMACHATQUEST) 凶兆の黒猫(addon)",
	authors: "マグナム中野、凶兆の黒猫",
	website: "https://addon.pjeita.top/",
});

const fetch = require("node-fetch");
let versionChecked = false;

app.once("ready", () => {
	ipcMain.on("ready", (e) => {
		return (e.returnValue = beforeSetting);
	});
	const { existsSync, readdirSync, unlink } = require("fs");
	const p = {
		win32: `${process.env.TEMP}/meteor`,
		darwin: `/tmp/meteor`,
		linux: `/tmp/meteor`,
	}[process.platform];
	if (existsSync(p)) {
		const files = readdirSync(p)
			.filter((n) => n.startsWith("update_"))
			.map((n) => `${p}/${n}`);
		files.map((n) => unlink(n, () => {}));
	}
});

let mainWindow = null;
let nowWindow = {};

let port = 20000;
const tempServer = require("express")();
let s = {};
tempServer.use((req, res, next) => {
	if (req.headers["user-agent"].includes("Electron")) next();
});
tempServer.use(require("cors")());
tempServer.use(require("express").json());

tempServer.get("/start", (req, res) => {
	res.json({
		port,
		windowCount: Number(beforeSetting.windowCount),
		type: beforeSetting.type,
	});
	s.close();
});
let server = {};
const createServer_and_start = async () => {
	const s = require("express")();
	s.use((req, res, next) => {
		if (req.headers["user-agent"].includes("Electron")) next();
	});
	s.use(require("cors")());
	s.use(require("express").json());

	const events = {};
	s.get("/events", (req, res) => {
		res.json(events);
		events.add = false;
		events.close = [];
		events.change = false;
		events.change2 = false;
		events.reload = [];
		return;
	});
	ipcMain.on("tabAdd", () => {
		if (beforeSetting.mode == "window") return;
		events.add = true;
	})
	ipcMain.on("tabClose", (e, d) => {
		if (beforeSetting.mode == "window") return;
		const { url } = d;
		events.close.push(url);
	})
	ipcMain.on("tabChange", (e, d) => {
		if (beforeSetting.mode == "window") return;
		events[d.reverse ? "change2" : "change"] = true;
	})
	ipcMain.on("tabReload", (e, d) => {
		if (beforeSetting.mode == "window") return;
		const { url } = d;
		events.reload.push(url);
	})
	ipcMain.handle("state", (e, d) => {
		const { url } = d;
		const returnValue = {}
		if (state.use.exitField) {
			if (!state.links.exitField.includes(url)) {
				state.links.exitField.push(url);
				returnValue.exitField = true;
			}
		}
		if (state.use.partyReady) {
			if (!state.links.partyReady.includes(url)) {
				state.links.partyReady.push(url);
				returnValue.partyReady = true;
			};
		}
		return returnValue;
	})
	s.on("error", (err) => {
		if (err.code === "EADDRINUSE") {
			port++;
			createServer_and_start(server);
		}
	});
	s.listen(port, () => {
		server = s;
	});
};
createServer_and_start(server);

app.on("ready", start);
function start() {
	mainWindow = null;
	c2 = 0;
	const modeSelectWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			devTools: false,
			preload: path.join(__dirname, "preload_ModeSelect.js"),
		},
	});
	nowWindow = modeSelectWindow;

	app.once("activate", () => {
		if (!BrowserWindow.getAllWindows().length) createWindow();
	});
	modeSelectWindow.loadFile(path.join(__dirname, "ModeSelect.html"));
	modeSelectWindow.once("ready-to-show", () => {
		if (!versionChecked) {
			fetch("https://api.pjeita.top/update", {
				method: "post",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					version: require("../package.json").version,
					platform: process.platform,
					application: "Meteor",
				}),
			})
				.then((n) => n.json())
				.then((n) => {
					versionChecked = true;
					if (n.url) {
						dialog
							.showMessageBox({
								buttons: ["ダウンロード"],
								message: `新しいバージョン(ver.${n.version}) が公開されています。\n更新をしてください。\n(ダウンロードは少し時間がかかります)`,
							})
							.then((m) => {
								nowWindow.webContents.session.on(
									"will-download",
									(e, i, c) => {
										i.setSavePath(
											{
												win32: `${process.env.TEMP}\\meteor\\update_ver.${n.version}.exe`,
												darwin: `/tmp/meteor/update_ver.${n.version}.dmg`,
												linux: `/tmp/meteor/update_ver.${n.version}.AppImage`,
											}[process.platform]
										);
										i.on("done", async () => {
											require("child_process").execSync(
												{
													win32: `${process.env.TEMP}\\meteor\\update_ver.${n.version}.exe`,
													darwin: `open /tmp/meteor/update_ver.${n.version}.dmg`,
													linux: "",
												}[process.platform]
											);
											if (process.platform == "linux")
												await dialog
													.showMessageBox(nowWindow, {
														buttons: ["OK"],
														message:
															"ダウンロードをしました。新しいバージョンのファイルを開いて起動してください。",
													})
													.then(() => {
														const {
															shell,
														} = require("electron");
														shell.showItemInFolder(
															`/tmp/meteor/update_ver.${n.version}.AppImage`
														);
													});
											nowWindow.close();
										});
									}
								);
								nowWindow.webContents.session.downloadURL(
									n.url
								);
							});
					} else {
						modeSelectWindow.show();
					}
				})
				.catch(() => {
					versionChecked = true;
					dialog.showErrorBox(
						"更新確認エラー",
						"更新確認サーバーとの接続に失敗しました。"
					);
					modeSelectWindow.show();
				});
		} else {
			modeSelectWindow.show();
		}
	});
	modeSelectWindow.once("close", () => {
		if (c1) return;
		if (process.platform === "darwin") return;
		app.exit();
	});
	modeSelectWindow.webContents.on("did-create-window", (w, e) => {
		w.setMenuBarVisibility(false);
	});
	modeSelectWindow.setMenuBarVisibility(false);
	ipcMain.once("start", (e, obj) => {
		c1 = 1;
		modeSelectWindow.close();

		mainWindow = new BrowserWindow({
			width: 960,
			height: 720,
			show: false,
			webPreferences: {
				devTools: false,
				preload: path.join(
					__dirname,
					obj.addon ? "preload.js" : "preload_noaddon.js"
				),
				contextIsolation: false,
				nodeIntegration: false,
				nodeIntegrationInSubFrames: true,
				allowRunningInsecureContent: true,
				webSecurity: false,
			},
		});
		nowWindow = mainWindow;
		
		beforeSetting.windowCount = obj.windowCount;
		beforeSetting.addon = obj.addon;
		beforeSetting.type = obj?.type || "a";
		beforeSetting.addonModules = obj.addonModules
		beforeSetting.mode = obj.mode;

		s = tempServer.listen(
			16762,
			() => mainWindow.loadFile(path.join(__dirname, `${obj.mode}.html`))
		);
		mainWindow.once("ready-to-show", () => {
			mainWindow.show();
			isMainWindow = true;
		});
		mainWindow.on("close", () => {
			isMainWindow = false;
			if (c2) return;
			if (process.platform === "darwin") return;
			app.exit();
		});
		mainWindow.webContents.once("did-create-window", (w, e) => {
			w.setMenuBarVisibility(false);
		});
	});
}

ipcMain.on("startgame", (e) => {
	return e.returnValue = {
		port,
		addonModules: Number(beforeSetting.addonModules),
		type: beforeSetting.type,
	}
})

app.on("quit", () => {
	store.set("setting", beforeSetting);
});

const templateMenu = [
	...(process.platform == "darwin"
		? [
				{
					label: "Meteor",
					submenu: [{ label: "このアプリについて", role: "about" }],
				},
		  ]
		: []),
	{
		label: "編集",
		submenu: [
			{ label: "元に戻す", role: "undo" },
			{ label: "やり直し", role: "redo" },
			{ type: "separator" },
			{ label: "切り取り", role: "cut" },
			{ label: "コピー", role: "copy" },
			{ label: "ペースト", role: "paste" },
		],
	},
	{
		label: "選択",
		submenu: [{ label: "すべて選択", role: "selectAll" }],
	},
	{
		label: "表示",
		submenu: [
			{ label: "再読み込み", role: "reload" },
			{ type: "separator" },
			{ role: "togglefullscreen", label: "全画面表示" },
			{ type: "separator" },
			{ role: "quit", label: "終了" },
		],
	},
	{
		label: "設定",
		submenu: [
			{
				label: "窓数・アドオン有無の切り替え",
				click(item, focusedWindow) {
					if (!isMainWindow) return;
					if (focusedWindow) {
						c2 = 1;
						focusedWindow.close();
						start();
					}
				},
			},
		],
	},
	{
		label: "一括操作",
		submenu: [
			{
				label: "一斉準備完了",
				click(item, focusedWindow) {
					if (!isMainWindow) return;
					if (focusedWindow) {
						state.use.partyReady = true;
						state.links.partyReady.length = 0;
						setTimeout(() => {
							state.use.partyReady = false
							state.links.partyReady.length = 0;
						}, 1500)
					}
				},
			},
			{
				label: "一斉帰宅",
				click(item, focusedWindow) {
					if (!isMainWindow) return;
					if (focusedWindow) {
						state.use.exitField = true;
						state.links.exitField.length = 0;
						setTimeout(() => {
							state.use.exitField = false
							state.links.exitField.length = 0;
						}, 1500)
					}
				},
			},
		],
	},
];

const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);
