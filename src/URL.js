/*! Palindrom
 * https://github.com/Palindrom/Palindrom
 * (c) 2017 Joachim Wester
 * MIT license
 */

/* URL DOM API shim */
import { resolve, parse } from 'url';

export default function URL(path, baseURL) {
    var urlObj;
    if (baseURL) {
        urlObj = resolve(baseURL, path);
        urlObj = parse(urlObj);
    } else {
        // it's absolute
        urlObj = parse(path);
    }
    /* copy href, protocol, pathname etc.. */
    Object.assign(this, urlObj);
}
