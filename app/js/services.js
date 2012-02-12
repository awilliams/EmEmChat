App.Services = (function(lng, app, undefined) {

  var Message = {
    join: function(data) {
      new app.Data.User(data.user, data.is_self);
    },
    leave: function(data) {
      app.Data.User.remove(data.id);
    },
    message: function(data) {
      new app.Data.Message(data.user_id, data.message);
    }
  };

  var chat_wsocket = (function() {
    var Socket = "MozWebSocket" in window ? MozWebSocket : WebSocket;
    var events = new app.ChatEvents({
      before_connect: 'wsocket_before_connect',
      after_connect: 'wsocket_after_connect',
      disconnect: 'wsocket_disconnect',
      fail_connect: 'wsocket_fail_connect'
    });
    var ws = null;
    var connect_attempts = 0;

    var active = function() {
      return ws != null && ws.readyState == Socket.OPEN;
    };

    var connect = function() {
      if (!active()) {
        connect_attempts++;
        events.fire('before_connect', chat_wsocket);
        ws = new Socket("ws://" + lng.App.get('ws_host') + ":" + lng.App.get('ws_port') + "/");
        ws.onopen = on_open;
        ws.onclose = on_close;
        ws.handle_result = handle_result;
        ws.send_json = send_json;
        ws.onmessage = on_message;
      }
    };

    var retry_in_seconds = function() {
      return (connect_attempts <= lng.App.get('max_retries')) ? (connect_attempts * 2) : false;
    };

    var on_open = function() {
      connect_attempts = 0;
      events.fire('after_connect', chat_wsocket);
    };
    var on_close = function() {
      var timeout = retry_in_seconds();
      if (timeout !== false) {
        setTimeout(connect, timeout * 1000);
        events.fire('disconnect', chat_wsocket);
      } else {
        events.fire('fail_connect', chat_wsocket);
      }
    };
    var send_json = function(msg) {
      ws.send(JSON.stringify(msg));
    };
    var handle_result = function(result) {
      return Message[result.type](result.data);
    };
    var on_message = function(evt) {
      var result, error = false;
      try {
        result = JSON.parse(evt.data);
      }
      catch (e) {
        error = e;
      }
      if (error) {
        // TODO
      } else {
        if (lng.Core.toType(result) === 'array') {
          $$.each(result, function(i) {
            handle_result(result[i]);
          });
        } else {
          handle_result(result);
        }
      }
    };

    return {
      active: active,
      connect: connect,
      connect_attempts: function() {
        return connect_attempts
      },
      retry_in_seconds: retry_in_seconds,
      send: send_json,
      Events: {subscribe: events.subscribe}
    };
  })();

  return {
    wsocket: chat_wsocket
  }

})(LUNGO, App);