import tools from './tools'

let timeAgo = timeStamp => {
    // 毫秒级时间戳 返回多久之前
    if (!timeStamp) return ''
    let ts = tools.getTimeStamp(timeStamp);
    let time = tools.timeAgo(ts);
    return time;
}

let getTimeAgo = (utc) => {
    // utc 时间 2018-03-07T16:00:00.000Z 返回多久之前
    if (!utc) return '';
    return tools.timeAgo(new Date(utc).getTime());
}

let dateGet = (utc) => {
    // utc 时间 返回日期时间
    if (!utc) return '';
    return tools.dateGet(new Date(utc).getTime()).date_time;
}

let totalQuantity = (number) => {
    let n = parseInt(number);
    if (n > 10000) {
        return (n / 10000).toFixed(2) + 'w'
    } else if (n > 1000) {
        return (n / 1000).toFixed(2) + 'k'
    }else{
        return n
    }
}

export default {
    timeAgo,
    getTimeAgo,
    dateGet,
    totalQuantity
}