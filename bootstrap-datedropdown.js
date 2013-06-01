(function($){
    $.fn.dateDropdown = function(options){

        // defaults
        var settings = $.extend({
            dropdownPosition: "left",
            defaultChoice: 0,
            inputId: "",
            class: "date-dropdown",
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
        .append('<span class="current-option">')
        .append('<span class="caret">');

        var $btnGroup = $("<div>")
        .addClass("btn-group")
        .append($btn, $choices);

        var $input = $("<input>")
        .prop("id", settings.inputId)
        .prop("type", "text");

        var $dropdown = $(this)
        .addClass(alignmentClass)
        .addClass(settings.class);
        if (settings.dropdownPosition == "left") {
            $dropdown.append($btnGroup, $input);
        } else {
            $dropdown.append($input, $btnGroup);
        }

        // override the val() function, preserving previous functionality in
        // case of conflicts with other plugins unless the div has the
        // date-dropdown class
        var origHookGet, origHookSet;
        if ($.valHooks.div) {
            origHookGet = $.valHooks.div.get;
            origHookSet = $.valHooks.div.set;
        } else {
            $.valHooks.div = {};
        }

        $.valHooks.div = {
            get: function(elem) {
                if (!$(elem).hasClass(settings.class)) {
                    if (origHookGet) {
                        return origHookGet(elem);
                    } else {
                        return "";
                    }
                }
                return $(elem).find('input').val();
            },
            set: function(elem, val) {
                if (!$(elem).hasClass(settings.class)) {
                    if (origHookSet) {
                        origHookSet(elem, val);
                        return $(this);
                    }
                }
                return $(elem).find('input').val(val);
            }
        };

    };
})(jQuery);
