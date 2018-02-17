$(document).ready(() => {
  const version = 1;
  const endpoint = `https://gy2aa8c57c.execute-api.us-east-1.amazonaws.com/dev/`;
  const form = $('#word_art_form');
  const results = $('#display_results');
  const loading = $('#display_loading');

  const exclamations = ['Dope!', 'Sick!', 'Wow!', 'Really nice work -',
    'Incredible!!!', "That's tight -", 'Wicked sick!', 'My friend, you have astonished me.',
    'Could it be? YES!', "Honestly, I'm impressed -", "Superlative!", "Can you believe it?",
    'Outstanding!', '[Generic Positive Expression]!', 'I can tell you are smart -']
  const getExpression = () => exclamations[Math.floor(Math.random() * exclamations.length)];

  const start_load = () => {
    form.hide();
    results.hide();
    loading.html(load()).show()
  };

  const end_load = () => {
    loading.html('').hide();
    results.show();
    form.show();
  };

  const load = () => `<p class="lead text-info text-center">Now generating your SVG file...</p>`;
  const success = (url) => {
    return `<p class="lead text-success text-center">${getExpression()} Your SVG file has been generated</p>
    <a href="${url}" target="_blank" role="button" class="btn btn-md btn-success">Download SVG</a>`
  };
  const error = (err) => {
    return `<p class="text-danger">There was an error generating your SVG file: 
    <strong>${err}</strong>
    <br/>Huge books (like the Bible) can sometimes overload the server.</p>`;
  };

  /**
   * Removes unnecessary characters from a string
   * @param txt
   * @returns {string}
   */
  const stripText = (txt) => {
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
  };


  const getText = (txt) => {
    console.log('Text length before stripping: ' + txt.length);
    txt = stripText(txt).trim().toLowerCase();
    console.log('Text length after stripping: ' + txt.length);
    return txt;
  };

  const getSimpleParse = (txt) => {
    const sentences = txt.match(/[^\.!\?]+[\.!\?]+/g);
    return sentences.map(x => x.split(' ').length)
  };

  const getSimplePathStr = (array_of_ints) => {
    /* Turn left 90 degrees each time */
    const behavior_ref = ['h -', 'v ', 'h ', 'v -'];
    let count = 0;
    return array_of_ints.reduce((a, i) => {
      const move = `${behavior_ref[count]}${i}`;
      count = count === 3 ? 0 : count + 1;
      return `${a} ${move}`;
    }, 'M50 20j')
  };


  const getSplitParse = (input_text, split_dict, primary_color) => {
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
   *
   * @param txt
   * @returns {string|null}
   */
  const toHex = (txt) => {
    txt = txt ? txt.trim() : '';
    if (txt.includes('#') && isHexCode(txt)) return txt;
    return isHexCode(`#${txt}`) ? `#${txt}` : null;
  };


  const getSplitText = (txt) => txt ? txt.split(',').map(x => x.trim().toLowerCase()) : null;
  const getNodeColors = (txt) => txt ? txt.split(',').map(x => toHex(x)) : null;
  const isHexCode = (code) => /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(code);
  const checksum = (txt) => txt.split('').reduce((a, s, i) => a + (txt.charCodeAt(i) * (i + 1)), 0x12345678).toString();

  form.submit((e) => {
    e.stopPropagation();
    e.preventDefault();

    // https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
    const serialized = form.serializeArray();
    const text = getText(serialized[0].value);
    const color = toHex(serialized[1].value);
    const node_colors = getNodeColors(serialized[2].value);
    const split = {
      words: getSplitText(serialized[3].value),
      color: toHex(serialized[4].value)
    };
    const simple_pre_parsed = getSimpleParse(text);
    const simple_path = getSimplePathStr(simple_pre_parsed);
    const split_pre_parsed = split.words ? getSplitParse(text, split, color) : null;

    // console.log(simple_path)
    console.log(split_pre_parsed)

    const standard_opts = {
      text,
      simple_path,
      split_pre_parsed,
      color,
      node_colors,
      version
    };
    const essential_opts = Object.keys(standard_opts).reduce((a, key) => {
      if (!standard_opts[key] || standard_opts[key] === '') return a;
      a[key] = standard_opts[key];
      return a
    }, {});

    /* Check if split needs to be included */
    if (split.words) {
      essential_opts['split'] = split
    }

    if ((simple_path.length > 0 && !essential_opts['split']) || split_pre_parsed.length > 0) {
      delete essential_opts['text']
    }

    start_load();
    essential_opts.checksum = checksum(JSON.stringify(essential_opts));
    console.log(essential_opts.checksum)
    console.log(essential_opts)

    $.ajax({
      url: endpoint,
      method: 'post',
      data: JSON.stringify(essential_opts),
      processData: false,
      headers: {
        'Accept': 'application/json'
      },
      dataType: 'json',
    })
        .then(res => {
          console.log(res);
          if (res.s3_url) {
            results.html(success(res.s3_url))
          } else {
            results.html(error(res.err))
          }
          end_load()
        })
        .catch(err => {
          console.log('err', err);
          results.html(error(err.statusText));
          end_load()
        })

  })


});