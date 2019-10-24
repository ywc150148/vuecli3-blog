/**
 * FileName: img-compress.js
 * Author: 复制网上的代码改写的
 * Date: 2019.10.11 17:26:55
 * Description：图片压缩，将base64编码格式的图片使用canval绘制后获取，按需求设置绘制大小，绘制质量。
 * @param {*} path 图片路径base64
 * @param {*} params 压缩图片的参数
 * @params.width: 生成图片宽度，默认原图宽度，最大宽度1024
 * @params.height: 生成图片高度，默认原图高度
 * @params.quality: 生成图片质量，默认值0.7，取值范围0-1，取值过低图片会很模糊
 * @params.maxSize: 限制图片大小，默认值1024*1024字节，即(1MB)，单位字节，生成图片后的，超出限制值会返回状态
 * @params.ignoredArr: 忽略的格式，不压缩此格式图片,默认值['gif']，不压缩gif格式的图片
 * 返回值：code: 成功：0，失败：1
          msg: 消息
          size: 图片压缩后的大小，单位B
          format: 图片格式
          base64: 图片压缩后的base64
          KB: 图片大小，单位kb
 */

function compress(path, params = '') {

    return new Promise((resolve, reject) => {

        try {

            let quality = params.quality ? parseFloat(params.quality) : 0.7;
            let maxSize = Number.isFinite(params.maxSize) ? params.maxSize : 1024 * 1024,
                width = params.width ? params.width : '',
                height = params.height ? params.height : '',
                img = new Image(),
                base64, format = getFormat(path),
                ignoredArr = params.ignoredArr || ['gif'];

            if (format !== null && ignoredArr.indexOf(format) >= 0) {
                let pathFile = convertBase64UrlToBlob(path); // 获取图片字节
                let bool = pathFile.size < maxSize, // 是否小于限制字节大小
                    KB = Number.parseFloat((pathFile.size / 1024).toFixed(2)),
                    value = {
                        code: bool ? 0 : 1,
                        msg: bool ? "ok" : "图片过大",
                        size: pathFile.size,
                        format,
                        base64: path,
                        KB
                    };

                !bool && reject(value) || resolve(value);
            }

            quality = Number.isFinite(quality) && quality > 0 && quality < 1 ? quality : 0.7;
            img.src = path;

            img.onload = function () {
                // 默认按比例压缩
                let w = this.width,
                    h = this.height,
                    scale = w / h;
                w = width || (!width && w >= 1024 ? 1024 : w);
                h = height || (w / scale);

                //生成canvas
                let canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d');

                // 创建属性节点
                let anw = document.createAttribute("width"),
                    anh = document.createAttribute("height");

                // 设置canval宽高
                anw.nodeValue = w;
                anh.nodeValue = h;
                canvas.setAttributeNode(anw);
                canvas.setAttributeNode(anh);

                // 绘制图片
                ctx.drawImage(this, 0, 0, w, h);

                base64 = canvas.toDataURL(`image/${format}`, quality); // 获取base64

                let urlFile = convertBase64UrlToBlob(base64),
                    KB = Number.parseFloat((urlFile.size / 1024).toFixed(2)),
                    bool = urlFile.size < maxSize,
                    value = {
                        code: bool ? 0 : 1,
                        msg: bool ? "ok" : "图片过大",
                        size: urlFile.size,
                        format,
                        base64,
                        KB
                    };

                !bool && reject(value) || resolve(value);
            }
        } catch (err) {
            console.log("err", err)
            reject({
                code: 1,
                msg: "发生错误",
                err
            })
        }
    });

    // base64转为file（Blob），计算真实大小，获取图片格式，返回{size, type} 
    function convertBase64UrlToBlob(urlData) {
        var arr = urlData.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], {
            type: mime
        });
    }

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

export default compress