App.Data = (function(lng, app, undefined) {
  var Store = function(){
    var hash = {};
    this.count = 0;
    this.has_key = function(key) {
      return key in hash;
    };
    this.fetch = function(key) {
      return hash[key];
    };
    this.push = function(key, obj) {
      if(!(key in hash)) {
        hash[key] = obj;
        this.count++;
        return true;
      }
      return false;
    };
    this.remove = function(key) {
      if(key in hash) {
        delete hash[key];
        this.count--;
        return true;
      }
      return false;
    };
  };

  var User = (function() {
    var users = new Store();
    var events = new app.ChatEvents({
      create: 'user_create',
      update: 'user_update',
      remove: 'user_remove'
    });
    function User(u, is_self) {
      var user = users.fetch(u.id);
      if(user == null) {
        this.active = true;
        this.isSelf = is_self;
        this.id     = u.id;
        this.mac    = u.mac;
        this.name   = u.hostname;
        this.ip     = u.ip;
        this.save();
        user = this;
      } else {
        user.activate();
      }
      return user;
    }
    User.prototype = {
      constructor: User,
      key: function() {
        return this.id;
      },
      save: function() {
        if(users.push(this.key(), this)) {
          events.fire('create', this);
        }
      },
      activate: function() {
        if(!this.active) {
          this.active = true;
          events.fire('update', this);
        }
      },
      deactivate: function() {
        if(this.active) {
          this.active = false;
          events.fire('update', this);
        }
      }
    };
    User.find = function(id) {
        return users.fetch(id);
    };
    User.remove = function(id) {
      var user = this.find(id);
      if(user) {
        user.deactivate();
        users.remove(user.key());
        events.fire('remove', user);
      }
    };
    User.count = function() {
      return users.count;
    };
    User.Events = {subscribe: events.subscribe};

    return User;
  })();

  var Message = (function(){
    var messages = new Store();
    var events = new app.ChatEvents({
      create: 'message_create'
    });

    function Message(user_id, message) {
      this.id = messages.count;
      this.user_id = user_id;
      this.message = message;
      this.user = User.find(this.user_id);
      this.save();
    }
    Message.prototype = {
      constructor: Message,
      save: function() {
        if(messages.push(this.key(), this)) {
          events.fire('create', this);
        }
      },
      key: function() {
        return this.id;
      },
      count: function() {
        return messages.count;
      }
    };
    Message.send = function(message) {
      app.Services.wsocket.send(
        {type: 'message', data: {message: message}}
      );
    };
    Message.count = function() {
      return messages.count;
    };
    Message.Events = {subscribe: events.subscribe};

    return Message;
  })();

  return {
      User: User,
      Message: Message
  }

})(LUNGO, App);