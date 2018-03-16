const Util = require('./util');
const Form = require('./form');
const Colors = require('./colors');
const Components = require('./components');
const Config = require('./config');

$(document).ready(() => {
  const form = $('#word_art_form');
  const results_div = $('#display_results');
  const loading_div = $('#display_loading');
  const preset_select = $('#preset_color_select');
  const preset_div = $('#preset_color_swatch');
  const color_input_fields = ['input_line_bg_color', 'input_split_color', 'input_line_color'];

  /* Add our preset options to the select menu */
  preset_select.html(Components.getPresetOptions())
  preset_select.change(function (event) {
    const preset = event.currentTarget.value || null;
    if (preset && preset.length > 0 && Colors.Combos.filter(x => x.id === preset).length > 0) {
      const config = Colors.Combos.filter(x => x.id === preset)[0];
      $('#input_line_color').val(config.color);
      $('#input_line_bg_color').val(config.bg_color);
      $('#input_node_colors').val(config.node_colors.join(', '));
      $('#input_split_color').val(config.split_color);
      preset_div.html(Components.makeSwatchHTML(config));
      color_input_fields.forEach(x => $(`#${x}`).change())  // trigger change
      console.log(`Updated with color preset ${config.name}.`);
    } else {
      preset_div.html(null);
    }
  });

  const start_load = () => {
    form.hide(0);
    results_div.hide(0);
    loading_div.html(Components.svg_loading()).show(0)
  };

  const end_load = () => {
    loading_div.html(null).hide(0);
    results_div.show(0);
    form.show(0);
  };

  const update_icon_color = (input, hex) => {
    if (Util.isHexCode(hex)) {
      $(`#${input}_icon`).css('color', Util.toHex(hex))
    }
  }

  const make_icon_dynamic = (input) => {
    $(`#${input}`)
      .bind('input', (e) => update_icon_color(input, e.target.value))
      .on('change', (e) => update_icon_color(input, e.target.value))
  }

  color_input_fields.forEach(make_icon_dynamic);  // make the icons change color dynamically

  form.submit((e) => {
    e.stopPropagation();
    e.preventDefault();
    $("html, body").animate({ scrollTop: 0 }, "slow"); // smooth scroll to top

    // https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
    const essential_opts = Form.get_main_opts();
    start_load();
    essential_opts.checksum = Util.checksum(essential_opts);

    console.log(essential_opts);

    $.ajax({
      url: Config.generate_svg_endpoint,
      method: 'post', data: JSON.stringify(essential_opts),
      processData: false, headers: { 'Accept': 'application/json' },
      dataType: 'json',
    }).then(res => {
      console.log(res);
      if (res.s3_url) {
        results_div.html(Components.svg_success(res.s3_url));
        if (!res.duplicate) {
          generatePNG(res.s3_url, essential_opts.bg_color)
        } else {
          results_div.html(Components.png_success(res.s3_url))
        }
      } else {
        results_div.html(Components.svg_error(res.err))
      }
      end_load()
    }).catch(err => {
      if (err.statusText === 'error') {
        const expected_url = `${Config.svg_bucket}${essential_opts.checksum}.svg`;
        results_div.html(Components.long_load_screen(expected_url));
      } else {
        console.log('Error', err);
        results_div.html(Components.svg_error(err.statusText));
      }
      end_load()
    })
  });


  const generatePNG = (url, bg_color) => {
    $.ajax({
      url: Config.generate_png_endpoint,
      method: 'post',
      data: JSON.stringify({ url, bg_color }),
      processData: false,
      headers: {
        'Accept': 'application/json'
      },
      dataType: 'json',
    }).then(res => {
      console.log(res);
      results_div.html(Components.png_success(res.svg_url))
    }).catch(err => console.log(err))
  }

});