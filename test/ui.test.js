const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const Colors = require('../src/colors');
const Components = require('../src/components');
const Config = require('../src/config');

describe('generator interface', function () {
  const template = fs.readFileSync(
    path.resolve(__dirname, '..', 'src', 'index.html'),
    'utf8',
  );

  it('keeps the original text and color tools discoverable', function () {
    expect(template).to.contain('https://www.gutenberg.org/browse/scores/top');
    expect(template).to.contain('Create your own');
    expect(template).to.contain('<details class="advanced-controls" open>');
    expect(template).to.contain('id="input_line_color_picker"');
    expect(template).to.contain('id="input_line_bg_color_picker"');
    expect(template).to.contain('id="input_split_color_picker"');
  });

  it('cache-busts both browser assets from one build version', function () {
    const versionExpression = '<%= htmlWebpackPlugin.options.assetVersion %>';

    expect(template).to.contain(`app.css?v=${versionExpression}`);
    expect(template).to.contain(`app.bundle.js?v=${versionExpression}`);
  });

  it('selects the configured palette by default', function () {
    const options = Components.getPresetOptions(Config.default_preset);

    expect(options).to.contain(`value="${Config.default_preset}" selected`);
    expect(Colors.Combos.some(combo => combo.id === Config.default_preset)).to.equal(true);
  });

  it('explains every color in the palette preview', function () {
    const preview = Components.makeSwatchHTML(Colors.Combos[0]);

    expect(preview).to.contain('Canvas');
    expect(preview).to.contain('Path');
    expect(preview).to.contain('Start / end');
    expect(preview).to.contain('Highlight');
    expect(preview).to.not.contain('Primary');
  });
});
