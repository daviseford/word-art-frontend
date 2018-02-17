const Util = require('./util');
// const LongLoad = require('./long_load')

$(document).ready(() => {
  const version = 1;  // update this to invalidate all previous checksums
  const endpoint = `https://gy2aa8c57c.execute-api.us-east-1.amazonaws.com/dev/`;
  const form = $('#word_art_form');
  const results = $('#display_results');
  const loading = $('#display_loading');

  const start_load = () => {
    form.hide(5);
    results.hide(5);
    loading.html(load()).show(5)
  };

  const end_load = () => {
    loading.html(null).hide(5);
    results.show(5);
    form.show(5);
  };

  const long_load_screen = (url) => {
    return `<p class="text-info text-center">Your SVG file is taking a while to generate.<br/>
    It will eventually be uploaded here.<br />
    <a href="${url}" class="mt-2 mb-2"><small><strong>${url}</strong></small></a> 
    <br/>Try clicking this link in a minute or two :)</p>`;
  };
  const load = () => `<p class="lead text-info text-center">Now generating your SVG file...</p>`;
  const success = (url) => {
    return `<p class="lead text-success text-center">${Util.getExpression()} Your SVG file has been generated</p>
    <a href="${url}" target="_blank" role="button" class="btn btn-md btn-success">Download SVG</a>`
  };
  const error = (err) => {
    return `<p class="text-danger">There was an error generating your SVG file: 
    <strong>${err}</strong>
    <br/>Huge books (like the Bible) can sometimes overload the server.</p>`;
  };


  form.submit((e) => {
    e.stopPropagation();
    e.preventDefault();

    // https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
    const serialized = form.serializeArray();
    const text = Util.getText(serialized[0].value);
    const color = Util.toHex(serialized[1].value);
    const node_colors = Util.getNodeColors(serialized[2].value);
    const split = {
      words: Util.getSplitText(serialized[3].value),
      color: Util.toHex(serialized[4].value)
    };
    const simple_pre_parsed = Util.getSimpleParse(text);
    const simple_path = Util.getSimplePathStr(simple_pre_parsed);
    const split_pre_parsed = split.words ? Util.getSplitParse(text, split, color) : null;

    // console.log(simple_path)
    // console.log(split_pre_parsed)

    const standard_opts = {
      text,
      simple_path,
      split_pre_parsed,
      color,
      node_colors,
      version
    };

    /* Remove empty fields (they'll get default values on the back end if needed) */
    const essential_opts = Object.keys(standard_opts).reduce((a, key) => {
      if (!standard_opts[key] || standard_opts[key] === '') return a;
      a[key] = standard_opts[key];
      return a
    }, {});

    /* Check if split needs to be included */
    if (split.words) {
      essential_opts['split'] = split
    }

    /* Reduce the size of the network request by removing the text */
    if ((simple_path.length > 0 && !essential_opts['split']) || split_pre_parsed.length > 0) {
      delete essential_opts['text']
    }

    start_load();
    essential_opts.checksum = Util.checksumObj(essential_opts);
    // console.log(essential_opts)

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
          if (err.statusText === 'error') {
            const expected_url = `https://s3.amazonaws.com/word-art-svgs/${essential_opts.checksum}.svg`;
            // TODO get that working
            // LongLoad.wait(expected_url).then(res=>console.log(res))
            results.html(long_load_screen(expected_url));
          } else {
            console.log('Error', err);
            results.html(error(err.statusText));
          }
          end_load()
        })

  })


});