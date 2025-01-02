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
            "body > div.x14dbnvc.x67yw2k.x1f1tace.x1xb1xrg.xz3gdfk.xbi9o00.x1dbek64.x4666fc.x1n2onr6.xzkaem6 > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div > div > div:nth-child(1) > div > div > div._aaqg._aaqh > button > div > span > svg[aria-label='Next']"
        ).parentNode.parentNode.parentNode;
        const close = findElement(
            "body > div.x14dbnvc.x67yw2k.x1f1tace.x1xb1xrg.xz3gdfk.xbi9o00.x1dbek64.x4666fc.x1n2onr6.xzkaem6 > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x160vmok.x10l6tqk.x1eu8d0j.x1vjfegm > div > div > svg[aria-label='Close']"
        ).parentNode;
        clickElement(next || close);
    };
    const like = async () => {
        await wait(500);
        const addHeart = findElement(
            "body > div.x14dbnvc.x67yw2k.x1f1tace.x1xb1xrg.xz3gdfk.xbi9o00.x1dbek64.x4666fc.x1n2onr6.xzkaem6 > div.x9f619.x1n2onr6.x1ja2u2z > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div > div > div.xb88tzc.xw2csxc.x1odjw0f.x5fp0pe.x1qjc9v5.xjbqb8w.x1lcm9me.x1yr5g0i.xrt01vj.x10y3i5r.xr1yuqi.xkrivgy.x4ii5y1.x1gryazu.x15h9jz8.x47corl.xh8yej3.xir0mxb.x1juhsu6 > div > article > div > div.x1qjc9v5.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x78zum5.xdt5ytf.x1iyjqo2.x5wqa0o.xln7xf2.xk390pu.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x65f84u.x1vq45kp.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x11njtxf > div > div > div.x78zum5.xdt5ytf.x1q2y9iw.x1n2onr6.xh8yej3.x9f619.x1iyjqo2.x18l3tf1.x26u7qi.xy80clv.xexx8yu.x4uap5.x18d9i69.xkhd6sd > section.x78zum5.x1q0g3np.xwib8y2.x1yrsyyn.x1xp8e9x.x13fuv20.x178xt8z.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xo1ph6p.x1pi30zi.x1swvt13 > span.x1rg5ohu.xp7jhwk > div > div > div"
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
