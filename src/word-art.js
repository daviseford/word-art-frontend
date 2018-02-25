const Util = require('./util');
const Form = require('./form');
const Colors = require('./colors');

$(document).ready(() => {
  const version = 2;  // update this to invalidate all previous checksums
  const generate_svg_endpoint = `https://gy2aa8c57c.execute-api.us-east-1.amazonaws.com/dev/`;
  const generate_png_endpoint = `https://x9m83oo0kd.execute-api.us-east-1.amazonaws.com/dev/`;
  const svg_bucket = `https://s3.amazonaws.com/word-art-svgs/`;
  const png_bucket = `https://s3.amazonaws.com/word-art-pngs/`;
  const form = $('#word_art_form');
  const results_div = $('#display_results');
  const loading_div = $('#display_loading');

  Colors.assignPrefillFuncs() // Display and set up the prefill buttons

  const start_load = () => {
    form.hide(0);
    results_div.hide(0);
    loading_div.html(load()).show(0)
  };

  const end_load = () => {
    loading_div.html(null).hide(0);
    results_div.show(0);
    form.show(0);
  };

  const long_load_screen = (url) => {
    return `<p class="text-info text-center">Your SVG file is taking a while to generate.<br/>
    It will eventually be uploaded here.<br />
    <a href="${url}" class="mt-2 mb-2"><small><strong>${url}</strong></small></a> 
    <br/>Try clicking this link in a minute or two :)</p>`;
  };
  const load = () => {
    return `<div class="col-12 py-5 my-5 text-center">
    <p class="lead text-info text-center">Now generating your SVG file...</p>
    <i id="loading-icon" class="fa fa-life-ring fa-spin text-info" style="font-size: 24px;"></i>
    </div>`;
  }

  const svg_success = (svg_url) => {
    return `<p class="lead text-success text-center">Your SVG file has been generated</p>
    <a href="${svg_url}" target="_blank" role="button" class="btn btn-md btn-success">Download SVG</a>
    ${png_generating()}`
  };

  const png_success = (svg_url) => {
    const png_filename = Util.extensionSVGtoPNG(Util.getFileName(svg_url));
    const png_url = `${png_bucket}${png_filename}`;
    return `
    <p class="lead text-success text-center">${Util.getExpression()} Your files are ready!</p>
    <div class="row">
        <div class="col pb-2"> 
            <div class="btn-group" role="group">
                <a href="${svg_url}" target="_blank" role="button" class="btn btn-md btn-success">Download SVG</a>
                ${png_download(png_url)}
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col pb-2">
            ${canvaspop_button(png_url)}
        </div>
    </div>
    `
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
    return `<a href="${png_url}" target="_blank" role="button" id="png_download_btn" class="btn btn-md btn-primary">
    Download PNG
    </a>`
  };

  const canvaspop_button = (png_url) => {
    return `<a href="${get_canvaspop_url(png_url)}" target="_blank" role="button" id="canvaspop_store_btn" class="btn btn-md btn-dark">
    Buy Now on CanvasPop
    </a>`
  };

  const get_canvaspop_url = (url) => {
    return `https://store.canvaspop.com/api/pull?image_url=${url}&access_key=15549806e27b7565977dabf10b992dbd`
  };


  form.submit((e) => {
    e.stopPropagation();
    e.preventDefault();

    // https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
    const essential_opts = Form.get_opts(version);
    start_load();
    essential_opts.checksum = Util.checksum(essential_opts);

    console.log(essential_opts);

    $.ajax({
      url: generate_svg_endpoint,
      method: 'post', data: JSON.stringify(essential_opts),
      processData: false, headers: {'Accept': 'application/json'},
      dataType: 'json',
    }).then(res => {
      console.log(res);
      if (res.s3_url) {
        results_div.html(svg_success(res.s3_url));
        if (!res.duplicate) {
          generatePNG(res.s3_url, essential_opts.bg_color)
        } else {
          results_div.html(png_success(res.s3_url))
        }
      } else {
        results_div.html(error(res.err))
      }
      end_load()
    }).catch(err => {
      if (err.statusText === 'error') {
        const expected_url = `${svg_bucket}${essential_opts.checksum}.svg`;
        results_div.html(long_load_screen(expected_url));
      } else {
        console.log('Error', err);
        results_div.html(error(err.statusText));
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
      results_div.html(png_success(res.svg_url))
    }).catch(err => console.log(err))
  }

});