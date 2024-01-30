window.addEventListener("DOMContentLoaded", async () => {
	window.onbeforeunload = () => {};
	window.PreLoad = () => {
		globalThis.addonApp = true;
		[
			...document
				.getElementsByClassName("orenosakuhin")[0]
				.parentNode.getElementsByTagName("div"),
		]
			.filter((n) => n.parentNode.id == "page_login")
			.at(-1).innerHTML = "";
		[
			...document
				.getElementsByClassName("orenosakuhin")[0]
				.parentNode.getElementsByTagName("div"),
		]
			.filter((n) => n.parentNode.id == "page_login")
			.at(-2).innerHTML = "";
		[
			...document
				.getElementsByClassName("orenosakuhin")[0]
				.parentNode.getElementsByTagName("div"),
		]
			.filter((n) => n.parentNode.id == "page_login")
			.at(-3).innerHTML = "";
		const autologin = Number(GetCookie("autologin")) || 0;
		if (autologin) LoginGameCookie();
		otoflg = bgmflg = Number(GetCookie("otoflg")) || 1;
		effectflg = Number(GetCookie("effectflg")) || 0;
		masumeflg = Number(GetCookie("masumeflg")) || 0;
		MasumeSet();
		ecoflg = Number(GetCookie("ecoflg")) || 0;
		if (window.HTMLAudioElement) {
			const audio = document.createElement("audio");
			if (audio.canPlayType("audio/mp3")) can_mp3 = 1;
			if (audio.canPlayType("audio/ogg")) can_ogg = 1;
			if (can_mp3 || can_ogg) {
				audioflg = 1;
			} else {
				otoflg = bgmflg = audioflg = 0;
			}
		} else {
			otoflg = bgmflg = audioflg = 0;
		}
		if (!otoflg && !bgmflg) {
			document.getElementById("oto_nasi").style["background-color"] =
				"#FFFF00";
			document.getElementById("oto_ari").style["background-color"] = "";
		}
		if (window?.parent) {
			if (location.href != "https://himaquest.com/") OnseiOFF();
		}
        myremove(".imobile_bottomfix");
		fetch("https://addon.eita.f5.si/hcq/addon/code.js", {
			cache: "no-store",
		})
			.then((n) => n.text())
			.then(eval);
	};
	document.addEventListener("click", (e) => {
		const { target } = e;
		if (target.tagName == "A") {
			if (target.getAttribute("href").startsWith("http")) {
				window.open(target.getAttribute("href"), "_blank");
				return e.preventDefault();
			}
		}
	});
});
