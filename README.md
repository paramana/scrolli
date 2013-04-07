Scrolli - A jQuery Scrollbar
=======

A simple jQuery plugin for custom scrollbars
An iOS style is included.


## Dependencies

* jQuery 1.9+
* Requirejs

## Usage

To add the scrollbar to an element you do:    
`$('#scrollbar').scrolli([options]);`

In the demo you can update your components with bower
Otherwise you need to add query and requirejs manually

## Options

* `axis` :  vertical or horizontal scrollbar ( x || y ). __default__: y

* `wheel` : how many pixels must the mouswheel scroll at a time. __default__: 40

* `scroll` : enable or disable the mousewheel. __default__: true 

* `lockscroll` : return scrollwheel to browser if there is no more         content. __default__: false

* `size` : set the size of the scrollbar to auto or a fixed number. __default__: 'auto'

* `sizethumb` : set the size of the thumb to auto or a fixed number. __default__: 'auto'

* `invertscroll` : Enable mobile invert style scrolling __default__: false

* `autohide` : Hides the scrollbar when mouseleaves the content area __default__: true

* `prefix` : is used to add a prefix whereever is needed __default__: ''

* `noSelectClass` :  __default__: 'no-select'


## TODO

* Destroy function should fall back on using native scrollbars
* Make vertical scrollbars work as the horizontal axis

## Author

Initial code taken from 
[Maarten Baijs](http://www.baijs.nl/tinyscrollbar/)    

Updated by [@giannis](https://github.com/giannis/)

## Copyright

Dual licensed under the MIT or GPL Version 2 licenses.

 * [mit-license](http://www.opensource.org/licenses/mit-license.php)
 * [gpl-2.0](http://www.opensource.org/licenses/gpl-2.0.php)