require 'ememchat/user'

module EmEmChat
  class SampleUser
    def initialize(user_class = User)
      @user_class = user_class
    end

    def rand_str(upper_limit = 15)
      @rand_str_dict ||= ('a'..'z').to_a
      (rand(upper_limit) + 1).times.inject('') { |s, i| s << @rand_str_dict.sample }
    end

    def rand_mac
      @rand_mac_dict ||= (0..9).to_a + ('a'..'f').to_a
      6.times.inject([]) { |s, i| s << @rand_mac_dict.sample(2).join('') }.join(':')
    end

    def rand_ip
      @@base_ip ||= 2
      "192.168.1.#{@@base_ip += 1}"
    end

    def fetch(ip)
      @user_class.new(rand_mac, rand_ip, rand_str)
    end
  end
end
