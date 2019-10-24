// function m (s) {
//     let patrn = /^[a-zA-Z]{1}([a-zA-Z0-9]|[._$@#*]){6,11}$/;
//     // if (!patrn.exec(s)) return false
//     // return true
// }

// 6-12位字母数字“.”、“*”、“#”、“$”、“@”组合的字符
// function d (s) {
//     let reg = /^([a-zA-Z0-9_-]|[.*#$@]){6,12}$/;
//     if (!reg.exec(s)) return false
//     return true
// }

//  function d(s) {
//     let reg = /^([a-zA-Z0-9]|[-_]){6,12}$/;
//     // if (!reg.exec(s)) return false
//     // return true

//     console.log("reg.exec(s)",reg.exec(s))
// }


let user = {
    name: "小明",
    sex: "男",
}

let news = {
    name: "小红",
    sex: "女",
    age: 12,
}

function assign(target, ...soure) {

    Object.assign(target, ...soure);
}

assign(user,"sss")

console.log("user", user)
console.log("news", news)