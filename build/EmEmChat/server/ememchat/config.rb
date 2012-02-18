require 'json'

module EmEmChat
  env = ObjectSpace.const_defined?(:EMEMCHAT_ENV) ? ObjectSpace.const_get(:EMEMCHAT_ENV) : 'package'
  def self.root_dir(*args)
    @root_dir ||= File.expand_path('..', File.dirname(__FILE__))
    args.empty? ? @root_dir : File.join(@root_dir, *args)
  end
  def self.Config(*args)
    args.inject(@config_hash) do |val, key|
      val.fetch(key.to_sym)
    end
  end
  @config_hash = {
    :name             => 'EmEmChat',
    :debug            => false,
    :default_host     => 'localhost',
    :default_port     => '8080',
    :dhcp_leases_path => '/tmp/dhcp.leases',
    :log_path         => '/tmp/ememchat.log',
    :led_control_path => '/sys/class/leds/adsl-fail/brightness',
    :users_class      => 'DhcpUser',
    :paths            => {
      :build_dir        => root_dir('build', 'EmEmChat'),
      :app_dir          => root_dir('app'),
      :js_compiler      => root_dir('lib', 'compiler.jar'),
      :css_compiler     => root_dir('lib', 'yuicompressor-2.4.7.jar'),
    }
  }
  # merge into Config '../settings/config.#{EMEMCHAT_ENV}.json' if exists
  setting_file = root_dir('settings', "config.#{env}.json")
  @config_hash.merge!(JSON.parse(File.read(setting_file), :symbolize_names => true)) if File.exists?(setting_file)
  @config_hash.freeze
end
