const Util = require('../src/util');
const expect = require('chai').expect;


describe('Util.checksum', function () {
  it('should create checksums from objects', function () {
    const obj1 = {a: 'str', b: [{'a key': 2, b: '12'}]};
    const obj2 = {a: 'str2', c: [{'b key': 2, xxx: null}]};
    expect(Util.checksum(obj1)).to.equal(Util.checksum(obj1));
    expect(Util.checksum(obj1)).to.not.equal(Util.checksum(obj2));
  });

  it('should create unique, repeatable checksums from objects or strings', function () {
    const str1 = 'gangster paradise';
    const str2 = 'gangsta paradise';
    const str3 = 'gangsta  paradise';
    expect(Util.checksum(str1)).to.equal(Util.checksum(str1));
    expect(Util.checksum(str1)).to.not.equal(Util.checksum(str2))
    expect(Util.checksum(str2)).to.not.equal(Util.checksum(str3))
  });

});

describe('Util.toHex', function () {
  it('should return valid hex codes or null', function () {
    expect(Util.toHex('fff')).to.equal('#FFF');
    expect(Util.toHex('#20C20E')).to.equal('#20C20E');
    expect(Util.toHex(null)).to.equal(null);
    expect(Util.toHex('sometext')).to.equal(null);
    expect(Util.toHex('#fa')).to.equal(null)
  });
});

describe('Util.getText', function () {
  it('should return \'too. short.\' if the user puts less than 2 sentences in', function () {
    const res = Util.getText('short');
    expect(res).to.equal('too.short.')
  });

  it('should strip newlines, smart quotes, extra spaces, trim, and lowercase', function () {
    const txt = `    I cannot describe to you my sensations on the near prospect of my
    undertaking...  It is -impossible- to communicate to you a conception of
    the trembling sensation, half pleasurable, and  half fearful, with which
    I am preparing to depart.  I am going to unexplored regions, to “the
    land of mist and snow,” but I shall kill no albatross; therefore do not
    be alarmed for my safety or if I should come back to you as worn and
    woeful as the “Ancient Mariner.” A question mark and contraction ain't stopping this?  
    Excitedly!    `;
    const sample = Util.getText(txt);
    const result = 'i cannot describe to you my sensations on the near prospect of my ' +
        'undertaking.it is impossible to communicate to you a conception of ' +
        'the trembling sensation half pleasurable and half fearful with which ' +
        'i am preparing to depart.i am going to unexplored regions to the land of ' +
        'mist and snow but i shall kill no albatross therefore do not be alarmed ' +
        'for my safety or if i should come back to you as worn and woeful as the ' +
        'ancient mariner.a question mark and contraction aint stopping this.excitedly.';
    expect(sample).to.equal(result)
  });
});


describe('Util.getSimpleParse', function () {
  it('should return 2 sentence lengths if the user puts less than 2 sentences in', function () {
    const text = Util.getText('sample');
    const res = Util.getSimpleParse(text);
    expect(res).to.have.ordered.members([1, 1])
  });

  it('should properly parse a simple paragraph', function () {
    const text = Util.getText('The script calculates the number of sentences in a ' +
        'given text input (1,349 in this case). Once the script has ' +
        'reduced the book to a list of sentences, we then transform ' +
        'those sentences into a number representing the number of words ' +
        'in a sentence. The previous sentence, for example, would be ' +
        'represented by 28 (28 words). We then draw a path using Python ' +
        'and SVG. Each straight line represents a sentence in the book - ' +
        'and its length is determined by how many words are in the sentence. ' +
        'At the end of each sentence, the path turns left 90 degrees.');
    const sentence_lengths = Util.getSimpleParse(text);
    expect(sentence_lengths.length).to.equal(6);
    expect(sentence_lengths).to.have.ordered.members([16, 28, 12, 9, 22, 12])
  });
});

describe('Util.gutenberg', function () {
  it('should remove Project Gutenberg header/footer', function () {
    const frank = `
    Project Gutenberg's Frankenstein, by Mary Wollstonecraft (Godwin) Shelley
    Title: Frankenstein or The Modern Prometheus
    Author: Mary Wollstonecraft (Godwin) Shelley
    Release Date: June 17, 2008 [EBook #84]
    Last updated: January 13, 2018
    Language: English
    Character set encoding: UTF-8
    
    *** START OF THIS PROJECT GUTENBERG EBOOK FRANKENSTEIN ***
    
    He sprang from the cabin-window as he said this, upon the ice raft which lay close to the vessel.
    
    *** END OF THIS PROJECT GUTENBERG EBOOK FRANKENSTEIN ***
    ***** This file should be named 84-0.txt or 84-0.zip *****
    This and all associated files of various formats will be found in:
            http://www.gutenberg.org/8/84/
    
    Produced by Judith Boss, Christy Phillips, Lynn Hanninen,
    and David Meltzer. HTML version by Al Haines.
    Further corrections by Menno de Leeuw.`;
    const gutenberg_text = Util.gutenberg(frank).trim();
    expect(gutenberg_text).to.equal('He sprang from the cabin-window as he said this, upon the ice raft which lay close to the vessel.');
  });
});

describe('Regexes', function () {
  it('should fix 1,234 -> 1234 and don\'t -> dont', function () {
    const txt = "don't have 1,234 babies".replace(/(\w)[\u2019\'](\w)|(\d),(\d)/gm, (a, b, c, d, e) => b ? b + c : d + e);
    expect(txt).to.equal('dont have 1234 babies')
  })
});
