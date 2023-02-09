// jQuery appropriately sets the selected divs to show/hide when the document/html is loaded

$(document).ready(function () {
  if ($("#display-graphs").is(':checked')) {
    $('#Graphs').show();
  }
  else {
    $('#Graphs').show();
  }
  let autoScaleBox = $('#auto-scale-displacement-y');
  if ($(autoScaleBox).is(':checked')) {
    $(".y-displacement-inputs").hide();
  }
  else{
    $(".y-displacement-inputs").show();
  }
  autoScaleBox = $('#auto-scale-velocity-y');
  if ($(autoScaleBox).is(':checked')) {
    $(".y-velocity-inputs").hide();
  }
  else{
    $(".y-velocity-inputs").show();
  }
  autoScaleBox = $('#auto-scale-acceleration-y');
  if ($(autoScaleBox).is(':checked')) {
    $(".y-acceleration-inputs").hide();
  }
  else{
    $(".y-acceleration-inputs").show();
  }
  autoScaleBox = $('#auto-scale-kinetic-energy-y');
  if ($(autoScaleBox).is(':checked')) {
    $(".y-kinetic-energy-inputs").hide();
  }
  else{
    $(".y-kinetic-energy-inputs").show();
  }
});

// following jQuery shows/hides divs appropriately when a user chooses certain options

$(".auto-scale-displacement").click(function () {
  let autoScaleBox = $('#auto-scale-displacement-y');
  if ($(autoScaleBox).is(':checked')) {
    $(".y-displacement-inputs").hide();
  }
  else{
    $(".y-displacement-inputs").show();
  }
})

$(".auto-scale-velocity").click(function () {
  let autoScaleBox = $('#auto-scale-velocity-y');
  if ($(autoScaleBox).is(':checked')) {
    $(".y-velocity-inputs").hide();
  }
  else{
    $(".y-velocity-inputs").show();
  }
})

$(".auto-scale-acceleration").click(function () {
  let autoScaleBox = $('#auto-scale-acceleration-y');
  if ($(autoScaleBox).is(':checked')) {
    $(".y-acceleration-inputs").hide();
  }
  else{
    $(".y-acceleration-inputs").show();
  }
})


$(".auto-scale-kinetic-energy").click(function () {
  let autoScaleBox = $('#auto-scale-kinetic-energy-y');
  if ($(autoScaleBox).is(':checked')) {
    $(".y-kinetic-energy-inputs").hide();
  }
  else{
    $(".y-kinetic-energy-inputs").show();
  }
})

$(".display-graphs-div").click(function () {
  if ($("#display-graphs").is(':checked')) {
    $('.graph-inputs').show();
  }
  else {
    $('.graph-inputs').hide();
  }
})
