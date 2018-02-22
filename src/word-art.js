const Util = require('./util');
// const LongLoad = require('./long_load')

// todo https://developers.canvaspop.com/documentation/examples-web

$(document).ready(() => {
  const version = 2;  // update this to invalidate all previous checksums
  const generate_svg_endpoint = `https://gy2aa8c57c.execute-api.us-east-1.amazonaws.com/dev/`;
  const generate_png_endpoint = `https://x9m83oo0kd.execute-api.us-east-1.amazonaws.com/dev/`;
  const svg_bucket = `https://s3.amazonaws.com/word-art-svgs/`;
  const png_bucket = `https://s3.amazonaws.com/word-art-pngs/`;
  const form = $('#word_art_form');
  const results = $('#display_results');
  const loading = $('#display_loading');

  const start_load = () => {
    form.hide(1);
    results.hide(1);
    loading.html(load()).show(1)
  };

  const end_load = () => {
    loading.html(null).hide(1);
    results.show(1);
    form.show(1);
  };

  const long_load_screen = (url) => {
    return `<p class="text-info text-center">Your SVG file is taking a while to generate.<br/>
    It will eventually be uploaded here.<br />
    <a href="${url}" class="mt-2 mb-2"><small><strong>${url}</strong></small></a> 
    <br/>Try clicking this link in a minute or two :)</p>`;
  };
  const load = () => `<p class="lead text-info text-center">Now generating your SVG file...</p>`;

  const svg_success = (svg_url) => {
    return `<p class="lead text-success text-center">Your SVG file has been generated</p>
    <a href="${svg_url}" target="_blank" role="button" class="btn btn-md btn-success">Download SVG</a>
    ${png_generating()}`
  };

  const png_success = (svg_url) => {
    console.log(svg_url);
    const png_filename = Util.extensionSVGtoPNG(Util.getFileName(svg_url));
    const png_url = `${png_bucket}${png_filename}`;
    return `<p class="lead text-success text-center">${Util.getExpression()} Your files are ready!</p>
    <a href="${svg_url}" target="_blank" role="button" class="btn btn-md btn-success">Download SVG</a>
    ${png_download(png_url)}`
  };

  const error = (err) => {
    return `<p class="text-danger">There was an error generating your SVG file: 
    <strong>${err}</strong>
    <br/>Huge books (like the Bible) can sometimes overload the server.</p>`;
  };

  const png_generating = () => {
    return `<a class="btn btn-md btn-primary" id="png_loading_btn" role="button" href="#">
            <i class="fa fa-cog fa-spin" style="font-size:24px"></i>
            Generating PNG</a>`
  };

  const png_download = (png_url) => {
    return `<a href="${png_url}" target="_blank" role="button" id="png_loading_btn" class="btn btn-md btn-primary">
    Download PNG
    </a>`
  };

  const get_opts = () => {
    // https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
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

  form.submit((e) => {
    e.stopPropagation();
    e.preventDefault();

    // https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
    const essential_opts = get_opts();
    start_load();
    essential_opts.checksum = Util.checksumObj(essential_opts);

    console.log(essential_opts);

    $.ajax({
      url: generate_svg_endpoint,
      method: 'post',
      data: JSON.stringify(essential_opts),
      processData: false,
      headers: {
        'Accept': 'application/json'
      },
      dataType: 'json',
    }).then(res => {
      console.log(res);
      if (res.s3_url) {
        results.html(svg_success(res.s3_url));
        if (!res.duplicate) {
          generatePNG(res.s3_url, essential_opts.bg_color)
        } else {
          results.html(png_success(res.s3_url))
        }
      } else {
        results.html(error(res.err))
      }
      end_load()
    }).catch(err => {
      if (err.statusText === 'error') {
        const expected_url = `${svg_bucket}${essential_opts.checksum}.svg`;
        results.html(long_load_screen(expected_url));
      } else {
        console.log('Error', err);
        results.html(error(err.statusText));
      }
      end_load()
    })
  });


  const generatePNG = (url, bg_color) => {
    $.ajax({
      url: generate_png_endpoint,
      method: 'post',
      data: JSON.stringify({url, bg_color}),
      processData: false,
      headers: {
        'Accept': 'application/json'
      },
      dataType: 'json',
    }).then(res => {
      console.log(res);
      results.html(png_success(res.svg_url))
    }).catch(err => console.log(err))
  }

});