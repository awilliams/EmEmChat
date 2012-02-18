require 'json'

module EmEmChat
  class User
    attr_reader :id, :mac, :ip, :hostname
    attr_accessor :uid
    def initialize(mac, ip, hostname)
      @mac, @ip, @hostname, @sid = mac, ip, hostname, uid
    end

    def id
      mac ? mac.hash.abs : 0
    end

    def to_json(*a)
      JSON.fast_generate({
        :id       => id,
        :mac      => mac,
        :ip       => ip,
        :hostname => hostname,
        :uid      => uid
      })
    end
  end
end
