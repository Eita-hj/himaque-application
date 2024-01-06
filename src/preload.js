window.addEventListener("load", async () => {
	globalThis.addonApp = true;
	document.getElementsByClassName("orenosakuhin")[0].innerHTML = ""
	fetch("https://eita.f5.si/hcq/addon/code.js", {
		cache: "no-store",
	})
		.then((n) => n.text())
		.then(eval);
});
