$(document).ready(function () {
  if ($(".obj-type").val() == "circle") {
    $(".radius-input").show();
    $(".rect-input").hide();
  } else {
    $(".radius-input").hide();
    $(".rect-input").show();
  }
});

$(".obj-type").click(function () {
  if ($(".obj-type").val() == "circle") {
    $(".radius-input").show();
    $(".rect-input").hide();
  } else {
    $(".radius-input").hide();
    $(".rect-input").show();
  }
});
