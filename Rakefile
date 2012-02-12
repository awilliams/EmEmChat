require 'rake'
require 'yaml'
require File.join(Rake.original_dir, 'rchat', 'config')
require File.join(Rake.original_dir, 'lib', 'index_file')

namespace :build do

  index_template    = File.join(RChat.Config(:paths, :app_dir), 'index.rhtml')
  # load all javascript, stylesheets, and web_socket_swf locations
  asset_manifest    = YAML.load_file(File.join(RChat.Config(:paths, :app_dir), 'asset_manifest.yml'))

  # absolute paths to assets
  javascripts       = asset_manifest.fetch("javascript").map { |js| File.join(RChat.Config(:paths, :app_dir), js) }
  stylesheets       = asset_manifest.fetch("stylesheet").map { |css| File.join(RChat.Config(:paths, :app_dir), css) }
  web_socket_swf    = File.join(RChat.Config(:paths, :app_dir), asset_manifest.fetch("web_socket_swf"))

  # shortcut fnc to make paths to www build dir
  def www_build_dir(*paths)
    File.join(RChat.Config(:paths, :build_dir), 'www', *paths)
  end
  # packaged asset paths
  packaged_js_file        = www_build_dir("#{RChat.Config(:name)}.js")
  packaged_css_file       = www_build_dir("#{RChat.Config(:name)}.css")
  packaged_web_socket_swf = www_build_dir(File.basename(web_socket_swf))

  # server files
  server_files = [
    File.join(Rake.original_dir, 'rchat.rb'),
    File.join(Rake.original_dir, 'server.rb'),
  ]  + Dir.glob(File.join(Rake.original_dir, 'rchat', '*.rb')) + Dir.glob(File.join(Rake.original_dir, 'settings', '*.json'))
  def server_build_dir(*paths)
    File.join(RChat.Config(:paths, :build_dir), 'root', 'r.chat', *paths)
  end

  task :clear do
    exec!("rm -rf #{RChat.Config(:paths, :build_dir)}/*")
  end

  task :setup do
    exec!("mkdir -p #{www_build_dir} #{server_build_dir('rchat')} #{server_build_dir('settings')}")
  end

  task :reset => [:setup]

  namespace :assets do
    desc 'Package javascript files'
    task :javascripts => :setup do
      compile_js!(packaged_js_file, *javascripts)
    end

    desc 'Package stylesheets'
    task :stylesheets => :setup do
      compile_css!(packaged_css_file, *stylesheets)
    end

    desc 'Package flash'
    task :flash => :setup do
      cp!(web_socket_swf, packaged_web_socket_swf)
    end

    desc 'Package all assets'
    task :all => [:javascripts, :stylesheets, :flash]
  end
  
  namespace :index do
    desc 'Build index.html (local dev)'
    task :local do
      index = IndexFile.new(index_template, RChat.Config(:name), javascripts, stylesheets, web_socket_swf)
      index.write(File.join(RChat.Config(:paths, :app_dir), 'index.html'))
    end

    desc 'Build index.html (packaged)'
    task :packaged => :setup do
      index = IndexFile.new(index_template, RChat.Config(:name), "/" + File.basename(packaged_js_file), "/" + File.basename(packaged_css_file), "/" + File.basename(packaged_web_socket_swf))
      index.write(www_build_dir('index.html'))
    end
  end

  desc 'Package webapp'
  task :app => ['build:assets:all', 'build:index:packaged']

  desc 'Package server'
  task :server => :setup do
    server_files.each do |server_file|
      cp!(server_file, server_build_dir(server_file.gsub(Rake.original_dir, '')))
    end
  end

  desc 'Create build tar'
  task :tar do
    exec!("cd #{RChat.Config(:paths, :build_dir)} && tar -cf rchat_build.tar *")
  end

end

desc 'package assets and compile index'
task :build => [
  'build:reset',
  'build:app',
  'build:server',
  'build:tar',
]

task :default => ['build:index:local']

## helper functions

def exec!(cmd)
  puts ('=' * 10)
  puts cmd
  system(cmd) or raise Exception.new($?)
end

def compile_js_cmd(output_file, *input_files)
  (["java -jar #{RChat.Config(:paths, :js_compiler)} --warning_level QUIET",
    "\t--js_output_file #{output_file}"] +
    input_files.map { |f| "\t--js #{f}" }
  ).join(" \\\n")
end
def compile_js!(output_file, *input_files)
  exec!(compile_js_cmd(output_file, *input_files))
end

def compile_css_cmd(output_file, *input_files)
  ["cat #{input_files.join(" \\\n\t")}",
   "java -jar #{RChat.Config(:paths, :css_compiler)} --type css --line-break 80 -o #{output_file}"
  ].join("\\\n | ")
end
def compile_css!(output_file, *input_files)
  exec!(compile_css_cmd(output_file, *input_files))
end

def cp!(*source, dest)
  exec!("cp #{source.join(' ')} #{dest}")
end