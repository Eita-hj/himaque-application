window.addEventListener("DOMContentLoaded", async () => {
	if (!new URL(location.href).origin.includes("himaquest.com")) return;

	document.body.style.display = "none";
	let _tmp = {};
	_tmp = setTimeout(() => location.reload(), 1500);
	window.onbeforeunload = () => {};
	window.PreLoad = async () => {
		clearTimeout(_tmp);
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
		const autologin = Number(GetCookie("autologin") || 0);
		if (autologin) LoginGameCookie();
		otoflg = Number(GetCookie("otoflg") || 1);
		bgmflg = Number(GetCookie("bgmflg") || 1);
		effectflg = Number(GetCookie("effectflg") || 0);
		masumeflg = Number(GetCookie("masumeflg") || 0);
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
		if (location.href != "https://himaquest.com/") OnseiOFF();

		myremove(".imobile_bottomfix");
		myremove(".ad_side");

		this.AdBanner = this.AdRectangle = () => {
			return "";
		};

		this.GamenSizeAuto = () => {
			userAgent = navigator.userAgent.toLowerCase();
			GamenSize(innerWidth >= 700 ? (innerHeight < 540 ? 2 : 3) : 1);
		};

		this.GamenSize = (size) => {
			document.getElementById("cccgamensize").href = [
				"",
				"ccchp600.css",
				"ccchp700.css",
			][size - 1];
			document.body.style["maxWidth"] = ["840px", "1140px", "1000px"];
			document.getElementById("layerroot").style.width =
				size == 3 ? "100%" : "90%";
			document.getElementById("layerroot").style.left =
				size == 3 ? "0px" : "50%";
			document.getElementById("layerroot").style.transform =
				size == 3 ? "" : "translate(-50%)";
		};

		GamenSizeAuto();
		document.body.style.display = "";

		this.addonModules = {
			multilinechat: false,
			chatmaxup: false,
			displaystatus: false,
		};

		const useModules = {};
		location.hash
			.slice(1)
			.split("&")
			.map(
				(n) => (useModules[n.split("=")[0]] = n.split("=")[1] == "true")
			);

		if (useModules.multilinechat)
			await fetch("https://addon.pjeita.top/module/multilinechat.js", {
				cache: "no-store",
			})
				.then((n) => n.text())
				.then(eval);

		await fetch("https://addon.pjeita.top/module/main.js", {
			cache: "no-store",
		})
			.then((n) => n.text())
			.then(eval);

		if (useModules.chatmaxup)
			await fetch("https://addon.pjeita.top/module/chatmaxup.js", {
				cache: "no-store",
			})
				.then((n) => n.text())
				.then(eval);
		if (useModules.displaystatus)
			await fetch("https://addon.pjeita.top/module/displaystatus.js", {
				cache: "no-store",
			})
				.then((n) => n.text())
				.then(eval);
	};
	this.LoginGame = () => {
		$("#logingame_alerttext").empty();
		const fid = $("#loginformid").val();
		if (CheckPassStr(fid))
			return $("#logingame_alerttext").text(
				"IDにa-z,A-Z,0-9以外は使えません"
			);
		const fpass = $("#loginformpass").val();
		if (CheckPassStr(fpass))
			return $("#logingame_alerttext").text(
				"パスワードにa-z,A-Z,0-9以外は使えません"
			);
		const autologin = $("#loginhozi").prop("checked");

		if (wait_LoginGame) return;
		wait_LoginGame = true;
		$.ajax({
			type: "POST",
			url: "top_LoginGame2.php",
			data: {
				fid,
				fpass,
				cid: "",
				csession: "",
				hkey,
				display: "block",
				visibility: "visible",
				opacity: 1,
				p1: 0,
				p2: 60,
				h: $("#topad").html(),
			},
			success: function (response) {
				wait_LoginGame = false;
				if (response.error == 404) return Error404();
				if (response.error == 2)	
					return olert(response.str);
				if (response.error != 1) return alert("サーバエラー0628");
				LoginGameNakami(response);
				CookieSet("autologin", autologin ? 1 : 0);
				CookieSet("cid", fid || 0);
				CookieSet("csession", SKEY || 0);
				cnf_ougi = Number(response.cnf_ougi);
				cnf_act = Number(response.cnf_act);
			},
			error: function () {
				wait_LoginGame = false;
				alert("なにかしらの不具合034");
			},
		});
	};
	this.LoginGameCookie = () => {
		$("#loginhozi").prop("checked", true);
		const cid = CookieGet("cid");
		const csession = CookieGet("csession");
		if (cid == null || cid == 0 || csession == null || csession == 0)
			return;
		if (wait_LoginGame) return;
		wait_LoginGame = true;
		$.ajax({
			type: "POST",
			url: "top_LoginGame2.php",
			data: {
				fid: "",
				fpass: "",
				cid,
				csession,
				hkey,
				display: "block",
				visibility: "visible",
				opacity: 1,
				p1: 0,
				p2: 60,
				h: $("#topad").html(),
			},
			success: function (response) {
				wait_LoginGame = false;
				$("#logingame_alerttext").html("");
				if (response.error == 404) return Error404();
				if (response.error == 30) {
					AutoLoginKaizyo();
					return $("#loginformid").val(cid);
				}
				if (response.error == 2)	
					return olert(response.str);
				if (response.error != 1) {
					alert("自動ログインに失敗しました");
					return AutoLoginKaizyo();
				}
				LoginGameNakami(response);
				CookieSet("autologin", 1);
				CookieSet("cid", cid);
				CookieSet("csession", response);
				cnf_ougi = Number(response.cnf_ougi);
				cnf_act = Number(response.cnf_act);
			},
			error: function () {
				wait_LoginGame = false;
				alert("なにかしらの不具合00584");
			},
		});
	};

	document.addEventListener("click", (e) => {
		const { target } = e;
		if (target.tagName == "A") {
			if (target.getAttribute("href").startsWith("http")) {
				window.open(target.href, "_blank");
				return e.preventDefault();
			}
		}
	});
});
