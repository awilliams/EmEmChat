require 'ememchat/config'

module EmEmChat
  module Led
    def self.control_available?
      !!EmEmChat.Config(:led_control_path)
    end

    def self.on
      self.open_control(:on)
    end

    def self.off
      self.open_control(:off)
    end

    def self.toggle
      self.open_control(:toggle)
    end

    def self.on?
      self.open_control(:on?)
    end

    def self.off?
      self.open_control(:off?)
    end

    def self.blink(times = 5, frequency = 0.15)
      i = 0
      self.open_control do |cont|
        initial_state_on = cont.on?
        loop do
          initial_state_on ? cont.off : cont.on
          sleep(frequency)
          initial_state_on ? cont.on : cont.off
          if (i += 1) < times
            sleep(frequency)
          else
            break
          end
        end
      end
    end

    def self.open_control(method = nil, &block)
      f = File.open(EmEmChat.Config(:led_control_path), 'r+')
      f.sync = true
      control = OnOff.new(f)
      method ? control.send(method) : block.call(control)
      ensure
      f.close
    end

    class OnOff
      ON, OFF = 1, 0
      def initialize(f)
        @f = f
      end

      def on?
        !off?
      end

      def off?
        getc == OFF
      end

      def on
        putc(ON)
      end

      def off
        putc(OFF)
      end

      def toggle
        on? ? off : on
      end

      protected

      def getc
        @f.rewind
        @f.getc.to_i
      end
      
      def putc(v)
        @f.rewind
        @f.putc(v.to_s)
      end
    end
  end
end
