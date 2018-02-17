const Util = {};
const exclamations = ['Dope!', 'Sick!', 'Wow!', 'Really nice work -',
  'Incredible!!!', "That's tight -", 'Wicked sick!', 'My friend, you have astonished me.',
  'Could it be? YES!', "Honestly, I'm impressed -", "Superlative!", "Can you believe it?",
  'Outstanding!', '[Generic Positive Expression]!', 'I can tell you are smart -',];

/**
 * Remove common Project Gutenberg watermarks
 * @param txt
 * @returns {string}
 */
Util.gutenberg = (txt) => {
  const start_delim = '*** START OF THIS PROJECT GUTENBERG EBOOK';
  const end_delim = '*** END OF THIS PROJECT GUTENBERG EBOOK';
  // Remove everything before and including start_delim
  if (txt.includes(end_delim)) {
    txt = txt.split(end_delim)[0]
  }
  if (txt.includes(start_delim)) {
    txt = txt.replace(/[.\s\w-:,\[\]\#]+\*{3}/gm, ' ');
  }
  return txt
};

/**
 * Removes unnecessary characters from a string
 * @param txt
 * @returns {string}
 */
Util.stripText = (txt) => {
  return Util.gutenberg(txt)
      .trim()
      .toLowerCase()
      .replace(/[‘’\u2018\u2019\u201A\']/gm, " ") // single quotes
      .replace(/[“”\u201C\u201D\u201E\"]/gm, ' ') // double quotes
      .replace(/\u2026/gm, ".")                 // special ellipsis
      .replace(/\u02C6/gm, " ")                 // circumflex
      .replace(/[\u2039<\u203A>]/gm, " ")       // angle brackets
      .replace(/[\u02DC\u00A0]/gm, " ")         // spaces
      .replace(/\d+:\d+/gm, " ")                // bible verses, lol, i.e. 31:12
      .replace(/[\u2013\u2014,:;\-\+\\\/\(\)\*]/gm, " ")  // unnecessary punctuation
      .replace(/([!\?]|\.{2,})/gm, ".")         // replace !?... with . to save time parsing later
      .replace(/(\r\n|\n|\r)/gm, " ")           // strip newlines
      .replace(/\s{2,}/gm, " ")                 // anything above 1 space is unnecessary
      .replace(/\s+\./gm, ".")                  // removes the extra space in "end of sentence ."
      .replace(/\.\s+/gm, ".")                  // removes the extra space in ".  start of sentence"
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
    let segment_color = default_color;
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

Util.removeEmptyKeys = (obj) => {
  return Object.keys(obj).reduce((a, key) => {
    if (!obj[key] || obj[key] === '') return a;
    a[key] = obj[key];
    return a
  }, {});
};

/* Nifty one liners */
Util.checksum = (txt) => txt.split('').reduce((a, s, i) => a + (txt.charCodeAt(i) * (i + 1)), 0x12345678).toString();
Util.checksumObj = (obj) => Util.checksum(Util.reduceObj(obj));
Util.getExpression = () => Util.getRandomEntry(exclamations);
Util.getNodeColors = (txt) => txt ? txt.split(',').map(x => Util.toHex(x) ? Util.toHex(x) : '#F26101') : null;
Util.getRandomEntry = (arr) => arr[Math.floor(Math.random() * arr.length)];
Util.getSplitText = (txt) => txt ? txt.split(',').map(x => x.trim().toLowerCase()) : null;
Util.isHexCode = (txt) => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(txt);
Util.reduceObj = (obj) => JSON.stringify(obj).replace(/\s/g, '');

module.exports = Util;