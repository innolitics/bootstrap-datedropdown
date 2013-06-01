(function($){
    $.fn.dateDropdown = function(options){

        // defaults
        var settings = $.extend({
            dropdownPosition: "left",
            defaultChoice: 0,
            inputId: "",
        }, options || {});

        if (settings.dropdownPosition == "left") {
            var alignmentClass = "input-prepend";
        } else {
            var alignmentClass = "input-append";
        }

        var $choices = $("<ul>").addClass("dropdown-menu");
        for (var i = 0; i < settings.choices.length; i++) {
            var choice = settings.choices[i];
            var $link = $("<a>")
            .attr("href", "#")
            .text(choice.label);
            var $choice = $("<li>").append($link);
            $choices.append($choice);
        }

        var $btn = $("<button>")
        .addClass("btn dropdown-toggle")
        .attr("data-toggle", "dropdown")
        .append('<span class="currentOption">')
        .append('<span class="caret">');

        var $btnGroup = $("<div>")
        .addClass("btn-group")
        .append($btn, $choices);

        var $input = $("<input>")
        .prop("id", settings.inputId)
        .prop("type", "text");

        var $dropdown = $(this)
        .addClass(alignmentClass);
        if (settings.dropdownPosition == "left") {
            $dropdown.append($btnGroup, $input);
        } else {
            $dropdown.append($input, $btnGroup);
        }

    };
})(jQuery);
