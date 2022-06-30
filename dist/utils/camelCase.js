"use strict";
function toCamelCase(str) {
    let newStr = '';
    if (str) {
        let wordArr = str.split(/[-_]/g);
        for (let i in wordArr) {
            if (parseInt(i, 10) > 0) {
                newStr += wordArr[i].charAt(0).toUpperCase() + wordArr[i].slice(1);
            }
            else {
                newStr += wordArr[i];
            }
        }
    }
    else {
        return newStr;
    }
    return newStr;
}
