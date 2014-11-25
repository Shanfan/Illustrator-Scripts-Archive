#!ruby -Ks

fldr = "jsx_lf"
Dir.mkdir(fldr)
Dir.glob("*.js") do |g|
  src = open(g, "rb")
  dat = src.read.gsub(/\r/,"")
  src.close
  
  dst = open(fldr + "/" + g + "x", "wb")
  dst.write dat
  dst.close
end
