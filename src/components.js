const Util = require('./util');
const Colors = require('./colors');
const Config = require('./config');
const Components = {};

Components.long_load_screen = (url) => {
    return `<p class="text-info text-center">Your SVG file is taking a while to generate.<br/>
    It will eventually be uploaded here.<br />
    <a href="${url}" class="mt-2 mb-2"><small><strong>${url}</strong></small></a> 
    <br/>Try clicking this link in a minute or two :)</p>`;
};

Components.svg_loading = () => {
    return `<div class="col-12 py-5 my-5 text-center">
    <p class="lead text-info text-center">Now generating your SVG file...</p>
    <i id="loading-icon" class="fa fa-life-ring fa-spin text-info" style="font-size: 24px;"></i>
    </div>`;
};

Components.svg_success = (svg_url) => {
    return `<p class="lead text-success text-center">Your SVG file has been generated</p>
    <a href="${svg_url}" target="_blank" role="button" class="btn btn-md btn-success">Download SVG</a>
    ${Components.png_generating()}`
};

Components.png_success = (svg_url) => {
    const png_filename = Util.extensionSVGtoPNG(Util.getFileName(svg_url));
    const png_url = `${Config.png_bucket}${png_filename}`;
    return `
    <p class="lead text-success text-center">${Util.getExpression()} Your files are ready!</p>
    <div class="row">
        <div class="col pb-2"> 
            <div class="btn-group" role="group">
                <a href="${svg_url}" target="_blank" role="button" class="btn btn-md btn-success">Download SVG</a>
                ${Components.png_download(png_url)}
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col pb-2">
            ${Components.canvaspop_button(png_url)}
        </div>
    </div>
    <div class="row">
        ${Components.preview(png_url)}
    </div>
    `
};

Components.svg_error = (err) => {
    return `<p class="text-danger">There was an error generating your SVG file: 
    <strong>${err}</strong>
    <br/>Huge books (like the Bible) can sometimes overload the server.</p>`;
};

Components.png_generating = () => {
    return `<a class="btn btn-md btn-primary" id="png_loading_btn" role="button" href="#">
            <i class="fa fa-cog fa-spin" style="font-size:24px"></i>
            Generating PNG</a>`
};

Components.png_download = (png_url) => {
    return `<a href="${png_url}" target="_blank" role="button" id="png_download_btn" class="btn btn-md btn-primary">
    Download PNG
    </a>`
};

Components.canvaspop_button = (png_url) => {
    return `<a href="${Components.get_canvaspop_url(png_url)}" target="_blank" role="button" id="canvaspop_store_btn" class="btn btn-md btn-dark">
    Buy Now on CanvasPop
    </a>`
};

Components.get_canvaspop_url = (url) => {
    return `https://store.canvaspop.com/api/pull?image_url=${url}&access_key=15549806e27b7565977dabf10b992dbd`
};

Components.preview = (png_url) => {
    return `<div class="col-12 text-center">
                <a href="${Components.get_canvaspop_url(png_url)}" target="_blank">
                    <img src="${png_url}" class="img-fluid" style="width: 200px;"/>
                </a>
            </div>`
};

Components.makeSwatchHTML = (config_obj) => {
    return `
   <div class="row">

    <div class="col-xs-12 col-sm-12 col-md-4 col-lg-4">
        <div class="card mb-1 box-shadow">
            <img class="card-img-top" style="background-color: ${config_obj.bg_color}; width: 100%; height: 100px;">
            <div class="card-body text-center">
                <p class="card-text">${config_obj.bg_color}</p>
                <small class="text-muted">Background</small>
            </div>
        </div>
    </div>

    <div class="col-xs-5 col-sm-6 col-md-4 col-lg-4">
        <div class="card mb-1 box-shadow">
            <img class="card-img-top" style="background-color: ${config_obj.color}; width: 100%; height: 100px;">
            <div class="card-body text-center">
                <p class="card-text">${config_obj.color}</p>
                <small class="text-muted">Primary</small>
            </div>
        </div>
    </div>

    <div class="col-xs-5 col-sm-6 col-md-4 col-lg-4">
        <div class="card mb-1 box-shadow">
            <img class="card-img-top" style="background-color: ${config_obj.split_color}; width: 100%; height: 100px;">
            <div class="card-body text-center">
                <p class="card-text">${config_obj.split_color}</p>
                <small class="text-muted">Highlight</small>
            </div>
        </div>
    </div>
    </div>
    `
};

Components.getPresetOptions = () => {
    const opts = Colors.Combos.map(x => `<option value="${x.id}">${x.name}</option>`)
    opts.unshift('<option value="">Custom</option>')
    return opts
};

module.exports = Components;
