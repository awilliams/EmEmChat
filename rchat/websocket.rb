require 'json'
require 'socket'
require 'set'
require 'rchat/config'

module RChat
  class Websocket

    @@connected_users = Set.new
    @@on_user_join, @@on_user_leave = [], []
    @@uid = 0

    def self.channel=(channel)
      @@channel = channel
    end

    def self.users=(users)
      @@users = users
    end

    def self.on_tx(&block)
      @@channel.subscribe { |msg| block.call }
    end

    def self.on_user_join(&block)
      @@on_user_join << block
    end

    def self.on_user_leave(&block)
      @@on_user_leave << block
    end

    def self.new_connection
      Proc.new { |ws_connection| self.new(ws_connection) }
    end

    def initialize(ws)
      @ws = ws
      @sid = nil
      initialize_wsocket
    end

    def send(msg)
      json = JSON.fast_generate(msg)
      @ws.send(json)
      puts "%s %s" % [Time.now, json] if RChat.Config(:debug)
    end

    def broadcast(msg)
      @@channel.push(msg)
    end

    def add_user
      @@connected_users.add(user)
    end

    def remove_user
      @@connected_users.delete(user)
    end

    def on_message(msg)
      if msg[:data] && msg[:data][:message]
        broadcast(Message.message(user.id, msg[:data][:message]))
        puts "#{user.hostname}:\t#{msg[:data][:message]}" unless RChat.Config(:debug)
      end
    end

    def on_close
      remove_user
      broadcast(Message.leave(user.id))
      puts "## LEAVE #{user.hostname} (#{user.ip})" unless RChat.Config(:debug)
      is_last_user = @@connected_users.empty?
      @@on_user_leave.each { |block| block.call(is_last_user) }
    end

    def on_open
      is_first_user = @@connected_users.empty?
      add_user
      broadcast(Message.join(user))
      # send connected users to user
      send(@@connected_users.map { |u|
        Message.join(u, u == user)
      })
      puts "## JOIN #{user.hostname} (#{user.ip})" unless RChat.Config(:debug)
      @@on_user_join.each { |block| block.call(is_first_user) }
    end

    def initialize_wsocket
      @ws.onopen do
        on_open
        @sid = @@channel.subscribe do |msg|
          send(msg)
        end
        @ws.onmessage do |msg|
          on_message(JSON.parse(msg, {:symbolize_names => true}))
        end
        @ws.onclose do
          @@channel.unsubscribe(@sid)
          on_close
        end
      end
    end

    def user
      unless @user
        @user = @@users.fetch(client_ip)
        @user.uid = (@@uid += 1)
      end
      @user
    end

    def client_ip
      @client_ip ||= Socket.unpack_sockaddr_in(@ws.get_peername)[1]
    end
  end
end
