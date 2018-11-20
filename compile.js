// https://github.com/hxw319726/wepy-cli/tree/master/src/compile-js.js

var buffer = require('buffer')
var fs = require('fs')
var path = require('path')

var mkdirp = require('mkdirp')
var through2 = require('through2')

var { transform } = require('babel-core')

var uglifyJS = require('uglify-js')

var modulesPath = path.join(process.cwd(), 'node_modules' + path.sep)

var prod = false
var srcDir = ''
var distDir = ''
var npmPath = ''

var babelrc = fs.readFileSync('./.babelrc', 'utf-8')
var babelLoaderOptions = {
  ...JSON.parse(babelrc),
  babelrc: false,
}

// 缓存
var buildCache = {}

var util = {
  setBuildCache: function (file) {
    buildCache[file] = this.getModifiedTime(file)
  },
  checkBuildCache: function (file) {
    return buildCache[file] && buildCache[file] === this.getModifiedTime(file)
  },
  transform: function (code) {
    return transform(code, babelLoaderOptions).code
  },
  isFile: function (opath) {
    opath = (typeof (opath) === 'object') ? path.join(opath.dir, opath.base) : opath
    if (!fs.existsSync(opath)) {
      return false
    }
    return fs.statSync(opath).isFile()
  },
  isDir: function (opath) {
    if (!fs.existsSync(opath)) {
      return false
    }
    return fs.statSync(opath).isDirectory()
  },
  isString: function (obj) {
    return toString.call(obj) === '[object String]'
  },
  getModifiedTime: function (p) {
    return this.isFile(p) ? +fs.statSync(p).mtime : false
  },
  writeFile: function (p, data) {
    var opath = (this.isString(p) ? path.parse(p) : p)
    if (!this.isDir(opath.dir)) {
      mkdirp.sync(opath.dir)
    }
    fs.writeFileSync(p, data)
  },
  getDistPath: function (opath, ext, src, dist) {
    src = src || srcDir
    dist = dist || distDir
    ext = (ext ? ('.' + ext) : opath.ext)
    var dir = (opath.dir + path.sep).replace(path.sep + src + path.sep, path.sep + dist + path.sep)
    return dir + opath.name + ext
  },
  readFile: function (opath) {
    var rst = null
    opath = (typeof (opath) === 'object') ? path.join(opath.dir, opath.base) : opath
    try {
      rst = fs.readFileSync(opath, 'utf-8')
    } catch (e) {
    }
    return rst
  },
  npmHack: function (filename, code) {
    switch (filename) {
      case 'lodash.js':
      case '_global.js':
        code = code.replace("Function('return this')()", 'this')
        break
      case '_html.js':
        code = 'module.exports = false'
        break
      case '_microtask.js':
        code = code.replace('if(Observer)', 'if(false && Observer)')
        break
      case 'base64.js':
        code = code.replace('buffer = require(\'buffer\').Buffer;', '')
        break
    }
    return code
  },
  getPkgConfig: function (lib) {
    var pkg = util.readFile(path.join(modulesPath, lib, 'package.json'))
    try {
      pkg = JSON.parse(pkg)
    } catch (e) {
      pkg = null
    }
    return pkg
  },
  resolveDeps: function (code, type, opath) {
    var _this = this
    return code.replace(/require\(['"]([\w\d_\-\.\/]+)['"]\)/gi, function (match, lib) {
      var resolved = lib

      var target = ''

      var source = ''

      var ext = ''

      var needCopy = false

      if (lib[0] === '.') {
        source = path.join(opath.dir, lib)
        if (type === 'npm') {
          target = path.join(npmPath, path.relative(modulesPath, source))
          needCopy = true
        } else {
          target = source.replace(path.sep + srcDir + path.sep, path.sep + distDir + path.sep)
          needCopy = false
        }
      } else if (lib.indexOf('/') === -1 || lib.indexOf('/') === lib.length - 1) {
        var pkg = _this.getPkgConfig(lib)
        if (!pkg) {
          throw new Error('找不到模块: ' + modulesPath + lib + '，请手动安装！')
        }
        var main = pkg.main || 'index.js'
        if (pkg.browser && typeof pkg.browser === 'string') {
          main = pkg.browser
        }
        source = path.join(modulesPath, lib, main)
        target = path.join(npmPath, lib, main)
        lib += path.sep + main
        ext = ''
        needCopy = true
      } else {
        source = path.join(modulesPath, lib)
        target = path.join(npmPath, lib)
        ext = ''
        needCopy = true
      }

      if (_this.isFile(source + '.js')) {
        ext = '.js'
      } else if (_this.isDir(source) && _this.isFile(source + path.sep + 'index.js')) {
        ext = path.sep + 'index.js'
      } else if (_this.isFile(source)) {
        ext = ''
      } else {
        throw new Error('找不到文件: ' + source)
      }

      source += ext
      target += ext
      lib += ext
      resolved = lib

      if (needCopy) {
        if (!_this.checkBuildCache(source)) {
          _this.setBuildCache(source)
          console.log('依赖: ' + path.relative(process.cwd(), target), '拷贝')
          _this.compile(null, 'npm', path.parse(source))
        }
      }

      if (type === 'npm') {
        if (lib[0] !== '.') {
          resolved = path.join('..' + path.sep, path.relative(opath.dir, modulesPath), lib)
        } else {
          if (lib[0] === '.' && lib[1] === '.') { resolved = './' + resolved }
        }
      } else {
        resolved = path.relative(_this.getDistPath(opath, opath.ext, srcDir, distDir), target)
      }

      resolved = resolved.replace(/\\/g, '/').replace(/^\.\.\//, './')

      return `require('${resolved}')`
    })
  },
  compile: function (code, type, opath) {
    var target
    if (!code) {
      code = util.readFile(path.join(opath.dir, opath.base))
      if (code === null) {
        throw new Error('打开文件失败: ' + path.join(opath.dir, opath.base))
      }
    }

    if (type === 'npm') {
      code = this.npmHack(opath.base, code)
    } else {
      code = util.transform(code)
    }

    code = this.resolveDeps(code, type, opath)

    if (prod) {
      code = this.uglify(code)
    }

    if (type === 'npm') {
      target = path.join(npmPath, path.relative(modulesPath, path.join(opath.dir, opath.base)))

      this.writeFile(target, code)
    } else {
      return code
    }
  },
  uglify: function (code) {
    return uglifyJS.minify(code, {
      compress: {
        warnings: false,
      },
    }).code
  }
}

module.exports = function (options) {
  prod = options && options.prod
  srcDir = (options && options.srcDir) || 'src'
  distDir = (options && options.distDir) || 'dist'
  npmPath = path.join(process.cwd(), distDir, 'npm' + path.sep)

  return through2.obj(function (file, encode, cb) {
    file.contents = buffer.Buffer.from(util.compile(file.contents.toString(), 'js', path.parse(file.path)))
    this.push(file)
    cb()
  })
}
