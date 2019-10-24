// 开发环境 生产环境 路径设置
const BASEURL = process.env.NODE_ENV == 'development' ? 'http://127.0.0.1:4000' : '';

function addUrl(url, obj) {
    if (Object.prototype.toString.call(obj) === '[object Object]') {
        for (let i in obj) {
            obj[i] = addUrl(url, obj[i]);
        }
    } else if (Object.prototype.toString.call(obj) === '[object String]') {
        obj = url + obj;
    }
    return obj;
}

let apiObj = {
    public: {
        test: '/test',
        article_list: '/article/list',
        category: '/category',
        article_details: '/article/details/', // /article/details/:id
        tweet_list: '/tweet/list',
    },
    requireAuth: {
        user: '/userinfo',
        changename: '/modify/name',
        qq: {
            kk: '/dd'
        }
    },
    node: {
        topics: 'https://cnodejs.org/api/v1/topics', // 主题首页
        topics_details: 'https://cnodejs.org/api/v1/topic/', // 主题详情 /api/v1/topic/:id
    }
}

let restful = {
    public: {
        users: '/v1/user/users',
        signUp: '/v1/user/signUp',
        logIn: '/v1/user/logIn',
        logOut: '/v1/user/logOut',
        updateInfo: '/v1/user/updateInfo',
        uploadImg: '/v1/upload/uploadImg',
        tweet: '/v1/tweet/',
        tweetPost: '/v1/tweet/post',
        tweetDelete: '/v1/tweet/delete'
    }
}

// let api = addUrl(apiObj); // 加上BASEURL
let API = apiObj,
    RESTFULAPI = addUrl(BASEURL, restful);

export {
    API,
    RESTFULAPI,
    BASEURL
}