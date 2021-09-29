(function(){
    document.querySelector('.v1Nh3.kIKUG._bz0w > a').click();
    var likeAndNext = function(){
        if(document.querySelector('[aria-label="Like"]').parentNode.parentNode.parentNode.parentNode.className === 'fr66n'){
            document.querySelector('[aria-label="Like"]').parentNode.parentNode.parentNode.click();
        }
        setTimeout(function(){
            if(document.querySelector('.coreSpriteRightPaginationArrow')){
                document.querySelector('.coreSpriteRightPaginationArrow').click();
            }
            else {
                window.location.reload;
            }
        },1000)
    };
    setInterval(likeAndNext, 5000);
})();
