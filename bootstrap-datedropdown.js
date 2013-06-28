!function($){

  "use strict";  // jshint ;_;


  /* DATEDROPDOWN PUBLIC CLASS DEFINITION
   * =============================== */

  var DateDropdown = function (element, options) {
    this.$element = $(element).hide()
    this.options = $.extend({}, $.fn.datedropdown.defaults, options)
    this.choices = this.options.choices || this.choices

    this.generateHtml()
    this.setupListeners()
    this.to(this.getDefaultChoice())
  }

  DateDropdown.prototype = {

    constructor: DateDropdown

    , generateHtml: function() {
      var options = this.options
      this.$choices = $("<ul>").addClass("dropdown-menu")

      for (var i = 0; i < this.choices.length; i++) {
        var choice = this.choices[i]
            , $link = $("<a>").text(choice.label)
            , $choice = $("<li>").append($link)

        this.$choices.append($choice)
      }

      this.$label = $('<span>')

      this.$btn = $("<button>")
          .attr(options.btnAttrs)
          .addClass("btn dropdown-toggle")
          .attr("data-toggle", "dropdown")
          .append(this.$label)
          .append('<span class="caret">')

      this.$btnGroup = $("<div>")
          .addClass("btn-group")
          .append(this.$btn, this.$choices)

      this.$input = $("<input>")
          .attr(options.inputAttrs)
          .prop("type", "text")


      this.$container = $("<div>")
      this.$element
          .after(this.$container)
          .appendTo(this.$container)

      if (options.dropdownPosition == "left") {
        this.$container
            .addClass("input-prepend")
            .append(this.$btnGroup, this.$input)
      } else {
        $container
            .addClass("input-append")
            .append(this.$input, this.$btnGroup)
      }

    }

    , setupListeners: function() {
      this.$input.on('change', $.proxy(this.process, this))

      var $element = this.$element
      this.$btnGroup.find('li').click(function(){
        // this approach is a bit hacky, but will keep working if people
        // dynamically change the number of choices
        var choiceNumber = $(this).prevAll('li').size()
        $element.dateDropdown(choiceNumber)
      })
    }
 
    , to: function(choiceNum) {

        if (choiceNum > (this.choices.length - 1) || choiceNum < 0) {
          return;
        }

        var choice = this.choices[choiceNum]
        this.choice = choice

        // translate date str to visible input text
        this.refresh()

        // translate back for consistency, important if you have a specified
        // date, but the initial choice is of constant type
        this.process()

        this.$input.prop('disabled', choice.type == 'constant')

        if (this.options.showLabels) {
          var initialDropdownWidth = this.$container.width()
          this.$label.text(choice.label + " ")
          this.$input.outerWidth(initialDropdownWidth - this.$btnGroup.outerWidth())
        }
      }


    , dateToString: function(date) {
        if (date == null) {
          return ""
        } else {
          return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear()
        }
    }

    , stringToDate: function(str) {
      try {
        return new Date(str)
      } catch(err) {
        return null
      }
    }

    , dateToInput: function(date, choice) {
      var input;
      switch (choice.type) {
        case 'constant':
          input = this.dateToString(choice.value)
          break
        case 'function':
          input = choice.dateToInput(date)
          break
        case 'yearsAfter':
          if (date == null) {
            input = ""
          } else {
            input = String(date.getFullYear() - choice.origin.getFullYear())
          }
          break
        case 'pickDate':
          input = this.dateToString(date)
          break
        default:
          throw "Unreconized choice type."
      }
      return input;
    }

    , inputToDate: function(input, choice) {
      var date
      switch (choice.type) {
        case 'constant':
          date = choice.value
          break
        case 'function':
          date = choice.inputToDate(input)
          break
        case 'yearsAfter':
          try {
            var offset = Number(input)
            date = this.yearsAfter(choice.origin, offset)
          } catch(err) {
            date = null
          }
          break
        case 'pickDate':
          date = this.stringToDate(input)
          break
        default:
          throw "Unreconized choice type."
      }
      return date
    }

    , yearsAfter: function(date, offset) {
      var out = new Date(date.getTime())
      out.setFullYear(date.getFullYear() + offset)
      return out;
    }

    // translate hidden input to visible input
    , refresh: function() {
        var initialDateStr = this.$element.val()
        var initialDate = this.stringToDate(initialDateStr)
        var input = this.dateToInput(initialDate, this.choice)
        this.$input.val(input)
    }

    // translate visible input to hidden input
    , process: function() {
      var input = this.$input.val()
      var date = this.inputToDate(input, this.choice)
      var dateStr = this.dateToString(date)
      this.$element.val(dateStr)
    }

    , getDefaultChoice: function() {
      var options = this.options
      if (options.defaultChoice) return options.defaultChoice

      for (var i = 0; i < this.choices.length; i++) {
        if (this.choices[i].default) {
          return i
        }
      }
      return 0
    }

    , destroy: function() {
      this.destroyHtml()
      this.$element
          .removeData('datedropdown')
          .show()
    }

    , destroyHtml: function() {
      this.$element
          .siblings()
          .remove()
      this.$element
          .unwrap()
    }
  }

  /* DATEDROPDOWN PLUGIN DEFINITION
   * ========================= */

  var old = $.fn.datedropdown

  $.fn.datedropdown = function ( option ) {
    return this.each(function () {
      var $this = $(this)
          , data = $this.data('datedropdown')
          , options = typeof option == 'object' && option
      if (!data) $this.data('datedropdown', (data = new DateDropdown(this, options)))
      if (typeof option == 'number') data.to(option)
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.datedropdown.Constructor = DateDropdown

  $.fn.datedropdown.defaults = {
    dropdownPosition: "left"
    , inputAttrs: {}
    , btnAttrs: {}
    , showLabels: true
    , valueChange: undefined
  }


  /* DATEDROPDOWN NO CONFLICT
   * =================== */

  $.fn.datedropdown.noConflict = function () {
    $.fn.datedropdown = old
    return this
  }

}(window.jQuery);
