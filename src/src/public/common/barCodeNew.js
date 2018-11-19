const JsBarcode = (id, content, options, validFunction) => {
  var canvas = wx.createCanvasContext(id);
  var merge = function(m1, m2) {
    var newMerge = {};
    for (var k in m1) {
      newMerge[k] = m1[k];
    }
    for (var k in m2) {
      newMerge[k] = m2[k];
    }
    return newMerge;
  };

  //Merge the user options with the default
  options = merge(JsBarcode.defaults, options);

  var temp = new wx.CODE128(content);
  var binary = wx.encoded(temp);
  //Creates the barcode out of the encoded binary
  canvas.fillStyle = options.lineColor;
  for (var i = 0; i < binary.length; i++) {
    var x = i * options.width + options.quite;
    if (binary[i] == "1") {
      canvas.fillRect(x, 0, options.width, options.height);
    }
  }
  canvas.draw();
};

JsBarcode.defaults = {
  width: 1.5,
  height: 100,
  quite: 0,
  format: "CODE128",
  displayValue: false,
  fontOptions: "",
  font: "monospace",
  textAlign: "center",
  fontSize: 12,
  backgroundColor: "",
  lineColor: "#000",
  space: true
};

module.exports = JsBarcode;
