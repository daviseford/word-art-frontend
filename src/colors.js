const $ = require('jquery');
const Combos = [
  {
    name: 'Ocean Fire',
    id: 'oceanfire',
    color: '#78E5EB',
    bg_color: '#052D3E',
    node_colors: ['#D87D0F', '#A63305'],
    split_color: '#F4C127'
  },
  {
    name: 'New Noir',
    id: 'newnoir',
    color: '#868A8B',
    bg_color: '#2D3C3F',
    node_colors: ['#606C76', '#606C76'],
    split_color: '#D7DCF2'
  },
  {
    name: 'Bold USA',
    id: 'boldusa',
    color: '#E74C3C',
    bg_color: '#ECF0F1',
    node_colors: ['#2980B9', '#2C3E50'],
    split_color: '#3498DB'
  },
  // {
  //   name: '',
  //   color: '',
  //   bg_color: '',
  //   node_colors: [],
  //   split_color: ''
  // },
]


const assignPrefillFuncs = () => {
  const color = $('#input_line_color')
  const bg_color = $('#input_line_bg_color')
  const node_colors = $('#input_node_colors')
  const split_color = $('#input_split_color')

  Combos.forEach(x => {
    $(`#${x.id}`).click((e) => {
      e.preventDefault()
      e.stopPropagation()
      console.log(`Updated with color preset ${x.name}.`);
      color.val(x.color)
      bg_color.val(x.bg_color)
      split_color.val(x.split_color)
      node_colors.val(x.node_colors.join(', '))
    })
  })
}


module.exports = {
  Combos,
  assignPrefillFuncs,
}