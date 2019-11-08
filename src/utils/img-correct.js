/**
 * FileName: img-correct.js
 * Author: rocher
 * Date: 2019.10.21 19:19:05
 * Description：修正图片显示方向不正确，依赖插件：exif-js.js，获取图片信息‘Orientation’。
 * @EXIF 依赖 exif-js.js
 * @ file { base64||file}  base64 || e.target.files[0]
 * @w {number} 输出图片的宽度，不传则使用原图宽度
 * 返回值 {Promise}
          code：0 成功 || 1 失败
          msg: 信息
          base64: 图片base64
 */
function imgCorrect(EXIF, file, w = "") {
    return new Promise((resolve, reject) => {

        try {

            if (!EXIF) reject({
                code: 1,
                msg: '需要引入依赖：exif-js.js'
            });

            let width = w,
                Orientation;

            if (/^data:image\/(\w+);base64,/i.test(file)) {
                
                if (getFormat(file) == 'gif') {
                    resolve({
                        code: 0,
                        msg: 'gif',
                        base64: file
                    });
                }
                createImg(file);
            } else if (file.type && /^image/.test(file.type)) {

                // 创建一个reader
                let reader = new FileReader();

                // 转成 base64 格式
                reader.readAsDataURL(file);

                reader.onloadend = function () {

                    if (getFormat(this.result) == 'gif') {
                        resolve({
                            code: 0,
                            msg: 'gif',
                            base64: this.result
                        });
                    }

                    // this.result base64
                    createImg(this.result);
                };
            } else {
                reject({
                    code: 1,
                    msg: '传入的参数不符'
                });
            }

            // 创建图片元素
            function createImg(src) {
                let img = new Image();
                img.src = src;
                img.onload = () => {
                    EXIF.getData(img, function () {
                        // 获取Orientation
                        Orientation = EXIF.getTag(this, 'Orientation');
                    });
                    
                    draw(img);
                }
            }

            // 绘制
            function draw(img) {
                // 输出图片的宽度，默认为原图width
                width = width || img.width;

                let canvas = document.createElement('canvas'), // 生成canvas
                    ctx = canvas.getContext('2d'),
                    scale = img.width / img.height, // 宽高比
                    height = width / scale, // 输入图片高度
                    x = 0, // 绘制坐标 x
                    y = 0; // 绘制坐标 y

                // 设置画布大小
                canvas.width = width;
                canvas.height = height;

                // 图片带有exif的orientation信息，修正图片显示方向，但不修正镜像翻转
                if (Orientation > 1) {

                    x = -width / 2;
                    y = -height / 2;

                    switch (Orientation) {
                        case 3:
                            // 顺时针180度旋转
                            canvas.width = width;
                            canvas.height = height;
                            ctx.translate(width / 2, height / 2);
                            ctx.rotate(Math.PI);
                            break;
                        case 6:
                            // 顺时针90度旋转
                            canvas.width = height;
                            canvas.height = width;
                            ctx.translate(height / 2, width / 2);
                            ctx.rotate(Math.PI / 2);
                            break;
                        case 8:
                            // 顺时针270度旋转
                            canvas.width = height;
                            canvas.height = width;
                            ctx.translate(height / 2, width / 2);
                            ctx.rotate(Math.PI * 1.5);
                            break;
                    }
                }

                // 背景填充
                ctx.fillStyle = "#fff";

                // 绘制图片 [图片，起点坐标x，y，图片宽，高]
                ctx.drawImage(img, x, y, width, height);

                // 获取base64
                let base64 = canvas.toDataURL(`image/jpeg`, 1);

                resolve({
                    code: 0,
                    mag: "ok",
                    base64
                })
            }

        } catch (err) {
            if (!EXIF) reject({
                code: 1,
                msg: '出错',
                err
            });
        }
    })

    // 获取格式
    function getFormat(base64) {
        let reg = /^data:image\/(\w+);base64,/i;
        let result = reg.exec(base64);
        if (result !== null) {
            return result[1]
        }
        return result;
    }
}

export default imgCorrect