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

(function() {
    document.querySelector('.v1Nh3.kIKUG._bz0w > a').click();
    var likeAndNext = function() {
        try {
            if (document.querySelector('[aria-label="Like"]') &&
                document.querySelector('[aria-label="Like"]').parentNode &&
                document.querySelector('[aria-label="Like"]').parentNode.parentNode &&
                document.querySelector('[aria-label="Like"]').parentNode.parentNode.parentNode &&
                document.querySelector('[aria-label="Like"]').parentNode.parentNode.parentNode.className === 'fr66n') {
                document.querySelector('[aria-label="Like"]').parentNode.parentNode.click();
            }
            setTimeout(function() {
                if (document.querySelector('[aria-label="Unlike"]') &&
                    document.querySelector('[aria-label="Unlike"]').parentNode &&
                    document.querySelector('[aria-label="Unlike"]').parentNode.parentNode &&
                    document.querySelector('[aria-label="Unlike"]').parentNode.parentNode.parentNode &&
                    document.querySelector('[aria-label="Unlike"]').parentNode.parentNode.parentNode.parentNode &&
                    document.querySelector('[aria-label="Unlike"]').parentNode.parentNode.parentNode.parentNode.className === 'fr66n') {
                    if (document.querySelector('svg[aria-label="Next"]').closest('button')) {
                        document.querySelector('svg[aria-label="Next"]').closest('button').click();
                    }
                }
                /** click like button */
                if (document.querySelectorAll('svg[aria-label="Like"][class="_8-yf5 "]')[1]) {
                    document.querySelectorAll('svg[aria-label="Like"][class="_8-yf5 "]')[1].closest('button').click();
                }
            }, 1000);
        } catch {
            document.querySelectorAll('a[class="sqdOP yWX7d     _8A5w5   ZIAjV "]')[0].click();
        }
        setTimeout(likeAndNext, 1000);
    };
    likeAndNext();
})();
