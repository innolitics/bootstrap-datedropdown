(function($){

    // UTILITY FUNCTIONS
    var date2string = function(date) {
        return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    };

    var string2date = function(str) {
        return new Date(str);
    };

    var parseDateOption = function(opt) {
        if (typeof(opt) == 'string') {
            return string2date(opt);
        } else {
            return opt;
        }
    };

    var getTextForCurrentValue = function(date, choice) {
        var text;
        switch (choice.type) {
            case 'constant':
                text = date2string(choice.value);
                break;
            case 'function':
                text = choice.date2text(date);
                break;
            case 'yearsAfter':
                text = String(date.getFullYear() - choice.origin.getFullYear());
                break;
            case 'pickDate':
                text = date2string(date);
                break;
            default:
                throw "Unreconized choice type."
        }
        return text;
    };

    // note, this isn't perfectly accurate
    var yearsBetweenDates = function(date1, date2) {
        return date1.getFullYear() - date2.getFullYear();
    };

    // DROPDOWN PLUGIN
    var initDropdown = function($dropdown, options) {

        // PARSE OPTIONS
        
        // defaults
        var settings = $.extend(true, {
            dropdownPosition: "left",
            defaultChoice: 0,
            inputId: "",
            initialValue: new Date('today'),
            class: "date-dropdown",
        }, options || {});

        settings.currentChoice = settings.choices[settings.defaultChoice];
        settings.currentValue = new Date(settings.initialValue.getTime());

        // convert date-strings to date-objects
        for (var i = 0; i < settings.choices.length; i++) {
            var choice = settings.choices[i];

            switch (choice.type) {
                case 'yearsAfter':
                    choice.origin = parseDateOption(choice.origin);
                    break;
                case 'constant':
                    choice.value = parseDateOption(choice.value);
                    break;
            }
        }

        // save a copy of choices onto the object
        $dropdown.data('settings', settings);

        // GENERATE HTML
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
        .append('<span class="current-option-label">')
        .append('<span class="caret">');

        var $btnGroup = $("<div>")
        .addClass("btn-group")
        .append($btn, $choices);

        var $input = $("<input>")
        .prop("id", settings.inputId)
        .prop("type", "text");

        if (settings.dropdownPosition == "left") {
            var alignmentClass = "input-prepend";
        } else {
            var alignmentClass = "input-append";
        }

        $dropdown.addClass(alignmentClass)
        .addClass(settings.class)
        if (settings.dropdownPosition == "left") {
            $dropdown.append($btnGroup, $input);
        } else {
            $dropdown.append($input, $btnGroup);
        }

        // SETUP VAL FUNCTIONS
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
                return date2string(settings.currentValue);
            },
            set: function(elem, val) {
                if (!$(elem).hasClass(settings.class)) {
                    if (origHookSet) {
                        origHookSet(elem, val);
                        return $dropdown;
                    }
                }
                settings.currentValue = parseDateOption(val);
                updateCurrentValue();
                return $dropdown;
            }
        };

        // CHANGE LISTENERS
        var updateCurrentValue = function() {
            var date;
            var choice = settings.currentChoice;
            var text = $input.val();
            switch (choice.type) {
                case 'constant':
                    date = choice.value;
                    break;
                case 'function':
                    date = choice.text2date(text);
                    break;
                case 'yearsAfter':
                    var yearsAfter = Number(text);
                    date = new Date(choice.origin.getTime());
                    date.setYear(date.getFullYear() + yearsAfter);
                    break;
                case 'pickDate':
                    date = new Date(text);
                    break;
                default:
                    throw "Unreconized choice type."
            }
            return date;
        };

        $input.change(function(){
            var date = updateCurrentValue();
            settings.currentValue = date;
        });

        $dropdown.find('li').click(function(){
            var choiceNumber = $(this).prevAll('li').size();
            $dropdown.dateDropdown('choice', choiceNumber);
        });
    };

    var changeDropdownState = function($dropdown, choiceNumber) {
        var settings = $dropdown.data().settings;
        var $input = $dropdown.find('input');
        var choice = settings.choices[choiceNumber];
        settings.currentChoice = choice;

        if (choice.type == 'constant') {
            settings.currentValue = choice.value;
        }

        var date = settings.currentValue;
        var text = getTextForCurrentValue(date, choice);
        $input.val(text);
        $dropdown.find('.current-option-label').text(choice.label + " ");
    };

    $.fn.dateDropdown = function(){
        $dropdown = $(this);

        if (arguments.length == 1) {
            initDropdown($dropdown, arguments[0]);
        }
        else if (arguments.length == 2 && arguments[0] == 'choice') {
            changeDropdownState($dropdown, arguments[1]);
        }
        return $dropdown;
    };
})(jQuery);
