import Mock from 'mockjs';

Mock.setup({
    timeout: '800 - 1200'
})

// const category = [{
//         id: '1',
//         name: "html"
//     }, {
//         id: '2',
//         name: "css"
//     }, {
//         id: '3',
//         name: "javascript"
//     }, {
//         id: '4',
//         name: "node.js"
//     },
//     {
//         id: '5',
//         name: "php"
//     },
//     {
//         id: '6',
//         name: "java"
//     }
// ];

const category = [

    {
        id: '1',
        name: '',
        tab: '全部'
    },
    {
        id: '2',
        name: "good",
        tab: '推荐'
    }, {
        id: '3',
        name: "share",
        tab: '分享'
    }, {
        id: '4',
        name: "ask",
        tab: '问答'
    }, {
        id: '5',
        name: "job",
        tab: '招聘'
    }
];

Mock.mock('/category', 'get', {
    code: 0,
    msg: '获取分类成功',
    'data': category
})

Mock.mock(/\/article\/list/, 'get', function (option) {

    const res = /\/article\/list\/(\d+)/.exec(option.url);
    //  console.log(res[1])

    return Mock.mock({
        code: 0,
        msg: '获取文章列表成功',
        'data|10': [{
            category_id: res[1],
            id: '@increment(1)',
            title: '@cparagraph(1, 3)',
            paragraph: '@cparagraph(1, 5)',
            author: '@cname',
            date: '@datetime',
            author_head: '@image(100x100)',
            image: '@image',
            "hasImg|1-2": true,
            'lick|1-100': 100,
            'comment|1-100': 100
        }]
    });

})

Mock.mock(/\/article\/details/, 'get', function (option) {

    const res = /\/article\/details\/(\d+)/.exec(option.url);

    return Mock.mock({
        code: 0,
        msg: '获取文章详情成功',
        'data': {
            id: res[1],
            title: '@cparagraph(1, 2)',
            paragraph: '@cparagraph(6,12)',
            author: '@cname',
            date: '@datetime',
            author_head: '@image(100x100)',
            image: '@image',
            "hasImg|1-2": true,
            'lick|1-100': 100,
            'comment|1-100': 100
        }
    });

})

Mock.mock('/tweet/list', 'get', function () {

    return Mock.mock({
        code: 0,
        msg: '获取社区动态成功',
        'data|3': [{
            id: '@increment(1)',
            title: '@cparagraph(1, 3)',
            author: '@cname',
            date: '@datetime',
            author_head: '@image(100x100)',
            image: '@image',
            "hasImg|1-2": true,
            "count_img|1-9": 1,
            'lick|1-100': 100,
            'comment|1-100': 100
        }]
    });

})