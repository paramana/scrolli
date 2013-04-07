/*
 * Scrolli
 * 
 * Initial code comes from Maarten Baijs
 * http://www.baijs.nl/tinyscrollbar/
 * 
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 * 
 * This version has the following additions:
 * - Is AMD compatible
 * - autohide option
 * - track thumb expands when you hover it
 * 
 */
define(['jquery'], function ($){    
    var scrolliOpt = {     
        axis          : 'y',    // vertical or horizontal scrollbar? ( x || y ).
        wheel         : 40,     // how many pixels must the mouswheel scroll at a time.
        scroll        : true,   // enable or disable the mousewheel.
        lockscroll    : false,  // return scrollwheel to browser if there is no more content.
        size          : 'auto', // set the size of the scrollbar to auto or a fixed number.
        sizethumb     : 'auto', // set the size of the thumb to auto or a fixed number.
        invertscroll  : false,  // Enable mobile invert style scrolling
        autohide      : true,   // Hides the scrollbar when mouseleaves the content area 
        prefix        : '',     // is used to add a prefix whereever is needed
        noSelectClass : 'no-select'
    };

    $.fn.scrolli = function( params ){
        var options = $.extend( {}, scrolliOpt, params );

        this.each( function(){ 
            $( this ).data('scrollibar', new Scrollbar( $( this ), options ) ); 
        });

        return this;
    };

    $.fn.scrolli_update = function(sScroll){
        return $( this ).data( 'scrollibar' ).update( sScroll ); 
    };
    
    $.fn.scrolli_destroy = function(){
        return $( this ).data( 'scrollibar' ).destroy(); 
    };

    function Scrollbar( root, options ) {
        var oSelf       = this,
            oWrapper    = root,
            oWrapperObj = $(root),
            oViewport   = {
                obj: $( '.' + options.prefix + 'viewport', root )
            },
            oContent    = {
                obj: $( '.' + options.prefix + 'overview', root )
            },
            oScrollbar  = {
                obj: $( '.' + options.prefix + 'scrollbar-track', root )
            },
             
            oThumb      = {
                obj: $( '.' + options.prefix + 'thumb', oScrollbar.obj )
            },
                    
            sAxis       = options.axis === 'x',
            sDirection  = sAxis ? 'left' : 'top',
            sSize       = sAxis ? 'Width' : 'Height',
            iScroll     = 0,
            iPosition   = {
                start: 0, 
                now: 0
            },
            iMouse      = {},
            scrollbarVisible = false,
            touchEvents = 'ontouchstart' in document.documentElement,
            hideTimeout = null,
            isover      = false;
            
        function initialize() {
            oSelf.update();
            setEvents();

            return oSelf;
        }

        this.update = function( sScroll ){
            oViewport[ options.axis ] = oViewport.obj[0][ 'offset'+ sSize ];
            oContent[ options.axis ]  = oContent.obj[0][ 'scroll'+ sSize ];
            oContent.ratio            = oViewport[ options.axis ] / oContent[ options.axis ];

            oScrollbar.obj.toggleClass( 'disable', oContent.ratio >= 1 );
            
            var sizeDiff  = options.axis == 'y' 
                                ? (parseInt(oScrollbar.obj.css('top').replace(/px$/, ''), 10)) + (parseInt(oScrollbar.obj.css('bottom').replace(/px$/, ''), 10)) 
                                : (parseInt(oScrollbar.obj.css('left').replace(/px$/, ''), 10)) + (parseInt(oScrollbar.obj.css('right').replace(/px$/, ''), 10)) ;
            
            oScrollbar[ options.axis ] = options.size === 'auto' ? oViewport[ options.axis ] - sizeDiff : options.size;
            oThumb[ options.axis ] = Math.min( oScrollbar[ options.axis ], Math.max( 0, ( options.sizethumb === 'auto' ? ( oScrollbar[ options.axis ] * oContent.ratio ) : options.sizethumb ) ) );
        
            oScrollbar.ratio = options.sizethumb === 'auto' 
                                    ? ( oContent[ options.axis ] / oScrollbar[ options.axis ] ) 
                                    : ( oContent[ options.axis ] - oViewport[ options.axis ] ) / ( oScrollbar[ options.axis ] - oThumb[ options.axis ] );
                                    
            iScroll = ( sScroll === 'relative' && oContent.ratio <= 1 ) ? Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, iScroll )) : 0;
            iScroll = ( sScroll === 'bottom' && oContent.ratio <= 1 ) ? ( oContent[ options.axis ] - oViewport[ options.axis ] ) : isNaN( parseInt( sScroll, 10 ) ) ? iScroll : parseInt( sScroll, 10 );
            
            setSize();
        };
        
        this.destroy = function(){
            oScrollbar.obj.unbind();
            oThumb.obj.unbind();
            oWrapperObj.unbind();
            
            $( "body" ).removeClass( options.noSelectClass );
            $( document ).unbind( 'mousemove', drag );
            $( document ).unbind( 'mouseup', end );
            document.ontouchmove = document.ontouchend = null;
            
            if( options.scroll && window.addEventListener ) {
                oWrapper[0].removeEventListener( 'DOMMouseScroll', wheel, false );
                oWrapper[0].removeEventListener( 'mousewheel', wheel, false );
            }
            else if( options.scroll ) {
                oWrapper[0].onmousewheel = null;
            }
        }
        
        function setSize(){
            var sCssSize = sSize.toLowerCase();

            oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio );
            oContent.obj.css( sDirection, -iScroll );
            iMouse.start = oThumb.obj.offset()[ sDirection ];

            oScrollbar.obj.css( sCssSize, oScrollbar[ options.axis ] );
            oThumb.obj.css( sCssSize, oThumb[ options.axis ] );
        }

        function setEvents(){
            if( ! touchEvents ){
                oThumb.obj.bind( 'mousedown', start );
                oScrollbar.obj.bind( 'mouseup', drag );
            }
            else{
                oViewport.obj[0].ontouchstart = function( event ){   
                    if( 1 === event.touches.length ) {
                        start( event.touches[ 0 ] );
                        event.stopPropagation();
                    }
                }
            }

            if( options.scroll && window.addEventListener ) {
                oWrapper[0].addEventListener( 'DOMMouseScroll', wheel, false );
                oWrapper[0].addEventListener( 'mousewheel', wheel, false );
                oWrapper[0].addEventListener( 'MozMousePixelScroll', function( event ){
                    event.preventDefault();
                }, false);
            }
            else if( options.scroll ) {
                oWrapper[0].onmousewheel = wheel;
            }
            
            oScrollbar.obj
                .bind({
                    'mouseenter': function(){
                        oScrollbar.obj.addClass('track-over');
                    },
                    'mouseleave':  function(){
                        oScrollbar.obj.removeClass('track-over');
                    }
                });
                
            oWrapperObj
                .bind({
                    'mouseenter': function(){
                        isover = true;
                        showScrollbar();
                    },
                    'mouseleave':  function(){
                        isover = false;
                        hideScrollbar();
                    }
                });
        }
        
        function hideScrollbar() {
            if (!scrollbarVisible || isover) 
                return false;
            
            scrollbarVisible = false;
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            
            hideTimeout = setTimeout(function(){
                oScrollbar.obj.stop().fadeOut(250, function(){
                    oScrollbar.obj.addClass('hidden-elem');
                });
            }, 750);
            
            return true;
        }; 
        
        function showScrollbar() {
            if (scrollbarVisible) 
                return false;
            
            scrollbarVisible = true;
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            
            oScrollbar.obj.stop().fadeIn().removeClass('hidden-elem');
            
            if (options.autohide)
                hideScrollbar();
            
            return true;
        };
        
        function start( event ) {
            $( "body" ).addClass( options.noSelectClass );

            var oThumbDir   = parseInt( oThumb.obj.css( sDirection ), 10 );
            iMouse.start    = sAxis ? event.pageX : event.pageY;
            iPosition.start = oThumbDir === 'auto' ? 0 : oThumbDir;
            
            if( ! touchEvents ) {
                $( document ).bind( 'mousemove', drag );
                $( document ).bind( 'mouseup', end );
                oThumb.obj.bind( 'mouseup', end );
            }
            else{
                document.ontouchmove = function( event ){
                    event.preventDefault();
                    drag( event.touches[ 0 ] );
                };
                document.ontouchend = end;        
            }
        }

        function wheel( event ) {
            if( oContent.ratio < 1 ){
                var oEvent = event || window.event,
                    iDelta = oEvent.wheelDelta ? oEvent.wheelDelta / 120 : -oEvent.detail / 3;

                iScroll -= iDelta * options.wheel;
                iScroll = Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, iScroll ));

                oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio );
                oContent.obj.css( sDirection, -iScroll );

                if( options.lockscroll || ( iScroll !== ( oContent[ options.axis ] - oViewport[ options.axis ] ) && iScroll !== 0 ) ){
                    oEvent = $.event.fix( oEvent );
                    oEvent.preventDefault();
                }
            }
        }

        function drag( event ) {
            if( oContent.ratio < 1 ) {
                if( options.invertscroll && touchEvents )
                    iPosition.now = Math.min( ( oScrollbar[ options.axis ] - oThumb[ options.axis ] ), Math.max( 0, ( iPosition.start + ( iMouse.start - ( sAxis ? event.pageX : event.pageY ) ))));
                else
                    iPosition.now = Math.min( ( oScrollbar[ options.axis ] - oThumb[ options.axis ] ), Math.max( 0, ( iPosition.start + ( ( sAxis ? event.pageX : event.pageY ) - iMouse.start))));

                iScroll = iPosition.now * oScrollbar.ratio;
                oContent.obj.css( sDirection, -iScroll );
                oThumb.obj.css( sDirection, iPosition.now );
            }
        }
        
        function end() {
            $( "body" ).removeClass( options.noSelectClass );
            $( document ).unbind( 'mousemove', drag );
            $( document ).unbind( 'mouseup', end );
            oThumb.obj.unbind( 'mouseup', end );
            document.ontouchmove = document.ontouchend = null;
        }
        
        return initialize();
    }    
    
    return {};
});