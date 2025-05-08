window.addEventListener("DOMContentLoaded", async () => {
	if (
		!new URL(location.href).origin.includes("himaquest.com")
	)
		return;
	const { ipcRenderer } = require("electron");
	document.body.style.display = "none";
	let _tmp = {};
	_tmp = setTimeout(() => location.reload(), 1500);
	window.onbeforeunload = () => {};
	this.notificationSound = new Audio(
		"https://files.pjeita.top/meteor_notification.mp3"
	);
	this.notificationSound.muted = true;
	this.notificationSound.volume = 0.5;
	this.notificationSound.addEventListener("ended", () => {
		this.notificationSound.muted = false;
	});

	this.ajax = async (a, b = null) => {
		let url, data;
		if (b == null) {
			data = a;
			url = a?.url;
		} else {
			url = a;
			data = b;
		}
		return await new Promise((resolve, reject) => {
			$.ajax({
				type: data?.method ?? data?.type ?? "post",
				url,
				data: data?.body ?? data?.data ?? "",
				success: data?.success ?? (() => {}),
				error: data?.error ?? (() => {}),
			})
				.done(resolve)
				.fail(reject);
		});
	};

	const userCache = {};
	this.getUserIp = async (tuid) => {
		if (userCache[tuid]) return userCache[tuid];
		const { remote } = await fetch(
			"https://ksg-network.tokyo/UserKanri.php",
			{
				method: "post",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					myid,
					seskey,
					tuid,
					origin: "himaque",
				}).toString(),
			}
		).then((n) => n.json());
		userCache[tuid] = remote;
		setTimeout(() => {
			delete userCache[tuid];
		}, 300000);
		return remote;
	};

	this.F5ChatKobetu = async (bmark, isLogin) => {
		if (!SID) return;
		ajax({
			type: "POST",
			url: "chat_F5User.php",
			data: { marumie: myid, seskey, bmark },
		})
			.then((response) => {
				(async (response) => {
					if (response.error != 1) {
						errorflg_ChatKobetu++;
						if (errorflg_ChatKobetu > ERRORCOUNT) {
							$("#areachat").html(
								"接続が途切れました。更新してください。"
							);
							$("#partychat").html(
								"接続が途切れました。更新してください。"
							);
							return;
						}
						return setTimeout(() => {
							F5ChatKobetu(bmark, 0);
						}, 1000);
					}
					errorflg_ChatKobetu = 0;
					if (bmark >= response.bmark)
						return setTimeout(function () {
							F5ChatKobetu(bmark, 0);
						}, 1000);
					for (let i = 0; i < response.coments.length; i++) {
						const comment = response.coments[i];
						let userid = "",
							ip = "";
						switch (comment.type) {
							case "c":
								userid = comment.source
									.split("UserWindow(")[1]
									.split(")")[0];
								ip = await getUserIp(userid);
								if (musilist.find((n) => n.remote == ip)) break;
								$("#areachat")
									.find(".c_chatwindow")
									.prepend(comment.source);
								$("#areachat")
									.find(".c_chatwindow")
									.find(`table:gt(${dsflg ? 30 : 80})`)
									.remove();
								if (!isLogin) midoku_zentai++;
								break;
							case "p":
								userid = comment.source
									.split("UserWindow(")[1]
									.split(")")[0];
								ip = await getUserIp(userid);
								if (musilist.find((n) => n.remote == ip)) break;
								$("#partychat")
									.find(".c_chatwindow")
									.prepend(comment.source);
								$("#partychat")
									.find(".c_chatwindow")
									.find(`table:gt(${dsflg ? 30 : 80})`)
									.remove();
								if (!isLogin) midoku_pt++;
								break;
							case "S":
								if (!isLogin) {
									if (
										location.href.startsWith("https") &&
										document.visibilityState == "hidden" &&
										now_field
									) {
										this.ajax(
											"https://ksg-network.tokyo/UserKanri.php",
											{
												method: "post",
												body: {
													origin: "himaque",
													myid,
													seskey,
													tuid: myid,
												},
											}
										).then((n) => {
											const notification =
												new Notification("周回終了", {
													body: `No.${SID} ${n.name}のアカウントの周回が完了しました。`,
													tag: `Meteor (HIMACHATQUEST専用ブラウザ)`,
													silent: true,
													renotify: true,
												});
											notification.addEventListener(
												"show",
												() => {
													this.notificationSound.muted = false;
													this.notificationSound.play();
												}
											);
										});
									}
									Core();
								}
								break;
							case "B":
								if (!isLogin) BgmPlay(Number(comment.songid));
								break;
							case "P":
								if (!isLogin) MyPartyUpdate();
								break;
							case "V":
								if (!isLogin) PvRoomUpdate();
								break;
							case "G":
								$(".ghpid" + comment.pid).css({
									left: comment.x + "%",
									top: comment.y + "%",
								});
								$(".ghpid" + comment.pid)[
									comment.muki ? "addClass" : "removeClass"
								]("muki_left");
								break;
							case "g":
								if (!isLogin) LoadMyGuildList();
								break;
							case "I":
								if (!isLogin) break;
								switch (comment.func) {
									case "0":
									case 0:
										break;
									case "1":
									case 1:
										porchupdate = !![];
										$("#kabanbtn_count").text(comment.opt1);
										break;
									case "2":
									case 2:
										LoadWeaponBox();
										break;
									case "3":
									case 3:
										LoadSozaiBox();
										break;
									case "4":
									case 4:
										$("#kabanbtn_count").text(comment.opt1);
										break;
								}
								$("#logspace").prepend(comment.mozi);
								$("#logspace")
									.find(`.syslog:gt(${dsflg ? 30 : 80})`)
									.remove();
								break;
							default:
								break;
						}
					}
					if (!isLogin && nowchatshow != 1) {
						$("#midoku_zentai").text(midoku_zentai);
						$("#midoku_zentai")[midoku_zentai ? "show" : "hide"]();
					}
					if (!isLogin && nowchatshow != 2) {
						$("#midoku_pt").text(midoku_pt)[
							midoku_pt ? "show" : "hide"
						];
					}
					setTimeout(() => {
						F5ChatKobetu(response.bmark, 0);
					}, 300);
				})(response);
			})
			.catch(() => {
				errorflg_ChatKobetu++;
				if (errorflg_ChatKobetu > ERRORCOUNT) {
					$("#areachat").html(
						"接続が途切れました。更新してください。"
					);
					$("#partychat").html(
						"接続が途切れました。更新してください。"
					);
					return;
				}
				return setTimeout(() => {
					F5ChatKobetu(bmark, 0);
				}, 1000);
			});
	};

	window.PreLoad = () => {
		clearTimeout(_tmp);
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
	};

	const h = '\n++\t<div+id="topad_top"></div>\n\x3C!--+admax+-->\n<div+class="admax-switch"+data-admax-id="97bbe8a54d9e077bdb4145747114424a"+style="display:+inline-block;+width:+468px;+height:+60px;"><iframe+width="468"+height="60"+scrolling="no"+frameborder="0"+allowtransparency="true"+style="display:inline-block;vertical-align:+bottom;"></iframe></div>\n\x3Cscript+type="text/javascript">\n(admaxads+=+window.admaxads+||+[]).push({admax_id:+"97bbe8a54d9e077bdb4145747114424a",type:+"switch"});\x3C/script>\n\x3Cscript+type="text/javascript"+charset="utf-8"+src="https://adm.shinobi.jp/st/t.js"+async="">\x3C/script>\n\x3C!--+admax+-->\n++\t<div+id="topad_bottom"></div>\n++';
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
				h
			},
			success: function (response) {
				wait_LoginGame = false;
				if (response.error == 404) return Error404();
				if (response.error == 2)	
					return $("#logingame_alerttext").text(response.str);
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
				h
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
			ipcRenderer.send("tabClose", {
				url: new URL(location.href).origin,
			});
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
			ipcRenderer.send("partyReady")
			return;
		}
		if ((e.ctrlKey && e.key === "b") || e.key === "F2") {
			e.preventDefault();
			ipcRenderer.send("exitField")
			return;
		}
	});
	
	setInterval(() => {
		ipcRenderer.invoke("state", {
			url: new URL(location.href).origin,
		}).then((s) => {
			if (s.partyReady) {
				if (myparty) {
					PartyQuestReady();
				}
			}
			if (s.exitField) {
				if (now_scene != 20) {
					ExitField();
					setTimeout(() => PorchResultComplete(0), 500);
				}
			}
		});
	}, 500)

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
