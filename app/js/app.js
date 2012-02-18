var App = (function(lng, undefined) {

    var is_local = window.location.host == '';

    lng.App.init({
        url: 'emem.chat',
        ws_host: (is_local ? 'localhost' : '192.168.1.1'),
        ws_port: '8080',
        max_retries: 8,
        debug: is_local,
        is_local: is_local
    });

    if(!lng.App.get('debug') && document.location.hostname.toLowerCase() !=  lng.App.get('url')) {
      document.location = 'http://' + lng.App.get('url');
    }

    var Events = function(hash) {
      var events = {};
      for(var event_key in hash) {
        events[event_key] = $$.Event(hash[event_key]);
      }
      this.fire = function(event_key, event_context) {
        var event = events[event_key];
        if(event) {
          event.context = event_context;
          if(lng.App.get('debug')) {
            console.log(event.type, event);
          }
          return document.dispatchEvent(event);
        }
        return false;
      };
      this.subscribe = function(event_key, callback) {
        var event = events[event_key];
        if(event) {
          return document.addEventListener(event.type, callback, false);
        }
        return false;
      };
    };

    return {
      ChatEvents: Events
    };

})(LUNGO);
