javascript: "use strict";

/* MIT License
 *
 * Copyright (c) 2021 gh0$t
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE. */

(() => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const findElement = (selector) => document.querySelector(selector);
    const clickElement = (element) => element && element.click();
    const openImage = async () => {
        const instaImage = findElement("._aagw");
        if (instaImage) {
            await wait(1000);
            clickElement(instaImage);
        }
    };
    const goNextOrClose = async () => {
        await wait(500);
        const next = findElement(
            "[id^='mount_'] > div > div > div.x1n2onr6.x1vjfegm > div > div > div.x78zum5.xdt5ytf.xg6iff7.x1n2onr6.x1ja2u2z > div > div.x6s0dn4.x78zum5.x5yr21d.xl56j7k.x1n2onr6.xh8yej3 > div.x78zum5.xdt5ytf.xch40qd.x1qughib.x10l6tqk.x1nc75zl.xexlgce > div:nth-child(2)"
        );
        const close = findElement(
            "[id^='mount_'] > div > div > div.x1n2onr6.x1vjfegm > div > div > div.x78zum5.xdt5ytf.xg6iff7.x1n2onr6.x1ja2u2z > div > div.x6s0dn4.x78zum5.x5yr21d.xl56j7k.x1n2onr6.xh8yej3 > div.x10l6tqk.x1nc75zl.xi3dyvs.x1mywscw > div"
        );
        clickElement(next || close);
    };
    const like = async () => {
        await wait(500);
        const addHeart = findElement(
            "[id ^= 'mount_'] > div > div > div.x1n2onr6.x1vjfegm > div > div > div.x78zum5.xdt5ytf.xg6iff7.x1n2onr6.x1ja2u2z > div > div.x6s0dn4.x78zum5.x5yr21d.xl56j7k.x1n2onr6.xh8yej3 > div.x1y0lptx.x78zum5.xcdomlo.xdt5ytf.x10l6tqk.x100vrsf > div.html-div.xe8uvvx.xdj266r.x11i5rnm.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x6s0dn4.x1ypdohk.x78zum5.xdt5ytf.xieb3on > span > div"
        );
        const addHeartFlag =
            addHeart && addHeart.querySelector('svg[aria-label="Like"]');
        if (addHeartFlag) {
            clickElement(addHeart);
        }
    };
    const likeAndNext = async () => {
        await like();
        await goNextOrClose();
        setTimeout(likeAndNext, 500);
    };
    openImage();
    setTimeout(likeAndNext, 1000);
})();
