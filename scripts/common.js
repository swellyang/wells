var url_refix = "http://localhost:8081";

function setToken(token) {
	window.localStorage.setItem("token", token);
}

function getToken() {
	var token = window.localStorage.getItem("token");
	return token;
}

/**
 * ----------------------------------------------------------------------------------------------
 * ------------------------ 扩展jQuery的Ajax方法 -------------------------------------------------
 * ----------------------------------------------------------------------------------------------
 */
$.extend({
	ajaxGet: function(url, data, callback) {
		if (!url.startsWith(url_refix)) {
			url = url_refix + url;
		}
		$.ajax({
			url: url,
			type: "get",
			data: data,
			dataType: "json",
			headers: {
				Auth: getToken()
			}, // 保留headers，后期可能会用到headers传递token
			xhrFields: {
				// 设置为true，避免跨域清空下漏传session
				withCredentials: true
			},
			timeout: 10000,
			success: function(rs) {
				if (callback) {
					callback(rs);
				}
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log("ajax get error");
				console.log(xhr);
			}
		});
	},
	ajaxPost: function(url, data, callback) {
		if (!url.startsWith(url_refix)) {
			url = url_refix + url;
		}
		$.ajax({
			url: url,
			type: "post",
			data: data,
			dataType: "json",
			headers: {
				Auth: getToken()
			},
			xhrFields: {
				// 设置为true，避免跨域情况下漏传session
				withCredentials: true
			},
			timeout: 10000,
			success: function(rs) {
				if (callback) {
					callback(rs);
				}
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log("ajax post error");
				console.log(xhr);
			}
		});
	},
	ajaxPostBody: function(url, data, callback) {
		if (!url.startsWith(url_refix)) {
			url = url_refix + url;
		}
		$.ajax({
			url: url,
			type: "post",
			data: data,
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			headers: {
				Auth: getToken()
			},
			xhrFields: {
				// 设置为true，避免跨域清空下漏传session
				withCredentials: true
			},
			timeout: 10000,
			success: function(rs) {
				if (callback) {
					callback(rs);
				}
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log("ajax post error");
				console.log(xhr);
			}
		});
	}
});

/**
 * ----------------------------------------------------------------------------------------------
 * ------------------------ 时间格式化
 * -------------------------------------------------
 * ----------------------------------------------------------------------------------------------
 */
Date.prototype.pattern = function(fmt) {
	if (!fmt) {
		fmt = "yyyy-MM-dd HH:mm:ss";
		// fmt = "yyyy-MM-dd";
	}
	var o = {
		"M+": this.getMonth() + 1, // 月份
		"d+": this.getDate(), // 日
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, // 小时
		"H+": this.getHours(), // 小时
		"m+": this.getMinutes(), // 分
		"s+": this.getSeconds(), // 秒
		"q+": Math.floor((this.getMonth() + 3) / 3), // 季度
		S: this.getMilliseconds()
		// 毫秒
	};
	var week = {
		"0": "/u65e5",
		"1": "/u4e00",
		"2": "/u4e8c",
		"3": "/u4e09",
		"4": "/u56db",
		"5": "/u4e94",
		"6": "/u516d"
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(
			RegExp.$1,
			(this.getFullYear() + "").substr(4 - RegExp.$1.length)
		);
	}
	if (/(E+)/.test(fmt)) {
		fmt = fmt.replace(
			RegExp.$1,
			(RegExp.$1.length > 1 ?
				RegExp.$1.length > 2 ?
				"/u661f/u671f" :
				"/u5468" :
				"") + week[this.getDay() + ""]
		);
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(
				RegExp.$1,
				RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
			);
		}
	}
	return fmt;
};


//格式化代码函数,已经用原生方式写好了不需要改动,直接引用就好
var formatJson = function(json, options) {
	var reg = null,
		formatted = '',
		pad = 0,
		PADDING = '    ';
	options = options || {};
	options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true :
		false;
	options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
	if (typeof json !== 'string') {
		json = JSON.stringify(json);
	} else {
		json = JSON.parse(json);
		json = JSON.stringify(json);
	}
	reg = /([\{\}])/g;
	json = json.replace(reg, '\r\n$1\r\n');
	reg = /([\[\]])/g;
	json = json.replace(reg, '\r\n$1\r\n');
	reg = /(\,)/g;
	json = json.replace(reg, '$1\r\n');
	reg = /(\r\n\r\n)/g;
	json = json.replace(reg, '\r\n');
	reg = /\r\n\,/g;
	json = json.replace(reg, ',');
	if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
		reg = /\:\r\n\{/g;
		json = json.replace(reg, ':{');
		reg = /\:\r\n\[/g;
		json = json.replace(reg, ':[');
	}
	if (options.spaceAfterColon) {
		reg = /\:/g;
		json = json.replace(reg, ':');
	}
	(json.split('\r\n')).forEach(function(node, index) {
		//console.log(node);
		var i = 0,
			indent = 0,
			padding = '';

		if (node.match(/\{$/) || node.match(/\[$/)) {
			indent = 1;
		} else if (node.match(/\}/) || node.match(/\]/)) {
			if (pad !== 0) {
				pad -= 1;
			}
		} else {
			indent = 0;
		}

		for (i = 0; i < pad; i++) {
			padding += PADDING;
		}

		formatted += padding + node + '\r\n';
		pad += indent;
	});
	return formatted;
};
