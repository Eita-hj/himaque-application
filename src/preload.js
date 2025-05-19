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
				$(`.tab[name="${d.id}"] .close`).on("click", (e) =>
					f.tabClose(e)
				);
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
				if (
					Math.abs(e.originalEvent.deltaY) <
					Math.abs(e.originalEvent.deltaX)
				)
					return;

				const maxScrollLeft =
					$("#tabs").get(0).scrollWidth -
					$("#tabs").get(0).clientWidth;

				if (
					($("#tabs").scrollLeft() <= 0 &&
						e.originalEvent.deltaY < 0) ||
					($("#tabs").scrollLeft() >= maxScrollLeft &&
						e.originalEvent.deltaY > 0)
				)
					return;

				e.preventDefault();
				$("#tabs").scrollLeft(
					$("#tabs").scrollLeft() + e.originalEvent.deltaY
				);
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
					return f.tabChange({
						target: e.shiftKey ? prevTab : nextTab,
					});
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
			ipcRenderer.on("tabAdd", () => f.tabAdd());
			ipcRenderer.on("tabClose", (e, d) => f.tabClose(d));
			ipcRenderer.on("tabChange", (e, d) => {
				const activeTab = $(".tab.active");
				const nextTab = activeTab.next(".tab").length
					? activeTab.next(".tab")
					: $(".tab").first();
				const prevTab = activeTab.prev(".tab").length
					? activeTab.prev(".tab")
					: $(".tab").last();
				return f.tabChange({ target: d.reverse ? prevTab : nextTab });
			});
			ipcRenderer.on("tabReload", (e, d) => {
				const activeTab = $(".tab.active");
				const id = Number(activeTab.attr("name"));
				$(`iframe[name="${id}"]`)
					.removeAttr("src")
					.attr("src", hcqLinks.find((n) => n.id == id).url);
			});

			f.tabAdd();
		} else if (d.mode == "window") {
			const $ = window.jQuery;
			const DOM = hcqLinks
				.slice(0, Number(d.windowCount))
				.map((n) => `<iframe src="${n.url}"></iframe>`);
			$("#gamearea").html(DOM);
			switch (Number(d.windowCount)) {
				case 2:
					$("#gamearea").css({
						"grid-template-columns":
							d.type == "a" ? "1fr" : "1fr 1fr",
						"grid-template-rows": d.type == "a" ? "1fr 1fr" : "1fr",
					});
					break;
				case 3:
					$("#gamearea").css({
						"grid-template-columns":
							d.type == "a" ? "1fr" : "1fr 1fr 1fr",
						"grid-template-rows":
							d.type == "a" ? "1fr 1fr 1fr" : "1fr",
					});
					break;
				case 4:
					$("#gamearea").css({
						"grid-template-columns":
							d.type == "a" ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
						"grid-template-rows": d.type == "a" ? "1fr 1fr" : "1fr",
					});
					break;
				case 5:
					$("#gamearea").css({
						"grid-template-columns": "1fr 1fr 1fr",
						"grid-template-rows": "1fr 1fr",
					});
					$("iframe:eq(0)").css("grid-row", "span 2");
					break;
				case 6:
					$("#gamearea").css({
						"grid-template-columns": "1fr 1fr 1fr",
						"grid-template-rows": "1fr",
					});
					break;
				case 7:
					$("#gamearea").css({
						"grid-template-columns": "1fr 1fr 1fr 1fr",
						"grid-template-rows": "1fr 1fr",
					});
					$("iframe:eq(0)").css("grid-row", "span 2");
					break;
				case 8:
					$("#gamearea").css({
						"grid-template-columns": "1fr 1fr 1fr 1fr",
						"grid-template-rows": "1fr 1fr",
					});
					break;
				case 9:
					$("#gamearea").css({
						"grid-template-columns": "1fr 1fr 1fr",
						"grid-template-rows": "1fr 1fr 1fr",
					});
					break;
				case 10:
					$("#gamearea").css({
						"grid-template-columns": "1fr 1fr 1fr 1fr 1fr",
						"grid-template-rows": "1fr 1fr",
					});
					break;
			}
		}
		return;
	}
	if (!new URL(location.href).origin.includes("himaquest.com")) return;
	document.body.style.display = "none";
	window.onbeforeunload = () => {};

	window.PreLoad = async () => {
		const password = await ipcRenderer.invoke("password");
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

		$("#toplogindiv")
			.css("height", "35%")
			.append('<button id="pwmgrbtn">パスワードマネージャー</button>');
		$("#page_login").append(
			`<div id="pwmgr" style="width: 100vw; height: 100dvh; background-color: #00000055; display: none; position: fixed; top: 0; left: 0;">
				<div id="pwmgr_content" style="display: block; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 75vw; height: min(60vh, 60vw); background-color: #ffffff;">
					<button id="pwmgr_close" style="position: absolute; top: 0; right: 0; padding: 10px; cursor: pointer;">×</button>
					<div id="pwmgr_content_inner" style="padding: 20px;">
						<h2 style="text-align: center; font-size: 2rem;">パスワードマネージャー</h2>
						<div id="pwmgr_list" style="max-height: 50vh; overflow-y: auto;">
						</div>
					</div>
				</div>
			</div>`
		);
		$("#pwmgr_close").on("click", () => {
			$("#pwmgr").hide();
		});
		$("#pwmgrbtn").on("click", () => {
			$("#pwmgr").show();
			$("#pwmgr_list").empty();
			if (password.length == 0) {
				$("#pwmgr_list").append(
					`<div style="text-align: center; padding: 20px;">パスワードが登録されていません</div>`
				);
				return;
			}
			password.forEach((n) => {
				$("#pwmgr_list").append(
					`<div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ccc;">
						<div style="flex-grow: 3;">
							No.${n.userdata.id} ${n.userdata.name}
						</div>
						<div style="flex-grow: 1;">
							<button style="margin: 5px;" onclick="loadPwdData(${n.userdata.id})">ログイン</button>
							<button style="margin: 5px;" onclick="deletePwdData(${n.userdata.id})">削除</button>
						</div>
					</div>`
				);
			});
		});

		let shiftPressed = false;
		$(document).on("keydown", (e) => {
			if (e.key === "Shift") {
				shiftPressed = true;
			}
		});
		$(document).on("keyup", (e) => {
			if (e.key === "Shift") {
				shiftPressed = false;
			}
		});

		this.loadPwdData = (id) => {
			const data = password.find((n) => n.userdata.id == id);
			if (!data) return;
			$("#loginformid").val(data.id);
			$("#loginformpass").val(data.password);
			this.LoginGame();
		};

		this.deletePwdData = (id) => {
			const data = password.find((n) => n.userdata.id == id);
			if (!data) return;
			const check =
				shiftPressed ||
				confirm(
					`No.${id} ${data.userdata.name}のパスワードデータを削除しますか？`
				);
			if (check) {
				ipcRenderer.send("password", {
					type: "delete",
					id: data.userdata.id,
				});
				const index = password.findIndex((n) => n.userdata.id == id);
				if (index !== -1) {
					password.splice(index, 1);
					$("#pwmgr_list").empty();
					if (password.length == 0) {
						$("#pwmgr_list").append(
							`<div style="text-align: center; padding: 20px;">パスワードが登録されていません</div>`
						);
						return;
					}
					password.forEach((n) => {
						$("#pwmgr_list").append(
							`<div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ccc;">
								<div style="flex-grow: 3;">
									No.${n.userdata.id} ${n.userdata.name}
								</div>
								<div style="flex-grow: 1;">
									<button style="margin: 5px;" onclick="loadPwdData(${n.userdata.id})">ログイン</button>
									<button style="margin: 5px;" onclick="deletePwdData(${n.userdata.id})">削除</button>
								</div>
							</div>`
						);
					});
				}
			}
		};

		this.addonModules = {
			multilinechat: false,
			chatmaxup: false,
			displaystatus: false,
			morepresets: false,
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
		if (addonModules.morepresets)
			await fetch("https://addon.pjeita.top/module/morepresets.js", {
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
				if (response.error == 2)
					return $("#logingame_alerttext").text(response.str);
				if (response.error != 1) return alert("サーバエラー0628");
				ipcRenderer.send("password", {
					type: "add",
					data: {
						userdata: {
							name: response.username,
							id: response.userid,
						},
						id: fid,
						password: fpass,
					},
				});
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
				if (response.error == 2)
					return $("#logingame_alerttext").text(response.str);
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

	this.PassEdited = () => {
		if (waitProfileEdit) return;
		const fid = $("#loginidhenkou").val();
		const fpass = $("#passhenkou1").val();
		const fpasscheck = $("#passhenkou2").val();
		if (fid.length < 4 || fid.length > 100)
			return $("#henkourespon").html(
				"ログインIDを4～100文字にしてください"
			);
		if (CheckPassStr(fid))
			return $("#henkourespon").html(
				"ログインIDは半角英数字a～z,A～Z,0～9のみ使用できます"
			);
		if (fpass.length < 4 || fpass.length > 100)
			return $("#henkourespon").html(
				"パスワードを4～100文字にしてください"
			);
		if (CheckPassStr(fpass))
			return $("#henkourespon").html(
				"パスワードは半角英数字a～z,A～Z,0～9のみ使用できます"
			);
		if (fpass !== fpasscheck)
			return $("#henkourespon").html("確認パスワードが一致しません");
		waitProfileEdit = 1;
		$.ajax({
			type: "POST",
			url: "Ksg_PassEdited.php",
			data: { myid, seskey, fid, fpass },
			success: function (response) {
				waitProfileEdit = 0;
				if (response.e == 2)
					return $("#henkourespon").html(response.str);
				if (response.e != 0x1) return alert("サーバエラーK0646");
				password.find((n) => n.userdata.id == myid).id = fid;
				password.find((n) => n.userdata.id == myid).password = fpass;
				ipcRenderer.send("password", {
					type: "add",
					data: {
						userdata: {
							name: $("#radiospace").text(),
							id: myid,
						},
						id: fid,
						password: fpass,
					},
				});
				$("#passhenkoudiv")
					.find(".sourcespace")
					.html(
						'<div style="text-align:center;padding-top:20px;">パスワードを変更しました。<br /><button onclick="LayerClose(this)">OK</button></div>'
					);
			},
			error: function () {
				waitProfileEdit = 0
				alert("なにかしらの不具合K0646");
			},
		});
	};

	this.MyProfileEdited = () => {
	const fname = $("#myedit_name").val()
	const fshoukai = $("#myedit_shoukai").val()
	if (fname.length == 0) return;
	if (fname.length > 50)
		return alert("名前を50文字以下にしてください")
	if (fshoukai.length > 1000)
		return alert("紹介文を1000文字以下にしてください")
	if (waitProfileEdit) return 0x0;
	waitProfileEdit = 1
	$.ajax({
		type: "POST",
		url: "Ksg_MyProfileEdited.php",
		data: {myid,seskey,fname,fshoukai},
		success: function (response) {
			waitProfileEdit = 0;
			if (response.e != 1) return alert("サーバエラーK0645");
			$("#profileedit").remove(), UserWindowMe();
			if (password.find((n) => n.userdata.id == myid)) {
				const data = password.find((n) => n.userdata.id == myid);
				data.userdata.name = fname;
				ipcRenderer.send("password", { type: "add", data });
			}
		},
		error: function () {
			waitProfileEdit = 0
			alert("なにかしらの不具合K0645");
		},
	});
}

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
	});

	setInterval(() => {
		ipcRenderer
			.invoke("state", {
				url: new URL(location.href).origin,
			})
			.then((s) => {
				if (!s) return;
				if (s.partyReady) {
					if (myparty && now_scene == 20) {
						setTimeout(
							PartyQuestReady,
							hcqLinks.find(
								(n) => n.url == new URL(location.href).origin
							).id * 1000
						);
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
	}, 500);

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
