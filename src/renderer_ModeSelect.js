function send() {
	const obj = {};
	obj.addon = [...document.getElementsByName("addon")].find(n => n.checked).value == "true";
	obj.windowCount = document.getElementById("window").value
	if (["2", "3", "4"].includes(obj.windowCount)) obj.type = document.getElementById("windowtype").value
	window.electronAPI.start(obj)
}