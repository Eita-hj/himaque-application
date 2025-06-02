const addonList = []
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
	obj.addonModules = {};
	addonList.forEach((n) => {
		obj.addonModules[n] = document.getElementById(`addon_${n}`).checked;
	});
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

	n.addonData.forEach(d => {
		document.getElementById("addonType").innerHTML +=
			`<p>
				<label>
					<input type="checkbox" id="addon_${d.id}" ${
						n.addonModules[d.id] || d.id == "main" ? "checked" : ""
					} ${d.id == "main" ? "disabled" : ""} />
					${d.name}
				</label>
			</p>`;
		addonList.push(d.id);
	})
	if (n.mode == "window")
		document.getElementById("windowcount").style.display = "";
	(
		[...document.getElementsByName("mode")].find(
			(m) => m.value == n.mode
		) || document.getElementsByName("mode")[0]
	).checked = true;
}