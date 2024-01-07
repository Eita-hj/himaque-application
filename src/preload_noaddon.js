window.addEventListener("load", async () => {
	[...document.getElementsByClassName("orenosakuhin")[0].parentNode.getElementsByTagName("div")].filter(n => n.parentNode.id == "page_login").at(-1).innerHTML = "";
	[...document.getElementsByClassName("orenosakuhin")[0].parentNode.getElementsByTagName("div")].filter(n => n.parentNode.id == "page_login").at(-2).innerHTML = "";
	[...document.getElementsByClassName("orenosakuhin")[0].parentNode.getElementsByTagName("div")].filter(n => n.parentNode.id == "page_login").at(-3).innerHTML = "";
	window.onbeforeunload = () => {}
	document.addEventListener("click", (e) => {
		const {target} = e;
		if (target.tagName == "A") {
			if (target.getAttribute("href").startsWith("http")) {
				window.open(target.getAttribute("href"), "_blank");
				return e.preventDefault()
			}
		}
	})
});
