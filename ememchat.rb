require 'em-websocket'

module EmEmChat
  def self.run(host = Config(:default_host), port = Config(:default_port))
    if Config(:log_path)
      $stdout.reopen(Config(:log_path), "a")
      $stderr.reopen(Config(:log_path), "a")
    end
    at_exit { Led.off } if Led.control_available?
    EventMachine.run do
      Websocket.channel = EM::Channel.new
      Websocket.users = self.const_get(Config(:users_class).to_sym).new
      if Led.control_available?
        Websocket.on_user_join { |is_first_user| Led.on if is_first_user }
        Websocket.on_user_leave { |is_last_user| Led.off if is_last_user }
      end
      puts "Starting EmEmChat Server on #{host}:#{port}"
      puts "Debug = true" if Config(:debug)
      EventMachine::WebSocket.start({:host => host, :port => port, :debug => Config(:debug)}, &Websocket.new_connection)
      puts "Server started!"
      Led.blink(1, 4) if Led.control_available?
    end
  end
end

%w(config user sample_user dhcp_user message websocket led).each do |file|
  require "ememchat/#{file}"
end
