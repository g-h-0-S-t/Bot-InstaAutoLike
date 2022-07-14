javascript:

'use strict';

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
    document.querySelector('._aagw').click();
    let like = () => {
        if (document.querySelector('._aamu._aat0 [aria-label="Like"]')) {
            document.querySelector('._aamu._aat0 [aria-label="Like"]').closest('button').click();
        }
    };
    let next = () => {
        if (document.querySelectorAll('[aria-label="Next"]')[1]) {
            document.querySelectorAll('[aria-label="Next"]')[1].closest('button').click();
        }
    };
    let close = () => {
        document.querySelector('[aria-label="Close"]').closest('button').click();
    };
    let likeAndNext = () => {
        like();
        setTimeout(function () {
            if (document.querySelector('._aamu._aat0 [aria-label="Unlike"]')) {
                try {
                    next();
                } catch {
                    close();
                }

            } else {
                like();
            }
        }, 1000);
        setTimeout(likeAndNext, 1000);
    };
    likeAndNext();
})();
