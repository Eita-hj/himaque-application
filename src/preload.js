window.addEventListener("load", async () => {
	globalThis.addonApp = true;
	[...document.getElementsByClassName("orenosakuhin")[0].parentNode.getElementsByTagName("div")].filter(n => n.parentNode.id == "page_login").at(-1).innerHTML = "";
	[...document.getElementsByClassName("orenosakuhin")[0].parentNode.getElementsByTagName("div")].filter(n => n.parentNode.id == "page_login").at(-2).innerHTML = "";
	[...document.getElementsByClassName("orenosakuhin")[0].parentNode.getElementsByTagName("div")].filter(n => n.parentNode.id == "page_login").at(-3).innerHTML = "";
	if (window?.parent) {
		if (location.href != "https://himaquest.com/") OnseiOFF();
	};
	document.addEventListener("click", (e) => {
		const {target} = e;
		if (target.tagName == "A") {
			if (target.getAttribute("href").startsWith("http")) {
				window.open(target.getAttribute("href"), "_blank");
				return e.preventDefault()
			};
		};
	});
	window.onbeforeunload = () => {}
	fetch("https://eita.f5.si/hcq/addon/code.js", {
		cache: "no-store",
	})
		.then((n) => n.text())
		.then(eval);
});