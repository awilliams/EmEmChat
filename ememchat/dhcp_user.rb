require 'ememchat/config'
require 'ememchat/user'

module EmEmChat
  class DhcpUser

    LineParser = /\s/

    def initialize(user_class = User, dhcp_leases_path = EmEmChat.Config(:dhcp_leases_path))
      @user_class = user_class
      if File.exists?(dhcp_leases_path)
        @dhcp_leases_file = File.new(dhcp_leases_path, 'r')
        @data = Hash.new
        update
      else
        @dhcp_leases_file = nil
        @data = Hash.new { |h, k| h[k] = null_lease(k) }
      end
    end

    def fetch(ip)
      begin
        @data.fetch(ip)
      rescue KeyError
        update if @dhcp_leases_file
        @data[ip] ||= null_lease(ip)
        retry
      end
    end

    protected

    def update
      puts 'Reading DHCP leases'
      readfile do |lease|
        @data[lease.ip] = lease
      end
    end

    def readfile(&block)
      @dhcp_leases_file.rewind
      @dhcp_leases_file.each do |line|
        block.call(parse_line(line))
      end
    end

    def null_lease(ip = nil)
      @user_class.new('', ip, ip)
    end

    def parse_line(line)
      lease_expiry, mac, ip, hostname, client_id = line.split(LineParser)
      hostname.gsub!(/\-/, ' ')
      @user_class.new(mac, ip, hostname)
    end
  end

end
