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
	const gameData = ipcRenderer.sendSync("startgame");

	if (window.self === window.top) {
		if (gameData.mode == "tab") {
			const $ = window.jQuery;
			const f = {};

			f.tabClose = (e) => {
				if (e.hasClass("active")) {
					const next = e.next(".tab").length
						? e.next(".tab")
						: e.prev(".tab");
					if (next.length) {
						f.tabChange({ target: next });
					}
				}
				const id = Number(e.attr("name"));
				hcqLinks.find((n) => n.id == id).used = false;
				e.closest(".tab").remove();
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
				$(`.tab[name="${d.id}"] .close`).on("click", (e) => {
					f.tabClose($(e.target).closest(".tab"));
				});
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
					return f.tabClose($(".tab.active"));
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
			$(document).on("keydown", f.keydownEvent);

			ipcRenderer.on("tabAdd", () => f.tabAdd());
			ipcRenderer.on("tabClose", (e, d) => f.tabClose($(".tab.active")));
			ipcRenderer.on("tabChange", (e, d) => {
				const activeTab = $(".tab.active");
				const nextTab = activeTab.next(".tab").length
					? activeTab.next(".tab")
					: $(".tab").first();
				const prevTab = activeTab.prev(".tab").length
					? activeTab.prev(".tab")
					: $(".tab").last();
				return f.tabChange({ target: d ? prevTab : nextTab });
			});
			ipcRenderer.on("tabReload", (e, d) => {
				const activeTab = $(".tab.active");
				const id = Number(activeTab.attr("name"));
				$(`iframe[name="${id}"]`)
					.removeAttr("src")
					.attr("src", hcqLinks.find((n) => n.id == id).url);
			});

			f.tabAdd();
		} else if (gameData.mode == "window") {
			const $ = window.jQuery;
			const DOM = hcqLinks
				.slice(0, Number(gameData.windowCount))
				.map((n) => `<iframe src="${n.url}"></iframe>`);
			$("#gamearea").html(DOM);
			switch (Number(gameData.windowCount)) {
				case 2:
					$("#gamearea").css({
						"grid-template-columns":
							gameData.type == "a" ? "1fr" : "1fr 1fr",
						"grid-template-rows": gameData.type == "a" ? "1fr 1fr" : "1fr",
					});
					break;
				case 3:
					$("#gamearea").css({
						"grid-template-columns":
							gameData.type == "a" ? "1fr" : "1fr 1fr 1fr",
						"grid-template-rows":
							gameData.type == "a" ? "1fr 1fr 1fr" : "1fr",
					});
					break;
				case 4:
					$("#gamearea").css({
						"grid-template-columns":
							gameData.type == "a" ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
						"grid-template-rows": gameData.type == "a" ? "1fr 1fr" : "1fr",
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

	if (!gameData.addon) {
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
	}

	window.PreLoad = async () => {
		for (let i = 1; i <= 15; i++) {
			let d = false;
			$(`#ougibtn${i}`)
				.removeAttr("onclick")
				.on("dragstart", (e) => {
					e.preventDefault();
					Ougi(i);
					d = true;
				})
				.on("click", (e) => {
					if (d) {
						d = false;
						return e.preventDefault();
					}
					Ougi(i);
				});
			$(document).on("mouseup", (e) => {
				setTimeout(() => {
					d = false;
				}, 0);
			});
		}
		let password = await ipcRenderer.invoke("password");
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

		const passArrToDom = (arr) =>
			arr
				.map(
					(n) =>
						`<div class="contents" data-id="${n.userdata.id}">
							<div class="handle" style="flex-grow: 0;font-size: 1.5rem; width: 30px; cursor: move;">≡</div>
							<div style="flex-grow: 3;">
								No.${n.userdata.id} ${n.userdata.name}
							</div>
							<div style="flex-grow: 1;">
								<button style="margin: 5px;" onclick="loadPwdData(${n.userdata.id})">ログイン</button>
								<button style="margin: 5px;" onclick="deletePwdData(${n.userdata.id})">削除</button>
							</div>
						</div>`
				)
				.join("");

		$("#toplogindiv")
			.css({height: "220px", top: "auto", bottom: "5%"})
			.append('<p><label><input id="addToPwdmgrBtn" type="checkbox"><small>パスワードマネージャーに追加する</small></label></p><button id="pwmgrbtn">パスワードマネージャー</button>');
		$("#page_login").append(
			`<style>
				#pwmgr_list .contents {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 10px;
					border-bottom: 1px solid #ccc;
				}
				.sortable-placeholder {
					background-color: #ffffbb;
					border: 1px dashed #cccccc;
					height: 50px;
				}
			</style>
			<div id="pwmgr" style="width: 100vw; height: 100dvh; background-color: #00000055; display: none; position: fixed; top: 0; left: 0;">
				<div id="pwmgr_content" style="display: block; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 75vw; height: min(70vh, 70vw); background-color: #ffffff;">
					<button id="pwmgr_close" style="position: absolute; top: 0; right: 0; padding: 10px; cursor: pointer;">×</button>
					<div id="pwmgr_content_inner" style="padding: 20px;"><br />
						<h2 style="text-align: center; font-size: 2rem;">パスワードマネージャー</h2>
						<input type="text" placeholder="名前またはNo.検索" oninput="searchPwdData(this.value)" />
						<button id="pwdmgr_reload" style="margin-left: 10px;" onclick="searchPwdData()">更新</button>
						<div id="pwmgr_list" style="max-height: min(35vh, 35vw); overflow-y: auto;">
						</div>
					</div>
				</div>
			</div>`
		);

		const applySortable = () => {
			const jQueryUI = document.createElement("script");
			jQueryUI.src = "https://code.jquery.com/ui/1.13.2/jquery-ui.min.js";
			document.head.appendChild(jQueryUI);
			jQueryUI.onload = () => {
				const jQueryUICSS = document.createElement("link");
				jQueryUICSS.rel = "stylesheet";
				jQueryUICSS.href =
					"https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css";
				document.head.appendChild(jQueryUICSS);
				jQueryUICSS.onload = () => {
					$("#pwmgr_list").sortable({
						axis: "y",
						placeholder: "sortable-placeholder",
						opacity: 0.5,
						revert: true,
						tolerance: "pointer",
						handle: ".handle",
						stop: function (event, ui) {
							ipcRenderer.send(
								"passwordsort",
								$("#pwmgr_list .contents").map((_, el) => $(el).data("id")).get()
							);
						},
					});
					$("#pwmgr_list").disableSelection();
				};
			};
		}

		if (!$().jquery.startsWith("3.")) {
			const jQuery = document.createElement("script");
			jQuery.src = "https://code.jquery.com/jquery-3.6.0.min.js";
			document.head.appendChild(jQuery);
			jQuery.onload = applySortable;
		} else {
			applySortable();
		}

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

		let prevSearchQuery = "";
		this.searchPwdData = async (query = prevSearchQuery) => {
			password = await ipcRenderer.invoke("password");
			prevSearchQuery = query;
			$("#pwmgr_list").empty();
			const arr = password.filter(
				(n) => n.userdata.id == query || n.userdata.name.includes(query)
			);
			if (arr.length == 0)
				return $("#pwmgr_list").html(
					`<div style="text-align: center; padding: 20px;">パスワードが登録されていません</div>`
				);
			$("#pwmgr_list").html(passArrToDom(arr));
		};

		this.loadPwdData = (id) => {
			const data = password.find((n) => n.userdata.id == id);
			if (!data) return;
			$("#loginformid").val(data.id);
			$("#loginformpass").val(data.password);
			$("#addToPwdmgrBtn").prop("checked", true);
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
					if (password.length == 0) {
						$("#pwmgr_list").html(
							`<div style="text-align: center; padding: 20px;">パスワードが登録されていません</div>`
						);
						return;
					} else {
						$("#pwmgr_list").html(passArrToDom(password));
					}
				}
			}
		};
		
		$("#pwmgr_close").on("click", () => {
			$("#pwmgr").hide();
		});
		$("#pwmgrbtn").on("click", () => {
			$("#pwmgr").show();
			$("#pwmgr_list").empty();
			searchPwdData()
		});

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
					password.find((n) => n.userdata.id == myid).password =
						fpass;
					if ($("#addToPwdmgrBtn").prop("checked")) ipcRenderer.send("password", {
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
					waitProfileEdit = 0;
					alert("なにかしらの不具合K0646");
				},
			});
		};

		this.MyProfileEdited = () => {
			const fname = $("#myedit_name").val();
			const fshoukai = $("#myedit_shoukai").val();
			if (fname.length == 0) return;
			if (fname.length > 50)
				return alert("名前を50文字以下にしてください");
			if (fshoukai.length > 1000)
				return alert("紹介文を1000文字以下にしてください");
			if (waitProfileEdit) return;
			waitProfileEdit = 1;
			$.ajax({
				type: "POST",
				url: "Ksg_MyProfileEdited.php",
				data: { myid, seskey, fname, fshoukai },
				success: function (response) {
					waitProfileEdit = 0;
					if (response.e != 1) return alert("サーバエラーK0645");
					$("#profileedit").remove();
					UserWindowMe();
					if (password.find((n) => n.userdata.id == myid)) {
						const data = password.find(
							(n) => n.userdata.id == myid
						);
						data.userdata.name = fname;
						if ($("#addToPwdmgrBtn").prop("checked")) ipcRenderer.send("password", { type: "add", data });
					}
				},
				error: function () {
					waitProfileEdit = 0;
					alert("なにかしらの不具合K0645");
				},
			});
		};

		if (gameData.addon) {
			this.addonModules = {};

			const { addonModules: modules, addonData } = gameData
			addonData.forEach((n) => (addonModules[n.id] = false));
			const addon = addonData
				.filter((n) => modules[n.id])
				.toSorted((n) => n.n);
			for (let i = 0; i < addon.length; i++) {
				this.addonModules[addon[i].id] = true;
				await fetch(`https://addon.pjeita.top/module/${addon[i].id}.js`, {
					cache: "no-store",
				})
					.then((n) => n.text())
					.then(eval);
			}
			
			this.getPresetData = async () => {
				return await ipcRenderer.invoke("ougipreset");
			};
			this.setPresetData = (d) => {
				ipcRenderer.send("ougipreset", d);
				this.presets = d;
			};

			this.presets = await this.getPresetData();
		}

		this.ExitGame = () => {
			PageChangeLogin();
			$("#layerroot").empty();
			$("#effectgamen").empty();
			$("#pwmgr").hide();
			$("#addToPwdmgrBtn").prop("checked", false);
			BgmStop();
			myteam = 9;
			sp = 0;
			layercount = 0;
			gazoucount = 0;
			radiocount = 0;
			effectcount = 0;
			myquest = 0;
			mynanido = 0;
			$coloreturn = 0;
			cnf_ougi = 0;
			cnf_act = 0;
			item_hyouzi = 0;
			item_tag = [];
			item_nowtag = 0;
			admita = 0;
			adkesi = 0;
			vsmode = 0;
			ERRORCOUNT = 4;
			nowtime = Date.now();
			clear_time = new Date(nowtime + 60 * 60 * 24 * 1000 * 14);
			expires = clear_time.toGMTString();
			shokaicore = 0;
			now_scene = 0;
			now_field = 0;
			now_channel = 0;
			now_bc = "???";
			now_gold = 0;
			now_mana = 0;
			now_sizai = 0;
			now_tamasi = 0;
			now_mission = 0;
			now_guild = 0;
			now_chara = 0;
			yarinaosinotane = 0;
			SID = 0;
			myid = 0;
			SKEY = 0;
			seskey = 0;
			myguildid = 0;
			myparty = 0;
			mypttype = 0;
			colosss = "";
			charadata = 0;
			charasibori_job = 0;
			charasibori_lv = 0;
			charasibori_vs = 0;
			charasibori_tag = 0;
			bmark_kobetu = -1;
			bmark_guild = -1;
			ksgF5error = 0;
			ksgBmark = 0;
			KSGERRORLIM = 5;
			kobetuSort = [];
			kL = [];
			nowkobetushow = 0;
			musilist = [];
			bmark_zentai = -1;
			bmark_pt = -1;
			msgs_zentai = [];
			msgs_pt = [];
			msgs_guild = [];
			topmsgs = ["", ""];
			midoku_zentai = 0;
			midoku_pt = 0;
			midoku_guild = 0;
			midoku_musi = 0;
			datarate = 0;
			rate_fild = 0;
			errorflg_fild = 0;
			f5hassha = 0;
			now_stage = 0;
			haikei_x = 0;
			ougiPaletteArray = [];
			ougiPaletteid = 0;
			ougibtnSP = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			jobreset_lv = 0;
			nokoripoint = 0;
			bonus_pow = 0;
			bonus_def = 0;
			bonus_tec = 0;
			userpow = 0;
			userdef = 0;
			usertec = 0;
			sozaidata = [];
			PAYMANA = 100;
			NEEDGOLD = 50000;
			NEEDSIZAI = 300;
			porchmax = 30;
			porchmany = 0;
			quizid = 0;
			spmonster = 0x1;
			friendData = [];
			sinseiData = [];
			nowchatshow = 0;
			musiarray = [];
			AutoLoginKaizyo();
		};
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

		$("#loginformid").val("");
		$("#loginformpass").val("");

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
				if ($("#addToPwdmgrBtn").prop("checked")) ipcRenderer.send("password", {
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
		if (e.ctrlKey && e.key === "m") {
			e.preventDefault();
			bgmflg = 0;
			otoflg = 0;
			audioflg = 0;
			BgmStop();
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

	this.PageChangeLogin = () => {
		$(".page").hide();
		$("#topad").show();
		$("#page_login").show();
		$("#loginformid").val("");
		$("#loginformpass").val("");
	};
	this.PageChangeMain = () => {
		$(".page").hide();
		$("#topad").hide();
		$("#page_main").show();
		$("#loginformid").val("");
		$("#loginformpass").val("");
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
