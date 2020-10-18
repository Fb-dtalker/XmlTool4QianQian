const fs = require('fs');
const xmldoc = require('xmldoc');

//工具类，都能调用
class Utils {
    static IsUndefined(target) {
        return typeof(target) == "undefined";
    }

    static IsString(target) {
        return typeof target === "string";
    }

    static IsFunction(target) {
        return typeof target === "function";
    }

    static IsArray(target) {
        if (!Array.isArray) {
            Array.isArray = function(arg) {
                return Object.prototype.toString.call(arg) === '[object Array]';
            };
        }
        return Array.isArray(target)
    }

    static GetType(obj) {
        var type = Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1].toLowerCase();
        if (type === 'string' && typeof obj === 'object') return 'object'; // Let "new String('')" return 'object'
        if (obj === null) return 'null'; // PhantomJS has type "DOMWindow" for null
        if (obj === undefined) return 'undefined'; // PhantomJS has type "DOMWindow" for undefined
        return type;
    }

    static Map2Object(mapObj) {
        let obj = {};
        for (let [key, value] of mapObj) {
            obj[key] = value;
        }
        return obj;
    }

    static Object2Map(obj) {
        let obj_keys = Object.keys(obj);
        let mapObj = new Map();

        for (let item of obj_keys) {
            mapObj.set(item, obj[item]);
        }
        return mapObj;
    }

    static Xml2String(xmlObject) {

        //格式化xml代码
        function formateXml(xmlStr) {
            var text = xmlStr;
            //使用replace去空格
            text = '\n' + text.replace(/(<\w+)(\s.*?>)/g, function($0, name, props) {
                return name + ' ' + props.replace(/\s+(\w+=)/g, " $1");
            }).replace(/>\s*?</g, ">\n<");
            //处理注释
            text = text.replace(/\n/g, '\r').replace(/<!--(.+?)-->/g, function($0, text) {
                var ret = '<!--' + escape(text) + '-->';
                return ret;
            }).replace(/\r/g, '\n');
            //调整格式  以压栈方式递归调整缩进
            var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg;
            var nodeStack = [];
            var output = text.replace(rgx, function($0, all, name, isBegin, isCloseFull1, isCloseFull2, isFull1, isFull2) {
                var isClosed = (isCloseFull1 == '/') || (isCloseFull2 == '/') || (isFull1 == '/') || (isFull2 == '/');
                var prefix = '';
                if (isBegin == '!') { //!开头
                    prefix = setPrefix(nodeStack.length);
                } else {
                    if (isBegin != '/') { ///开头
                        prefix = setPrefix(nodeStack.length);
                        if (!isClosed) { //非关闭标签
                            nodeStack.push(name);
                        }
                    } else {
                        nodeStack.pop(); //弹栈
                        prefix = setPrefix(nodeStack.length);
                    }
                }
                var ret = '\n' + prefix + all;
                return ret;
            });
            var prefixSpace = -1;
            var outputText = output.substring(1);
            //还原注释内容
            outputText = outputText.replace(/\n/g, '\r').replace(/(\s*)<!--(.+?)-->/g, function($0, prefix, text) {
                if (prefix.charAt(0) == '\r')
                    prefix = prefix.substring(1);
                text = unescape(text).replace(/\r/g, '\n');
                var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix) + '-->';
                return ret;
            });
            outputText = outputText.replace(/\s+$/g, '').replace(/\r/g, '\r\n');
            return outputText;
        }

        //计算头函数 用来缩进
        function setPrefix(prefixIndex) {
            var result = '';
            var span = '    '; //缩进长度
            var output = [];
            for (var i = 0; i < prefixIndex; ++i) {
                output.push(span);
            }
            result = output.join('');
            return result;
        }

        //所有浏览器统一用这种方式处理(因为高版本的浏览器都支持)
        var docString = (new XMLSerializer()).serializeToString(xmlObject);
        var doc = new xmldoc.XmlDocument(docString);
        return formateXml(doc.toString({ compressed: true, preserveWhitespace: true, html: true }));
        //return doc.toString({ compressed: true, preserveWhitespace: true, html: true });
    }

    static ReadFileSync(filePath, encoding = 'utf-8') {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, encoding);
        }
        return null;
    }

    static WriteFileSync(filePath, data, encoding = 'utf-8') {
        fs.writeFileSync(filePath, data, encoding = encoding);
    }

    static MkdirSync(dirPath, recursive = true) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, recursive = recursive)
        }
    }

    static Object2Json(obj) {
        return JSON.stringify(obj);
    }

    static Json2Object(json) {
        return JSON.parse(json);
    }

    static Map2Json(map) {
        // DqUtils.ThrowMessageBox("", DqUtils.GetType(map));
        return JSON.stringify([...map]);
    }

    static Json2Map(json) {
        return new Map(JSON.parse(json));
    }
}

//工具类原代码：https://github.com/Fb-dtalker/DesktopQbyElectron