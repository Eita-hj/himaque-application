function send() {
	const obj = {};
	obj.addon =
		[...document.getElementsByName("addon")].find((n) => n.checked).value ==
		"true";
	obj.windowCount = document.getElementById("window").value;

	if (["2", "3", "4"].includes(obj.windowCount))
		obj.type = document.getElementById("windowtype").value;
	obj.mode = [...document.getElementsByName("mode")].find(
		(n) => n.checked
	).value;
	obj.addonModules = {
		multilinechat: document.getElementById("multilinechataddon").checked,
		chatmaxup: document.getElementById("chatmaxupaddon").checked,
		displaystatus: document.getElementById("displaystatusaddon").checked,
		morepresets: document.getElementById("morepresetsaddon").checked,
	};
	window.electronAPI.start(obj);
}

function ready() {
	const n = window.electronAPI.ready();
	document.getElementById("window").value = n.windowCount;
	WindowChange(n.windowCount);
	[...document.getElementsByName("addon")].find(
		(m) => m.value == `${n.addon}`
	).checked = true;
	if (["2", "3", "4"].includes(n.windowCount))
		document.getElementById("windowtype").value = n.type;
	document.getElementById("addonType").style.display = n.addon ? "" : "none";
	document.getElementById("multilinechataddon").checked =
		!!n.addonModules?.multilinechat;
	document.getElementById("chatmaxupaddon").checked =
		!!n.addonModules?.chatmaxup;
	document.getElementById("displaystatusaddon").checked =
		!!n.addonModules?.displaystatus;
	document.getElementById("morepresetsaddon").checked =
		!!n.addonModules?.morepresets;
	if (n.mode == "window")
		document.getElementById("windowcount").style.display = "";
	(
		[...document.getElementsByName("mode")].find(
			(m) => m.value == n.mode
		) || document.getElementsByName("mode")[0]
	).checked = true;
}