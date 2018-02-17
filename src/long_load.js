const LongLoad = {};

LongLoad.exists = (url) => {
  $.ajax({
    type: 'HEAD',
    url: url,
  }).then(r => true).catch(e => LongLoad.exists(url));
}

//todo CHECK IF FILE ALREADY EXISTS ON S3
// todo fix
LongLoad.wait = (url) => {
  try {
    console.log('in here now')
    LongLoad.exists(url).then(res=>res).catch(e=>e)
  } catch (e) {
    console.log(e)
    return e
  }
}

module.exports = LongLoad;