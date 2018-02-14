$(document).ready(() => {
  const form = $('#word_art_form');

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

    const endpoint = `https://gy2aa8c57c.execute-api.us-east-1.amazonaws.com/dev/`;

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
        .then(res => console.log(res))
        .catch(err => console.log(err))

    // TODO now render, or display download link, or something
  })

});