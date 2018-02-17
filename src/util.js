const Util = {}
const exclamations = ['Dope!', 'Sick!', 'Wow!', 'Really nice work -',
  'Incredible!!!', "That's tight -", 'Wicked sick!', 'My friend, you have astonished me.',
  'Could it be? YES!', "Honestly, I'm impressed -", "Superlative!", "Can you believe it?",
  'Outstanding!', '[Generic Positive Expression]!', 'I can tell you are smart -', 'Nerd - jk -'];
Util.getExpression = () => exclamations[Math.floor(Math.random() * exclamations.length)];

/**
 * Removes unnecessary characters from a string
 * @param txt
 * @returns {string}
 */
Util.stripText = (txt) => {
  return txt
      .replace(/[‘’\u2018\u2019\u201A]/gm, "'") // smart single quotes and apostrophe
      .replace(/[“”\u201C\u201D\u201E]/gm, '"') // smart double quotes
      .replace(/\u2026/gm, "...")               // ellipsis
      .replace(/\u02C6/gm, "^")                 // circumflex
      .replace(/\u2039/gm, "<")                 // open angle bracket
      .replace(/\u203A/gm, ">")                 // close angle bracket
      .replace(/[\u02DC\u00A0]/gm, " ")         // spaces
      .replace(/\d+:\d+/gm, " ")                // bible verses, lol, i.e. 31:12
      .replace(/[\u2013\u2014,:;\-\+]/gm, " ")  // unnecessary punctuation
      .replace(/([!\?]|\.{2,})/gm, ".")         // replace !?... with . to save time parsing later
      .replace(/(\r\n|\n|\r)/gm, " ")           // strip newlines
      .replace(/\s{2,}/gm, " ")                 // anything above 1 space is unnecessary
      .trim()
      .toLowerCase()
  // todo strip project gutenberg stuff
};


Util.getText = (txt) => {
  console.log('Text length before stripping: ' + txt.length);
  txt = Util.stripText(txt);
  console.log('Text length after stripping: ' + txt.length);
  return txt.split('.').length >= 2 ? txt : 'too. short.';
};

Util.getSimpleParse = (txt) => {
  const sentences = txt.match(/[^\.!\?]+[\.!\?]+/g);
  return sentences.map(x => x.split(' ').length)
};

Util.getSimplePathStr = (array_of_ints) => {
  /* Turn left 90 degrees each time */
  const behavior_ref = ['h -', 'v ', 'h ', 'v -'];
  let count = 0;
  return array_of_ints.reduce((a, i) => {
    const move = `${behavior_ref[count]}${i}`;
    count = count === 3 ? 0 : count + 1;
    return `${a} ${move}`;
  }, 'M50 20j')
};


Util.getSplitParse = (input_text, split_dict, primary_color) => {
  const sentences = input_text.match(/[^\.!\?]+[\.!\?]+/g);
  const default_color = primary_color || "#14B6D4";

  return sentences.map(words => {
    let segment_color = default_color
    split_dict['words'].forEach(word => {
      if (words.includes(word.toLowerCase())) {
        segment_color = split_dict['color'] || "#F22F00"
      }
    });
    return {'color': segment_color, 'length': words.split(' ').length}
  })
};

/**
 * Checks if a string is a valid hex code.
 * Also tries inserting a '#' sign if one doesn't exist
 * @param txt
 * @returns {string|null}
 */
Util.toHex = (txt) => {
  txt = txt ? txt.trim() : '';
  if (txt.includes('#') && Util.isHexCode(txt)) return txt;
  return Util.isHexCode(`#${txt}`) ? `#${txt}` : null;
};


Util.getSplitText = (txt) => txt ? txt.split(',').map(x => x.trim().toLowerCase()) : null;
Util.getNodeColors = (txt) => txt ? txt.split(',').map(x => Util.toHex(x)) : null;
Util.isHexCode = (txt) => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(txt);
Util.checksum = (txt) => txt.split('').reduce((a, s, i) => a + (txt.charCodeAt(i) * (i + 1)), 0x12345678).toString();
Util.reduceObj = (obj) => JSON.stringify(obj).replace(/\s/g, '');
Util.checksumObj = (obj) => Util.checksum(Util.reduceObj(obj));

module.exports = Util;