import Vue from 'vue'

let tools = {};

// 用户密码是6-12个字符，只能包含字母、数字、“_”、“-”、“@”
tools.isRegPwd = (s) => {
    let reg = /^([a-zA-Z0-9_-]|[@]){6,12}$/;
    if (!reg.exec(s)) return false
    return true
}

// 用户账号是2-12个字符，只能包含字母、数字、下划线
tools.isRegName = (s) => {
    let reg = /^([a-zA-Z0-9]|[_]){2,12}$/;
    if (!reg.exec(s)) return false
    return true
}

// 用户昵称是1-12个字符，只能包含中文、字母、数字、下划线
tools.isRegNickName = (s) => {
    let reg = /[\u4e00-\u9fa5_a-zA-Z0-9_]{1,12}$/;
    if (!reg.exec(s)) return false
    return true
}

// 6-12个以字母开头、可带数字、“_”、“.”的字符
tools.isRegUserName = (s) => {
    let reg = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._]){6,11}$/;
    if (!reg.exec(s)) return false
    return true
}

tools.isUndefined = (s) => {
    return Object.prototype.toString.call(s) === "[object Undefined]";
}

tools.isNull = (s) => {
    return s === null || s === undefined || s.replace(/\s/g,"") ==='';
}

tools.setStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    return tools.getStorage(key);
}

tools.getStorage = (key) => {
    return JSON.parse(localStorage.getItem(key));
}

tools.removeStorage = (key) => {
    localStorage.removeItem(key)
};

tools.clearStorage = () => {
    localStorage.clear();
}

// 获取过去的时间
tools.timeAgo = (timeStamp) => {
    // timeStamp： 毫秒级时间戳
    let diffValue = new Date().getTime() - timeStamp;

    if (diffValue < 0) {
        return '';
    }

    let year = diffValue / (1000 * 60 * 60 * 24 * 365),
        month = diffValue / (1000 * 60 * 60 * 24 * 30),
        week = diffValue / (1000 * 60 * 60 * 24 * 7),
        day = diffValue / (1000 * 60 * 60 * 24),
        hour = diffValue / (1000 * 60 * 60),
        min = diffValue / (1000 * 60);

    if (year >= 1) {
        // return parseInt(year) + "年前";
        return tools.dateGet(timeStamp).date_time;
    } else if (month >= 1) {
        // return parseInt(month) + "月前";
        return tools.dateGet(timeStamp).date_time;
    } else if (week >= 1) {
        // return parseInt(week) + "周前";
        return tools.dateGet(timeStamp).date_time;
    } else if (day >= 1) {
        // return parseInt(day) + "天前";
        return tools.dateGet(timeStamp).date_time;
    } else if (hour >= 1) {
        return parseInt(hour) + "小时前";
    } else if (min >= 1) {
        return parseInt(min) + "分钟前";
    } else return "刚刚";
}

// 时间日期 转 毫秒时间戳
tools.getTimeStamp = (dateStr) => {
    return Date.parse(dateStr.replace(/-/gi, "/"));
}

/* 获取日期、时间
 *@method dateGet
 *@timestamp 13位数，数字类型毫秒级时间戳
 *@return {object}  dayOfweek：星期几
 */
tools.dateGet = (timestamp = '') => {
    let date = timestamp != '' ? new Date(timestamp) : new Date,
        year = date.getFullYear(),
        month = add0(date.getMonth() + 1),
        day = add0(date.getDate()),
        hour = add0(date.getHours()),
        minute = add0(date.getMinutes()),
        second = add0(date.getSeconds()),
        dayOfweek = date.getDay() === 0 ? 7 : date.getDay();

    function add0(n) {
        return n < 10 ? n = '0' + n : n;
    }

    return {
        year,
        month,
        day,
        hour,
        minute,
        second,
        dayOfweek,
        date_time: `${year}/${month}/${day} ${hour}:${minute}:${second}`,
    }
}

/* 获取base64编码图片的格式
 *@method getImageFormat
 *@base64{base64} 
 *@return {String|null}
 */
tools.getImageFormat = (base64) => {
    let reg = /^data:image\/(\w+);base64,/i;
    let result = reg.exec(base64);
    if (result !== null) {
        return result[1].toLowerCase();
    }
    return result;
}

/* 添加历史记录，替换历史记录，用于在当前页面点击返回时不跳转
 *@method pushState
 *@virtualURL 虚拟显示的url
 *@URL 把虚拟url替换成的真正的URL
 */
tools.pushState = (virtualURL = document.URL, URL = document.URL) => {
    if (window.history && window.history.pushState) {
        // 添加历史记录
        history.pushState(null, null, virtualURL);
        // 替换历史记录
        history.replaceState(null, null, URL);
    } else {
        return "不支持window.history && window.history.pushState"
    }
}

tools.install = function (Vue, options) {
    Vue.prototype.$tools = tools; // 组件内调用 this.$tools.fn()
    Vue.tools = tools; // 模块内调用 Vue.tools.fn()
}

Vue.use(tools);

export default tools