require 'json'

module RChat
  class Message
    attr_reader :type, :data

    def self.join(user, is_self = false)
      self.new(:join, {:user => user, :is_self => is_self})
    end

    def self.leave(id)
      self.new(:leave, {:id => id})
    end

    def self.message(user_id, message)
      self.new(:message, {:user_id => user_id, :message => message})
    end

    def initialize(type, data)
      @type = type.to_sym
      @data = data
    end

    def to_json(*args)
      JSON.fast_generate(to_hash)
    end

    def to_hash
      {
        :type => type,
        :data => data
      }
    end
    
  end
end