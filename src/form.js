const Util = require('./util');

const get_opts = (version = 1) => {
  // https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
  const form = $('#word_art_form');
  const input_text = $('#input_text');
  input_text.val(input_text.val().trim()); // Strip whitespace
  const serialized = form.serializeArray();
  const text = Util.getText(serialized[0].value);
  const color = Util.toHex(serialized[1].value);
  const bg_color = Util.toHex(serialized[2].value);
  const node_colors = Util.getNodeColors(serialized[3].value);
  const split = {
    words: Util.getSplitText(serialized[4].value),
    color: Util.toHex(serialized[5].value)
  };
  // console.log(text)
  const simple_pre_parsed = Util.getSimpleParse(text);
  const simple_path = Util.getSimplePathStr(simple_pre_parsed);
  const split_pre_parsed = split.words ? Util.getSplitParse(text, split, color) : null;

  const standard_opts = {
    text,
    simple_path,
    split_pre_parsed,
    color,
    node_colors,
    version,
    bg_color,
  };

  /* Remove empty fields (they'll get default values on the back end if needed) */
  const essential_opts = Util.removeEmptyKeys(standard_opts);

  /* Check if split needs to be included */
  if (split.words) {
    essential_opts['split'] = split
  }

  /* Reduce the size of the network request by removing the text */
  if ((simple_path.length > 0 && !essential_opts['split']) || split_pre_parsed.length > 0) {
    delete essential_opts['text']
  }
  return essential_opts
};


module.exports = {
  get_opts,
}