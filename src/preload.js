window.addEventListener("DOMContentLoaded", async () => {
	const { ipcRenderer } = require("electron");
	const hcqLinks = [
		{
			url: "https://himaquest.com",
			used: false,
			id: 0,
		},
		{
			url: "http://himaquest.com.",
			used: false,
			id: 1,
		},
		{
			url: "http://www.himaquest.com",
			used: false,
			id: 2,
		},
		{
			url: "http://www.himaquest.com.",
			used: false,
			id: 3,
		},
		{
			url: "http://sub1.himaquest.com",
			used: false,
			id: 4,
		},
		{
			url: "http://sub1.himaquest.com.",
			used: false,
			id: 5,
		},
		{
			url: "http://sub2.himaquest.com",
			used: false,
			id: 6,
		},
		{
			url: "http://sub2.himaquest.com.",
			used: false,
			id: 7,
		},
		{
			url: "http://sub3.himaquest.com",
			used: false,
			id: 8,
		},
		{
			url: "http://sub3.himaquest.com.",
			used: false,
			id: 9,
		},
	];
	if (window.self === window.top) {
		const d = ipcRenderer.sendSync("startgame");
		if (d.mode == "tab") {
			const $ = window.jQuery;
			const f = {};

			f.tabClose = (e) => {
				const t = $(e.target).closest(".tab");
				if (t.hasClass("active")) {
					const next = t.next(".tab").length
						? t.next(".tab")
						: t.prev(".tab");
					if (next.length) {
						f.tabChange({ target: next });
					}
				}
				const id = Number(t.attr("name"));
				hcqLinks.find((n) => n.id == id).used = false;
				$(e.target).closest(".tab").remove();
				$(`iframe[name="${id}"]`).remove();
				if (!hcqLinks.find((n) => n.used)) f.tabAdd();
			};
			f.tabChange = (e) => {
				const id = Number($(e.target).closest(".tab").attr("name"));
				$(".tab").removeClass("active");
				$(e.target).closest(".tab").addClass("active");
				$("iframe").hide();
				$(`iframe[name="${id}"]`).show();
				document.title = `表示中のタブ：タブ${id + 1}`;
			};
			f.tabAdd = () => {
				const d = hcqLinks.find((n) => !n.used);
				if (!d) {
					alert("タブの上限に達しました。");
					return;
				}
				d.used = true;
				$("#tabs").append(
					`<div class="tab" name="${d.id}"><p>タブ${
						d.id + 1
					}<span class="close">×</span></p></div>`
				);
				$(`.tab[name="${d.id}"] p`).on("click", (e) => f.tabChange(e));
				$(`.tab[name="${d.id}"] .close`).on("click", (e) => f.tabClose(e));
				$("#gamearea").append(
					`<iframe src="${d.url}" name="${d.id}"></iframe>`
				);
				const h = $(`iframe[name="${d.id}"]`);
				f.tabChange({ target: $(`.tab[name="${d.id}"]`) });
			};
			$("#tabaddbtn")
				.removeAttr("id")
				.on("click", () => f.tabAdd());

			$("#tabarea").on("wheel", (e) => {
				if (Math.abs(e.originalEvent.deltaY) < Math.abs(e.originalEvent.deltaX))
					return;

				const maxScrollLeft =
					$("#tabs").get(0).scrollWidth - $("#tabs").get(0).clientWidth;

				if (
					($("#tabs").scrollLeft() <= 0 && e.originalEvent.deltaY < 0) ||
					($("#tabs").scrollLeft() >= maxScrollLeft &&
						e.originalEvent.deltaY > 0)
				)
					return;

				e.preventDefault();
				$("#tabs").scrollLeft($("#tabs").scrollLeft() + e.originalEvent.deltaY);
			});

			f.keydownEvent = (e) => {
				if (e.ctrlKey && e.key === "Tab") {
					e.preventDefault();
					const activeTab = $(".tab.active");
					const nextTab = activeTab.next(".tab").length
						? activeTab.next(".tab")
						: $(".tab").first();
					const prevTab = activeTab.prev(".tab").length
						? activeTab.prev(".tab")
						: $(".tab").last();
					return f.tabChange({ target: e.shiftKey ? prevTab : nextTab });
				}
				if (e.ctrlKey && e.key === "w") {
					e.preventDefault();
					const activeTab = $(".tab.active");
					return f.tabClose({ target: activeTab });
				}
				if (e.ctrlKey && e.key === "t") {
					e.preventDefault();
					return f.tabAdd();
				}
				if ((e.ctrlKey && e.key === "r") || e.key === "F5") {
					e.preventDefault();
					const activeTab = $(".tab.active");
					const id = Number(activeTab.attr("name"));
					$(`iframe[name="${id}"]`)
						.removeAttr("src")
						.attr("src", hcqLinks.find((n) => n.id == id).url);
					return;
				}
				if ((e.ctrlKey && e.key === "s") || e.key === "F1") {
					e.preventDefault();
					ipcRenderer.send("state", {
						type: "partyReady",
					});
					return;
				}
				if ((e.ctrlKey && e.key === "b") || e.key === "F2") {
					e.preventDefault();
					ipcRenderer.send("state", {
						type: "exitField",
					});
					return;
				}
			};
			f.tabAdd();

			setInterval(() => {
				ipcRenderer.invoke("events").then((s) => {
					if (s.add) f.tabAdd();
					if (s.close) f.tabClose({ target: $(`.tab.active`) });
					if (s.change) {
						const activeTab = $(".tab.active");
						const nextTab = activeTab.next(".tab").length
							? activeTab.next(".tab")
							: $(".tab").first();
						f.tabChange({ target: nextTab });
					}
					if (s.change2) {
						const activeTab = $(".tab.active");
						const prevTab = activeTab.prev(".tab").length
							? activeTab.prev(".tab")
							: $(".tab").last();
						f.tabChange({ target: prevTab });
					}
					if (s.reload.length) {
						s.reload.forEach((url) => {
							const id = hcqLinks.find((n) => n.url == url).id;
							$(`iframe[name="${id}"]`)
								.removeAttr("src")
								.attr("src", url);
						});
					}
				});
			}, 200);
		} else if (d.mode == "window") {
			const $ = window.jQuery;
			const DOM = hcqLinks.slice(0, Number(d.windowCount)).map(n => `<iframe src="${n.url}"></iframe>`)
			$("#gamearea").html(DOM);
			switch (Number(d.windowCount)) {
				case 1:
					$("iframe").css({
						width: "calc(100% - 5px)",
						height: "calc(100% - 10px)",
						border: "none",
					});
					break;
				case 2:
					$("iframe").css({
						width: d.type == "a" ? "calc(100% - 5px)" : "calc(50% - 5px)",
						height: d.type == "a" ? "calc(50% - 10px)" : "calc(100% - 10px)",
						border: "none",
					});
					break;
				case 3:
					$("iframe").css({
						width: d.type == "a" ? "calc(100% - 5px)" :"calc(33% - 5px)",
						height: d.type == "a" ? "calc(33% - 10px)" : "calc(100% - 10px)",
						border: "none",
					});
					break;
				case 4:
					$("iframe").css({
						width: d.type == "a" ? "calc(50% - 5px)" : "calc(25% - 5px)",
						height: d.type == "a" ? "calc(50% - 10px)" : "calc(100% - 10px)",
						border: "none",
					});
					break;
				case 5:
					$("iframe").css({
						width: "calc(1/3 - 5px)",
						height: "calc(50% - 10px)",
						border: "none",
					});
					$("iframe:eq(0)").css("height", "calc(100% - 10px)");
					break;
				case 6:
					$("iframe").css({
						width: "calc(1/3 - 5px)",
						height: "calc(50% - 10px)",
						border: "none",
					});
					break;
				case 7:
					$("iframe").css({
						width: "calc(1/3 - 5px)",
						height: "calc(50% - 10px)",
						border: "none",
					});
					$("iframe:eq(0)").css("height", "calc(100% - 10px)");
					break;
				case 8:
					$("iframe").css({
						width: "calc(25% - 5px)",
						height: "calc(50% - 10px)",
						border: "none",
					});
					break;
				case 9:
					$("iframe").css({
						width: "calc(1/3 - 5px)",
						height: "calc(1/3 - 10px)",
						border: "none",
					});
					break;
				case 10:
					$("iframe").css({
						width: "calc(20% - 5px)",
						height: "calc(50% - 10px)",
						border: "none",
					});
					break;
			}
		}
		return;
	}
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

		const { addonModules } = ipcRenderer.sendSync("startgame");

		if (addonModules.multilinechat)
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

		if (addonModules.chatmaxup)
			await fetch("https://addon.pjeita.top/module/chatmaxup.js", {
				cache: "no-store",
			})
				.then((n) => n.text())
				.then(eval);
		if (addonModules.displaystatus)
			await fetch("https://addon.pjeita.top/module/displaystatus.js", {
				cache: "no-store",
			})
				.then((n) => n.text())
				.then(eval);
	};
	const h =
		'\n++\t<div+id="topad_top"></div>\n\x3C!--+admax+-->\n<div+class="admax-switch"+data-admax-id="97bbe8a54d9e077bdb4145747114424a"+style="display:+inline-block;+width:+468px;+height:+60px;"><iframe+width="468"+height="60"+scrolling="no"+frameborder="0"+allowtransparency="true"+style="display:inline-block;vertical-align:+bottom;"></iframe></div>\n\x3Cscript+type="text/javascript">\n(admaxads+=+window.admaxads+||+[]).push({admax_id:+"97bbe8a54d9e077bdb4145747114424a",type:+"switch"});\x3C/script>\n\x3Cscript+type="text/javascript"+charset="utf-8"+src="https://adm.shinobi.jp/st/t.js"+async="">\x3C/script>\n\x3C!--+admax+-->\n++\t<div+id="topad_bottom"></div>\n++';
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
				h,
			},
			success: function (response) {
				wait_LoginGame = false;
				if (response.error == 404) return Error404();
				if (response.error == 2) return $("#logingame_alerttext").text(response.str);
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
				h,
			},
			success: function (response) {
				wait_LoginGame = false;
				$("#logingame_alerttext").html("");
				if (response.error == 404) return Error404();
				if (response.error == 30) {
					AutoLoginKaizyo();
					return $("#loginformid").val(cid);
				}
				if (response.error == 2) return $("#logingame_alerttext").text(response.str);
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

	$(document).on("keydown", (e) => {
		if (e.ctrlKey && e.key === "Tab") {
			e.preventDefault();
			ipcRenderer.send("tabChange", {
				reverse: e.shiftKey,
			});
			return;
		}
		if (e.ctrlKey && e.key === "w") {
			e.preventDefault();
			ipcRenderer.send("tabClose");
			return;
		}
		if (e.ctrlKey && e.key === "t") {
			e.preventDefault();
			ipcRenderer.send("tabAdd");
			return;
		}
		if ((e.ctrlKey && e.key === "r") || e.key === "F5") {
			e.preventDefault();
			ipcRenderer.send("tabReload", {
				url: new URL(location.href).origin,
			});
			return;
		}
		if ((e.ctrlKey && e.key === "s") || e.key === "F1") {
			e.preventDefault();
			ipcRenderer.send("state", {
				type: "partyReady"
			})
			return;
		}
		if ((e.ctrlKey && e.key === "b") || e.key === "F2") {
			e.preventDefault();
			ipcRenderer.send("state", {
				type: "exitField"
			})
			return;
		}
	});

	setInterval(() => {
		ipcRenderer.invoke("state", {
			url: new URL(location.href).origin,
		}).then((s) => {
			if (!s) return;
			if (s.partyReady) {
				if (myparty && now_scene == 20) {
					setTimeout(PartyQuestReady, hcqLinks.find(n => n.url == new URL(location.href).origin).id * 1000);
				}
			}
			if (s.exitField) {
				if (now_channel) ExitField();
				if (now_scene != 20) {
					setTimeout(() => {
						if (!$("#zisatudiv").length) {
							if (now_scene == 31) ExitQuest();
							setTimeout(() => PorchResultComplete(0), 500);
						}
					}, 500);
				}
			}
		});
	}, 500)

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
