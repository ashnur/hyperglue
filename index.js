var trumpet = require('trumpet');
var ent = require('ent');
var concat = require('concat-stream');

module.exports = function (html, params) {
    var tr = trumpet();
    Object.keys(params).forEach(function (key) {
        var val = params[key];
        
        tr.select(key, function (node) {
            if (!val) return;
            
            if (typeof val === 'object' && val._html !== undefined) {
                var copy = shallowCopy(val);
                delete copy._html;
                node.update(function (html) {
                    return val._html;
                }, Object.keys(copy).length ? copy : undefined);
            }
            else if (typeof val === 'object' && val._text !== undefined) {
                var copy = shallowCopy(val);
                delete copy._text;
                node.update(
                    ent.encode(String(val._text)),
                    Object.keys(copy).length ? copy : undefined
                );
            }
            else if (typeof val === 'object') {
                var copy = shallowCopy(val);
                Object.keys(node.attributes).forEach(function (key) {
                    copy[key] = node.attributes[key];
                });
                node.update(String, copy);
            }
            else {
                node.update(ent.encode(String(val)));
            }
        });
    });
    
    var body = '';
    tr.pipe(concat(function (err, src) { body = src }));
    tr.end(html);
    return {
        outerHTML: body,
        innerHTML: body
    };
};

function shallowCopy (obj) {
    var res = {};
    Object.keys(obj).forEach(function (key) {
        res[key] = obj[key];
    });
    return res;
}
