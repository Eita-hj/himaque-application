(async () => {
	const $ = window.jQuery;

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
	let setting = sessionStorage.length ? JSON.parse(sessionStorage.getItem("setting")) : (await fetch("http://127.0.0.1:16762/start").then((n) => n.json()));

	sessionStorage.setItem("setting", JSON.stringify(setting));

	const { port, windowCount, type } = setting;
	
	$(document).on("keydown", (e) => {
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
	})

	const DOM = hcqLinks.slice(0, windowCount).map(n => `<iframe src="${n.url}"></iframe>`)

	$("#gamearea").html(DOM);
	switch (windowCount) {
		case 1:
			$("iframe").css({
				width: "calc(100% - 5px)",
				height: "calc(100% - 10px)",
				border: "none",
			});
			break;
		case 2:
			$("iframe").css({
				width: type == "a" ? "calc(100% - 5px)" : "calc(50% - 5px)",
				height: type == "a" ? "calc(50% - 10px)" : "calc(100% - 10px)",
				border: "none",
			});
			break;
		case 3:
			$("iframe").css({
				width: type == "a" ? "calc(100% - 5px)" :"calc(33% - 5px)",
				height: type == "a" ? "calc(33% - 10px)" : "calc(100% - 10px)",
				border: "none",
			});
			break;
		case 4:
			$("iframe").css({
				width: type == "a" ? "calc(50% - 5px)" : "calc(25% - 5px)",
				height: type == "a" ? "calc(50% - 10px)" : "calc(100% - 10px)",
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
})();
