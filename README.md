# EmEmChat = Embeded EventMachine Chat #

EmEmChat is a server written in Ruby using EventMachine and Em-Websocket, and a client written in HTML/Javascript using Lungo.js. The entire thing can be run off a router using OpenWRT.

#### Usage

**Locally**

 * Use ruby 1.9.2
 * `bundle install`
 * `bundle exec ruby -I . server.rb dev`
 * Open app/index.html from a websocket able browser (newer Chrome, Firefox, ...)

**On a router**

See [ruby-openwrt](https://github.com/awilliams/ruby-openwrt) for more info on embedding EmEmChat in a router.

  * `ruby -I . server.rb`


![HG536+](https://github.com/awilliams/ruby-openwrt/raw/master/docs/hg_536_plus.JPG)

