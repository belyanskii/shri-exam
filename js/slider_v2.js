var slider = {

    imgid: 0,
    loadOnStart: 31,
    thumbs: $('.b-thumbs'),
    container: $('.b-slider'),
    windowWidth: $(window).width(),
    thumbsWrap: $('.b-thumbs-wrap'),
    thumbsList: $('.b-thumbs-list'),
    apiUrl: 'http://api-fotki.yandex.ru/api/users/aig1001/album/63684/photos/created/?format=json&callback=?',

    init: function() {
        slider.getData();
        slider.binds();
    },

    getData: function() {
        $.getJSON(slider.apiUrl, function (data) {
            slider.imagesData = data.entries;
            slider.takeFirstImage();
            slider.createThumbs();
            slider.calculate();
            $('.b-thumbs__item').first().addClass('b-thumbs__item-selected');
        });
    },

    createThumbs: function() {
        var thumbsArray = [];
        for (var i = 0; i < slider.loadOnStart; i++) {
            var link = slider.imagesData[i].img.XXS.href,
                alt = slider.imagesData[i].title;

            thumbsArray.push(slider.createItem(link, alt, 'b-thumbs__item', 'b-thumbs__img', i));
        }
        slider.thumbsList.html(thumbsArray);
    },

    takeFirstImage: function() {
        var link = slider.imagesData[slider.imgid].img.L.href,
            alt = slider.imagesData[slider.imgid].title;

        slider.createItem(link, alt, 'b-slider__item', 'b-slider__img', 0).appendTo(slider.container);
    },

    createItem: function (link, alt, itemCls, imgCls, number){
        alt = alt || 'alt';

        var itemWidth;

        if(itemCls === 'b-slider__item') {
            itemWidth = slider.windowWidth;
        }

        return $('<li />',{
            class: itemCls,
            css: ({
                width: itemWidth
            }),
            html: slider.image(link, alt, imgCls),
            onclick: "return {'info' : { 'number' : "+number+", 'nextId' : "+(number + 1)+", 'prevId' : "+(number - 1)+"}}"
        });
    },

    image: function(src, alt, cls){
        return $('<img />', {
            'alt': alt,
            'src': src,
            'class': cls
        });
    },

    calculate: function() {
        slider.halfOfScroll = Math.round(((31 - (slider.thumbsWrap.outerWidth() / $('.b-thumbs__item').outerWidth())) / 2) * 95);
        // calculate point of recreating thumb
    },

    changeImg: function(direction, thumb) {

        var selectedThumb = $('.b-thumbs__item-selected'),
            imageLink,
            imageAlt,
            imageNumber,
            getDirection = function (thumb){
                if(selectedThumb.index() < thumb.index()){
                    return 'next';
                }else{ return 'prev';}
            };

        thumb = thumb || undefined;
        direction = ( direction === 'thumb') ? getDirection(thumb) : direction;


        if (thumb && !thumb.hasClass('b-thumbs__item-selected')){

            imageNumber = thumb[0].onclick().info.number;

        }else if (!selectedThumb.is(':last-child') && direction == 'next'){

            imageNumber = selectedThumb[0].onclick().info.nextId;

        }else if(!selectedThumb.is(':first-child') && direction == 'prev') {

            imageNumber = selectedThumb[0].onclick().info.prevId;

        }

        imageAlt = slider.imagesData[imageNumber].title;
        imageLink = slider.imagesData[imageNumber].img.L.href;

        if (direction == 'next'){

            slider.slideNext(imageLink, imageAlt, imageNumber);

            slider.selectThumb(imageNumber);

        }else if (direction == 'prev'){

            slider.slidePrev(imageLink, imageAlt, imageNumber);

            slider.selectThumb(imageNumber);
        }
    },

    slideNext: function(link, alt, id){
        slider.container
            .append(slider.createItem(link, alt, 'b-slider__item', 'b-slider__img', id))
            .animate({left: "-="+slider.windowWidth+"px"}, 500, function () {
                slider.container.css('left', 0).children().first().remove();
            });


        slider.recreateThumbs(-1);

//        slider.updateUrl(id);
        slider.thumbCentring(id);
    },

    slidePrev: function(link, alt, id){
        slider.container
            .css('left', -slider.windowWidth)
            .prepend(slider.createItem(link, alt, 'b-slider__item', 'b-slider__img', id))
            .animate({left:"+="+slider.windowWidth+"px"}, 500, function () {
                slider.container.css('left', 0).children().last().remove();
            });

        slider.recreateThumbs(1);

//        slider.updateUrl(id);
        slider.thumbCentring(id);
    },

    selectThumb: function(id){

        var item = id - $('.b-thumbs__item').first()[0].onclick().info.number;

        $('.b-thumbs__item').eq(item).addClass('b-thumbs__item-selected').siblings().removeClass('b-thumbs__item-selected');

    },

    thumbCentring: function(id){
        var item = id - $('.b-thumbs__item').first()[0].onclick().info.number,
            selectedLeft = $('.b-thumbs__item').eq(item).position().left;

        if( selectedLeft > (slider.windowWidth / 2) ){
            var calculated = selectedLeft - ((slider.windowWidth - 190) / 2);

            slider.thumbsWrap.animate({
                scrollLeft: calculated
            }, 500);
        }else {
            slider.thumbsWrap.animate({
                scrollLeft: 0
            }, 500);
        }
    },

    // recreate Thumbs - to function who get delta as param.

    recreateThumbs: function(direction){
        console.log('1');

        var scrlLeft = slider.thumbsWrap.scrollLeft(),
            thumbsItem = $('.b-thumbs__item'),
            thumbsItemFirst = thumbsItem.eq(0),// .eq() faster then .first() or .last()
            thumbsItemLast = thumbsItem.eq(30),
            nextId = thumbsItemLast[0].onclick().info.nextId,
            prevId = thumbsItemFirst[0].onclick().info.prevId,
            thumbsItemClass = 'b-thumbs__item',
            currentImageId = $('.b-slider__item')[0].onclick().info.number;

        if( scrlLeft >= slider.halfOfScroll && direction === -1 && nextId <= 99){

            if( nextId === currentImageId ) {
                thumbsItemClass = 'b-thumbs__item b-thumbs__item-selected';
            }

            thumbsItemFirst.remove();

            slider.thumbsList.append(slider.createItem(slider.imagesData[nextId].img.XXS.href, "recreated", thumbsItemClass, 'b-thumbs__img', nextId));

            slider.thumbsWrap.scrollLeft(scrlLeft - 95);
            console.log('2');

        }else if( scrlLeft <= slider.halfOfScroll && direction === 1 && prevId >= 0){

            if( prevId === currentImageId ) {
                thumbsItemClass = 'b-thumbs__item b-thumbs__item-selected';
            }

            thumbsItemLast.remove();

            slider.thumbsList.prepend(slider.createItem(slider.imagesData[prevId].img.XXS.href, "recreated", thumbsItemClass, 'b-thumbs__img', prevId));

            slider.thumbsWrap.scrollLeft(scrlLeft + 95);
            console.log('3');
        }
    },

    thumbsScroll: function(event, delta) {
        console.log(delta);

        var val = slider.thumbsWrap.scrollLeft() - (delta * 50);

        slider.thumbsWrap.scrollLeft(val).scroll(slider.recreateThumbs(delta));

    },

    binds: function() {

        slider.thumbsWrap.mousewheel(function(event, delta) {
            slider.thumbsScroll(event, delta);
        });

        $('body').on('click', '.b-thumbs__item', function () {
            slider.changeImg('thumb', $(this));
        });

//        slider.thumbs.hover(function() {
//            slider.thumbsWrap.toggleClass('b-thumbs--show');
//        });
    }

};

$(window).load(function () {
    slider.init();
    $('.b-nav').addClass('b-nav__active');
});