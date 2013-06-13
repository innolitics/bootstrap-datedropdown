(function($){

    // PLUGIN GLOBALS
    
    // all divs that are convereted to date-dropdown widgets are expected to
    // have this class
    DIV_CLASS = "date-dropdown";

    // UTILITY FUNCTIONS
    function castDateToString(date) {
        return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    };

    function castStringToDate(str) {
        return new Date(str);
    };

    function castToDate(opt) {
        if (typeof(opt) == 'string') {
            return castStringToDate(opt);
        } else if (opt.getMonth) {
            return new Date(opt.getTime());
        }
    };

    function yearsAfter(date, offset) {
      var out = new Date(date.getTime());
      out.setFullYear(date.getFullYear() + offset);
      return out;
    };

    function isValidDate(d) {
      if ( Object.prototype.toString.call(d) !== "[object Date]" )
        return false;
      return !isNaN(d.getTime());
    };

    function dateToInput(date, choice) {
        var input;
        switch (choice.type) {
            case 'constant':
                input = castDateToString(choice.value);
                break;
            case 'function':
                input = choice.dateToInput(date);
                break;
            case 'yearsAfter':
                input = String(date.getFullYear() - choice.origin.getFullYear());
                break;
            case 'pickDate':
                input = castDateToString(date);
                break;
            default:
                throw "Unreconized choice type.";
        }
        return input;
    };

    function inputToDate(input, choice) {
        var date;
        switch (choice.type) {
            case 'constant':
                date = choice.value;
                break;
            case 'function':
                date = choice.inputToDate(input);
                break;
            case 'yearsAfter':
                var offset = Number(input);
                date = yearsAfter(choice.origin, offset);
                break;
            case 'pickDate':
                date = new Date(input);
                break;
            default:
                throw "Unreconized choice type."
        }
        return date;
    };


    // note, this isn't perfectly accurate
    function yearsBetweenDates(date1, date2) {
        return date1.getFullYear() - date2.getFullYear();
    };

    // DROPDOWN PLUGIN

    function dateDropdownInit($dropdown, options) {

        $dropdown.each(function(){
            // PARSE OPTIONS
            
            // defaults
            var settings = $.extend(true, {
                dropdownPosition: "left",
                defaultChoice: 0,
                inputAttrs: {},
                btnAttrs: {},
                defaultValue: castDateToString(new Date()),
                alwaysShowLabels: true,
                valueChange: undefined,
                inputId: "datedropdown" + $(".datedropdown"),
                inputName: "datedropdown" + $(".datedropdown"),
            }, options || {});

            // convert date-strings to date-objects
            for (var i = 0; i < settings.choices.length; i++) {
                var choice = settings.choices[i];

                switch (choice.type) {
                    case 'yearsAfter':
                        choice.origin = castToDate(choice.origin);
                        break;
                    case 'constant':
                        choice.value = castToDate(choice.value);
                        break;
                }
            }

            var choice = settings.choices[settings.defaultChoice];
            settings.currentChoice = choice;
            settings.currentDate = inputToDate(settings.defaultValue, choice);

            // save a copy of choices onto the object for later access
            $dropdown.data('settings', settings);

            // GENERATE HTML
            var $choices = $("<ul>").addClass("dropdown-menu");
            for (var i = 0; i < settings.choices.length; i++) {
                var choice = settings.choices[i];
                var $link = $("<a>")
                .text(choice.label);
                var $choice = $("<li>").append($link);
                $choices.append($choice);
            }

            var $btn = $("<button>")
            .attr(settings.btnAttrs)
            .addClass("btn dropdown-toggle")
            .attr("data-toggle", "dropdown")
            .append('<span class="current-option-label">')
            .append('<span class="caret">');

            var $btnGroup = $("<div>")
            .addClass("btn-group")
            .append($btn, $choices);

            var $input = $("<input>")
            .attr(settings.inputAttrs)
            .prop("type", "text");

            var $hiddenInput = $("<input>")
            .attr("type", "hidden")
            .attr("id", settings.inputId)
            .attr("name", settings.inputName);

            if (settings.dropdownPosition == "left") {
                var alignmentClass = "input-prepend";
            } else {
                var alignmentClass = "input-append";
            }

            $dropdown.addClass(alignmentClass)
            .addClass(DIV_CLASS);
            if (settings.dropdownPosition == "left") {
                $dropdown.append($btnGroup, $input);
            } else {
                $dropdown.append($input, $btnGroup);
            }
            $dropdown.append($hiddenInput);

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
                    if (!$(elem).hasClass(DIV_CLASS)) {
                        if (origHookGet) {
                            return origHookGet(elem);
                        } else {
                            return "";
                        }
                    }
                    var settings = $(elem).data('settings');
                    return castDateToString(settings.currentDate);
                },
                set: function(elem, val) {
                    if (!$(elem).hasClass(DIV_CLASS)) {
                        if (origHookSet) {
                            origHookSet(elem, val);
                            return $dropdown;
                        }
                    }
                    var settings = $(elem).data('settings');
                    try {
                        var oldVal = $(elem).val();
                    } catch(err) {
                        // continue
                    }
                    var newVal = castToDate(val);
                    $(elem).find("input[type=hidden]").val(castDateToString(newVal));
                    settings.currentDate = newVal;
                    if (settings.valueChange && oldVal && oldVal !== newVal) {
                        settings.valueChange(settings.currentDate);
                    }
                    return $dropdown;
                }
            };

            // CHANGE LISTENERS
            $input.change(function(){
                var settings = $dropdown.data('settings');
                var choice = settings.currentChoice;
                var text = $input.val();
                var date = inputToDate(text, choice);
                $dropdown.val(date);
            });

            $dropdown.find('li').click(function(){
                var choiceNumber = $(this).prevAll('li').size();
                $dropdown.dateDropdown(choiceNumber);
            });

            // SET THE INITIAL VALUE
            $dropdown.dateDropdown(settings.defaultChoice);
            $hiddenInput.val($dropdown.val());
        });
    };

    var dateDropdownSelect = function($dropdown, choiceNumber) {
        $dropdown.each(function(){
            var $dropdown = $(this);
            var settings = $dropdown.data('settings');
            var $btnGroup = $dropdown.find('.btn-group');
            var $input = $dropdown.find('input[type=text]');
            var choice = settings.choices[choiceNumber];
            var initialDropdownWidth = $dropdown.width();

            settings.currentChoice = choice;

            if (choice.type == 'constant') {
                $dropdown.val(choice.value);
                $input.prop('disabled', true);
            } else {
                $input.prop('disabled', false);
            }

            var date = settings.currentDate;
            if (isValidDate(date)) {
                var text = dateToInput(date, choice);
            } else {
                var text = "";
            }
            $input.val(text);

            if (settings.alwaysShowLabels) {
                $dropdown.find('.current-option-label').text(choice.label + " ");
            }

            // ensure that the width of the total widget is constant
            $input.outerWidth(initialDropdownWidth - $btnGroup.outerWidth());
        });
    };

    var dateDropdownRefresh = function($dropdown) {
        $dropdown.each(function(){
            var $dropdown = $(this);
            var settings = $dropdown.data('settings');
            var text = dateToInput(settings.currentDate, settings.currentChoice);
            $dropdown.find('input[type=text]').val(text);
        })
    };

    $.fn.dateDropdown = function(arg){
        var $dropdown = $(this);

        if (typeof(arg) == 'object') {
            dateDropdownInit($dropdown, arg);
        }
        else if (arg == 'refresh') {
            dateDropdownRefresh($dropdown);
        }
        else if (typeof(arg) == 'number') {
            dateDropdownSelect($dropdown, arg);
        }
        return $dropdown;
    };
})(jQuery);
