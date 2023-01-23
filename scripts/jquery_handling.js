// jQuery appropriately sets the selected divs to show/hide when the document/html is loaded
$(document).ready(function () {
  if ($(".obj-type").val() == "circle") {
    $(".radius-input").show();
    $(".rect-input").hide();
  } else {
    $(".radius-input").hide();
    $(".rect-input").show();
  }
  let autoScaleBox = $('#auto-scale-y')
  if ($(autoScaleBox).is(':checked')) {
    $(".y-inputs").hide();
  }
  else{
    $(".y-inputs").show();
  }
});

// following jQuery shows/hides divs appropriately when a user chooses certain options

$(".obj-type").click(function () {
  if ($(".obj-type").val() == "circle") {
    $(".radius-input").show();
    $(".rect-input").hide();
  } else {
    $(".radius-input").hide();
    $(".rect-input").show();
  }
});

$(".auto-scale-div").click(function () {
  let autoScaleBox = $('#auto-scale-y')
  if ($(autoScaleBox).is(':checked')) {
    $(".y-inputs").hide();
  }
  else{
    $(".y-inputs").show();
  }
})
