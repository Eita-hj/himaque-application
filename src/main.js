const { app, BrowserWindow, ipcMain, Menu, dialog } = require("electron");
const path = require("path");
let c1 = 0,
	c2 = 0;

let isMainWindow = false;
const beforeSetting = {
	windowCount: 1,
	addon: false,
	more_setting: "a",
};

app.setAboutPanelOptions({
	applicationName: "ヒマクエ専用ブラウザ Meteor",
	applicationVersion: require("../package.json").version,
	copyright: "©︎マグナム中野 (HIMACHATQUEST) えいた(addon)",
	authors: "マグナム中野、えいた",
	website: "https://eita.f5.si/hcq/",
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

app.once("ready", start);
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
			fetch("https://api.eita.f5.si/update", {
				method: "post",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					version: require("../package.json").version,
					platform: process.platform,
                    application: "Meteor"
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
												win32: `${process.env.TEMP}/meteor/update_ver.${n.version}.exe`,
												darwin: `/tmp/meteor/update_ver.${n.version}.dmg`,
												linux: `/tmp/meteor/update_ver.${n.version}.AppImage`,
											}[process.platform]
										);
										i.on("done", async () => {
											require("child_process").execSync(
												{
													win32: `${process.env.TEMP}/meteor/update_ver.${n.version}.exe`,
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
				nodeIntegrationInSubFrames: true,
				allowRunningInsecureContent: true,
			},
		});
		nowWindow = mainWindow;
		beforeSetting.windowCount = obj.windowCount;
		beforeSetting.addon = obj.addon;
		beforeSetting.type = obj?.type || "a";
		const url =
			obj.windowCount == 1
				? "https://himaquest.com/"
				: obj?.type == "a"
				? `http://sub.eita.f5.si/HIMAQUESTx${obj.windowCount}`
				: `http://sub.eita.f5.si/HIMACHATQUESTx${obj.windowCount}`;
		mainWindow.loadURL(url);
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
];

const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);