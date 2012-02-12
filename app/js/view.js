App.View = (function(lng, app, undefined) {

  var Scroll = function(container) {
    var $container = lng.dom('#' + container),
            $scroller = $container.children().first(),
            $toolbars = lng.dom('footer, header'),
            $container_parent = $container.parent(),
            $container_siblings = $container.siblings();

    var get_container_height = function() {
      var h = $container_parent.height();
      if($toolbars.length > 0) {
        h -= $toolbars.height();
      }
      if($container_siblings.length > 0) {
        h -= $container_siblings.height();
      }
      return h;
    };

    this.refreshHeight = function() {
      $container.style('height', get_container_height() + 'px');
    };
    lng.dom(document).ready(this.refreshHeight);

    this.scroll = new iScroll(container, {
      snap: 'li',
      momentum: true,
      bounce: true,
      hideScrollbar: false,
      hScrollbar: false,
      vScrollbar: true
    });

    this.scrollNeeded = function() {
      return $scroller.height() > $container.height();
    }
  };

  var Message = (function() {
    var scroll = new Scroll('messages'),
      list_id = 'messages_list',
      template_id = 'message',
      user_template_id = 'user_msg',
      previous_user = null,
      $messagesCount = lng.dom('#messages_tab span.bubble.count');

    lng.View.Template.create(template_id,
      '<li id="{{id}}" class="message {{li_class}}">\
        {{name}}\
        {{message}}\
      </li>'
    );

    lng.View.Template.create(user_template_id,
      '<li id="{{id}}" class="user_msg">\
        <div class="onright">\
          <span class="bubble count">\
            <span class="icon {{icon}}"></span>{{action}}\
          </span>\
        </div>\
        {{name}}\
      </li>'
    );

    var previous_even = false;
    var get_li_class = function(user) {
      var even = (previous_user && previous_user == user) ? previous_even : !previous_even;
      previous_even = even;
      var cssclass = even ? 'even' : 'odd';
      if (!previous_user || previous_user != user) {
        cssclass += ' switch';
      }
      return cssclass;
    };

    var get_user_name = function(user) {
      return previous_user != user ? '<div class="onright"><span class="bubble count"><span class="icon chat"></span>' + user.name + '</span></div>' : '';
    };

    var clean_str = function(str) {
      return str.replace(/<(?:.|\n)*?>/gm, '');
    };

    var li_id = 1;
    var get_li_id = function() {
      return "message_" + li_id++;
    };

    var refresh = function(el_id) {
      setTimeout(function () {
        scroll.scroll.refresh();
        if (scroll.scrollNeeded()) {
          scroll.scroll.scrollToElement(document.getElementById(el_id), 750);
        }
      }, 0);
    };

    var render = function(message) {
      var id = get_li_id();
      lng.View.Template.Binding.append(
        list_id,
        template_id,
        {id: id, name: get_user_name(message.user), message: clean_str(message.message), li_class: get_li_class(message.user)}
      );
      previous_user = message.user;
      refresh(id);
      setMessagesCount(app.Data.Message.count());
    };

    var renderUserAction = function(user) {
      if(user.isSelf) {
        return;
      }
      var id = get_li_id();
      var action = 'user ' + (user.active ? 'joined' : 'left');
      var icon = user.active ? 'plus' : 'substract';
      lng.View.Template.Binding.append(
        list_id,
        user_template_id,
        {id: id, icon: icon, name: user.name, action: action}
      );
      refresh(id);
    };

    var setMessagesCount = function(count) {
      $messagesCount.text(String(count));
      //$messagesCount.style('opacity', 0).anim({opacity: 1}, 0.5, 'linear');
    };

    return {
      render: render,
      renderUserAction: renderUserAction
    };
  })();

  var User = (function() {
    var scroll = new Scroll('users'),
            list_id = 'users_list',
            template_id = 'user',
            $connectedCount = lng.dom('#users_tab span.bubble.count');

    lng.View.Template.create(template_id,
      '<li id="user_{{id}}" class="{{user_class}}">\
        <span class="icon user"></span>\
        <div class="onright"><span class="state bubble count online">{{active}}</span></div>\
        {{name}}\
        <small>{{ip}}</small>\
      </li>'
    );

    var user_state = function(user) {
      return user.active ? 'online' : 'offline';
    };

    var user_class = function(user) {
      return user.isSelf ? 'self' : 'other';
    };

    var refresh = function(el_id) {
      setTimeout(function () {
        scroll.scroll.refresh();
        if (scroll.scrollNeeded()) {
          scroll.scroll.scrollToElement(document.getElementById(el_id), 750);
        }
      }, 0);
    };

    var rendered_users = {};
    var render = function(user) {
      var rendered_user = rendered_users[user.id];
      if (rendered_user) {
        var state_span = lng.dom('#user_' + user.id + ' .state');
//        state_span.style('opacity', 0).html(user_state(user)).anim({opacity: 1}, 0.5, 'linear');
        state_span.html(user_state(user));
        if(!user.active) {
          state_span.removeClass('online').addClass('offline');
        } else {
          state_span.removeClass('offline').addClass('online');
        }
      } else {
        lng.View.Template.Binding.append(
                list_id,
                template_id,
                {id: user.id, name: user.name, ip: user.ip, active: user_state(user), user_class: user_class(user)}
        );
        refresh('user_' + user.id);
        rendered_users[user.id] = lng.dom('#user_' + user.id);
      }
      Message.renderUserAction(user);
    };

    var setConnectedCount = function(count) {
      $connectedCount.text(String(count));
      //$connectedCount.anim({opacity: 1}, 0.5, 'ease-out');
    };

    return {
      render: render,
      setConnectedCount: setConnectedCount
    };
  })();

  var Input = {
    $input: lng.dom('#chat_input'),
    value: function() {
      return this.$input.val();
    },
    enable: function() {
      this.$input.each(function(){ this.removeAttribute('disabled'); });
      this.$input.val('');
      this.$input.get(0).focus();
    },
    disable: function() {
      this.$input.attr('disabled', 'disabled');
    },
    onInput: function(callback) {
      // can't get #bind or #on to work... ?
      this.$input.get(0).addEventListener('change', callback, false);
    }
  };

  var Info = (function() {
    var hide_timeout = 300,
            hold = false,
            queue = [];

    var next = function() {
      hold = false;
      processQueue();
    };

    var callback = function(autoclose) {
      return function() {
        if (autoclose) {
          lng.Sugar.Growl.hide();
          setTimeout(next, hide_timeout);
        } else {
          next();
        }
      };
    };

    var processQueue = function() {
      if (!hold) {
        var next_fnc = queue.pop();
        if (next_fnc) {
          hold = true;
          lng.Sugar.Growl.hide();
          setTimeout(next_fnc, hide_timeout);
        }
      }
    };

    var addToQueue = function(fnc) {
      queue.unshift(fnc);
      processQueue();
    };

    var normal = function(title, description, min_visible, autoclose, icon) {
      var timeout = min_visible || 2;
      var icon = icon || 'info';
      addToQueue(function() {
        lng.Sugar.Growl.notify(title, description, icon, null, timeout, callback(autoclose));
      });
    };
    var warn = function(title, description, min_visible, autoclose, icon) {
      var timeout = min_visible || 2;
      var icon = icon || 'exclamation'
      addToQueue(function() {
        // title, description, icon, animate, seconds, callback
        lng.Sugar.Growl.show(title, description, icon, false, timeout, callback(autoclose));
      });
    };
    var hide = function() {
      addToQueue(callback(true));
    };

    return {
      normal: normal,
      warn: warn,
      hide: hide
    }
  })();

  var fadeInTitle = function() {
    var $el = lng.dom('#asciititle');
    //$el.anim({opacity: 1}, 8, 'ease-in');
  };

  return {
    Message: Message,
    User: User,
    Input: Input,
    Info: Info,
    Effects: {fadeInTitle: fadeInTitle}
  }

})(LUNGO, App);