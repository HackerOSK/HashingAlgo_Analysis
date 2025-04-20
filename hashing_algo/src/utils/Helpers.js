function leftRotate(x, c) {
    return ((x << c) | (x >>> (32 - c))) >>> 0;
}

function rightRotate(x, c) {
    return ((x >>> c) | (x << (32 - c))) >>> 0;
}

function wordToHex(word) {
    let hex = '';
    for (let i = 0; i < 4; i++) {
        const byte = (word >>> (i * 8)) & 0xFF;
        hex += (byte < 16 ? '0' : '') + byte.toString(16);
    }
    return hex.match(/../g).reverse().join('');
}

function strToUTF8Array(str) {
    let utf8 = [];
    for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        else {
            // surrogate pair
            i++;
            charcode = ((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff)
            charcode += 0x10000;
            
            utf8.push(0xf0 | (charcode >> 18), 
                      0x80 | ((charcode >> 12) & 0x3f), 
                      0x80 | ((charcode >> 6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

export { leftRotate, rightRotate, wordToHex, strToUTF8Array };
