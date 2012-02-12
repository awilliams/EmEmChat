App.Events = (function(lng, app, undefined) {
    /* DOM EVENTS */
    lng.dom(document).ready(function(){
      App.View.Input.disable();
      App.Services.wsocket.connect();
    });
    app.View.Input.onInput(function(event) {
        app.View.Input.disable();
        app.Data.Message.send(app.View.Input.value());
        app.View.Input.enable();
    });

    /* SOCKET EVENTS */
    var max_attempts_before_alert = 4;
    app.Services.wsocket.Events.subscribe('before_connect', function(event) {
      var connect_attempts = event.context.connect_attempts();
      if(connect_attempts == 1) {
        app.View.Info.warn('Connecting', 'Please wait', 0.5, false, 'time');
      } else if(connect_attempts >= (max_attempts_before_alert + 1)) {
        app.View.Info.warn('Retrying to connect', 'Please wait', 1, false, 'time');
      }
    });
    app.Services.wsocket.Events.subscribe('after_connect', function(event){
      app.View.Input.enable();
      app.View.Info.hide();
      setTimeout(App.View.Effects.fadeInTitle, 1000);
    });
    app.Services.wsocket.Events.subscribe('disconnect', function(event){
      app.View.Input.disable();
      if(event.context.connect_attempts() >= max_attempts_before_alert) {
        app.View.Info.warn('Unable to connect',  'Retrying in ' + event.context.retry_in_seconds() + 's', 1, false);
      }
    });
    app.Services.wsocket.Events.subscribe('fail_connect', function(event){
      app.View.Info.warn('Failed to connect', '', 10, true);
    });

    /* USER EVENTS */
    app.Data.User.Events.subscribe('create', function(event){
      app.View.User.setConnectedCount(app.Data.User.count());
      app.View.User.render(event.context);
    });
    app.Data.User.Events.subscribe('remove', function(event){
      app.View.User.setConnectedCount(app.Data.User.count());
      app.View.User.render(event.context);
    });

    /* MESSAGE EVENTS */
    app.Data.Message.Events.subscribe('create', function(event){
      app.View.Message.render(event.context);
    });

    return {

    }

})(LUNGO, App);
