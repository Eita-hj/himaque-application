function send() {
	const obj = {};
	obj.addon = [...document.getElementsByName("addon")].find(n => n.checked).value == "true";
	obj.windowCount = document.getElementById("window").value;
	if (["2", "3", "4"].includes(obj.windowCount)) obj.type = document.getElementById("windowtype").value;
	window.electronAPI.start(obj);
};

function ready() {
	const n = window.electronAPI.ready()
	document.getElementById("window").value = n.windowCount;
	WindowChange(n.windowCount);
	[...document.getElementsByName("addon")].find(m => m.value == `${n.addon}`).checked = true;
	if (["2", "3", "4"].includes(n.windowCount)) document.getElementById("windowtype").value = n.type;
};