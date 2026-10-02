source "https://rubygems.org"

# 与 .github/workflows/jekyll.yml 中使用的 Ruby 3.1 保持一致
gem "jekyll", "~> 4.3.4"

group :jekyll_plugins do
  gem "jekyll-paginate", "~> 1.1"
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-seo-tag", "~> 2.8"
end

# Windows / JRuby 下 jekyll serve 需要
gem "webrick", "~> 1.8"

# 时区数据，避免 Windows 上 TZInfo 报错
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]
