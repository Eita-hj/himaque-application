(async () => {
	const $ = window.jQuery;
	const f = {};
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

	let port =
		sessionStorage.getItem("port") ||
		(await fetch("http://127.0.0.1:16762/start")
			.then((n) => n.json())
			.then((n) => n.port));

	sessionStorage.setItem("port", port);
	setInterval(async () => {
		const d = await fetch(`http://127.0.0.1:${port}/events`).then((n) =>
			n.json()
		);
		if (d.add) {
			f.tabAdd();
		} else if (d.close?.length) {
			d.close.forEach((n) => {
				const { id } = hcqLinks.find((m) => m.url == n);
				const t = $(`.tab[name="${id}"]`);
				if (t.length) {
					f.tabClose({ target: t });
				}
			});
		} else if (d.change) {
			const activeTab = $(".tab.active");
			const nextTab = activeTab.next(".tab").length
				? activeTab.next(".tab")
				: $(".tab").first();
			f.tabChange({ target: nextTab });
		} else if (d.change2) {
			const activeTab = $(".tab.active");
			const prevTab = activeTab.prev(".tab").length
				? activeTab.prev(".tab")
				: $(".tab").last();
			f.tabChange({ target: prevTab });
		} else if (d.reload?.length) {
			d.reload.forEach((n) => {
				const { id } = hcqLinks.find((m) => m.url == n);
				const t = $(`.tab[name="${id}"]`);
				if (t.length) {
					$(`iframe[name="${id}"]`)
						.removeAttr("src")
						.attr(
							"src",
							hcqLinks.find((m) => m.id == id).url
						);
				}
			});
		}
	}, 200);

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
			return fetch(`http://localhost:${port}/events`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ type: "partyReady" }),
			})
		}
		if ((e.ctrlKey && e.key === "b") || e.key === "F2") {
			e.preventDefault();
			return fetch(`http://localhost:${port}/events`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ type: "exitField" }),
			})
		}
	};
	$(document).on("keydown", f.keydownEvent);
	f.tabAdd();
})();
