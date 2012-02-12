require 'erb'

class IndexFile
  attr_accessor :title, :web_socket_swf

  def initialize(template, title = '', javascripts, stylesheets, web_socket_swf)
    @erb     = ERB.new(File.read(template))
    @title   = title
    @javascripts = [*javascripts]
    @stylesheets = [*stylesheets]
    @web_socket_swf = web_socket_swf
  end

  def stylesheets
    @stylesheets.map do |href|
      "<link rel=\"stylesheet\" href=\"%s\">" % href
    end.join("\n  ")
  end

  def javascripts
    @javascripts.map do |src|
      "<script src=\"%s\"></script>" % src
    end.join("\n")
  end

  def get_binding
    binding
  end

  def result
    @result ||= @erb.result(get_binding)
  end
  alias_method :to_s, :result

  def write(file)
    File.open(file, 'w'){|f| f.puts self }
  end
end