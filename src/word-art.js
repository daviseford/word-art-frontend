$(document).ready(() => {
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
  const error = (err) => `<p class="text-danger">There was an error generating your SVG file: ${err}</p>`;

  const getText = (txt) => {
    txt = txt.trim().replace(/[“”‘’]/g, '');
    return txt.toLowerCase()
  };

  const getColor = (color) => color.trim().length > 0 ? color.trim() : null;

  const getSplitText = (txt) => {
    if (txt.trim().length > 0) {
      return txt.split(',').map(x => x.trim().toLowerCase())
    }
    return null;
  };

  form.submit((e) => {
    e.stopPropagation();
    e.preventDefault();

    // https://stackoverflow.com/questions/1184624/convert-form-data-to-javascript-object-with-jquery
    const serialized = form.serializeArray();
    const text = getText(serialized[0].value);
    const color = getColor(serialized[1].value);
    const node_colors = getSplitText(serialized[2].value);
    const split = {
      words: getSplitText(serialized[3].value),
      color: getColor(serialized[4].value)
    };

    const standard_opts = {text, color, node_colors};
    const essential_opts = Object.keys(standard_opts).reduce((a, key) => {
      if (!standard_opts[key] || standard_opts[key] === '') return a;
      a[key] = standard_opts[key];
      return a
    }, {});

    /* Check if split needs to be included */
    if (split.words && split.color) {
      essential_opts['split'] = split
    }

    start_load();

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
          console.log(err);
          results.html(error(res.err));
          end_load()
        })

  })


});