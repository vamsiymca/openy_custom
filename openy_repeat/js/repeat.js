(function ($) {
  if (!$('.schedule-dashboard__wrapper').length) {
    return;
  }

  var locationPage = window.OpenY.field_prgf_repeat_schedules_pref[0] || '';
  if (locationPage) {
    $('.clear-all').attr('href', locationPage.url).removeClass('hidden');
  }

  var currentDate = moment().format('MMMM D, dddd'),
      // datepicker = $('#datepicker input'),
      eventLocation = '',
      eventCategory = '';

  var globalData = {
    date: currentDate,
    location: '',
    category: '',
    table: []
  };

  // +/- Toggle.
  $('.schedule-dashboard__sidebar .navbar-header a[data-toggle], .form-group-wrapper label[data-toggle]').on('click', function() {
    if (!$('.' + $(this).attr('for')).hasClass('collapsing')) {
      $(this)
        .toggleClass('closed active')
        .find('i')
        .toggleClass('fa-minus fa-plus');
    }
  });

  // PDF link show/hidden.
  var pdfLink = window.OpenY.field_prgf_repeat_schedules_pdf[0] || '';
  if (pdfLink) {
    $('.btn-schedule-pdf')
      .removeClass('hidden')
      .attr('href', pdfLink.url);
  }

  /* Check the settings of whether to display Instructor column or not */
  function displayInstructorOrNot() {
    var instructorDisplay = window.OpenY.field_prgf_repeat_schedule_instr[0].value;
    if (parseInt(instructorDisplay) != 1) {
      $('.instructor-column').remove();
    }
  }
  displayInstructorOrNot();

  // Set number of column classes.
  if ($('.schedules-data__header').length > 0) {
    var colCount = $('.schedules-data__header > div').length;
    $('.schedules-data').addClass('schedules-data__cols-' + colCount);
  }

  var router = new VueRouter({
      mode: 'history',
      routes: []
  });

  // Retrieve the data via vue.js.
  new Vue({
    el: '#app',
    router,
    data: {
      globalData: globalData,
      date: '',
      locations: [],
      categories: [],
      categoriesExcluded: [],
      locationPopup: {
        address: '',
        email: '',
        phone: '',
        title: ''
      },
      classPopup: {
        title: '',
        description: ''
      }
    },
    components: {
      //Results
    },
    created() {
      var component = this;

      // If there are any exclusions available from settings.
      var exclusionSettings = window.OpenY.field_prgf_repeat_schedule_excl || {};
      exclusionSettings.forEach(function(item){
        component.categoriesExcluded.push(item.title);
      });

      var dateGet = this.$route.query.date;
      if (dateGet) {
        this.date = dateGet;
      }
      else {
        this.date = moment().format('D MMM YYYY');
      }

      var locationsGet = this.$route.query.locations;
      if (locationsGet) {
        this.locations = locationsGet.split(',');
      }

    },
    mounted() {
      /* It doesn't work if try to add datepicker in created. */
      var component = this;
      $('#datepicker input').datepicker({
        format: "MM d, DD",
        multidate: false,
        keyboardNavigation: false,
        forceParse: false,
        autoclose: true,
        todayHighlight: true
      }).on('changeDate', function() {
        if ($(this).val() != '') {
          component.date = moment($(this).datepicker('getDate')).format('D MMM YYYY');
        }
      });
    },
    watch: {
      'date': function(newValue, oldValue) {
        this.runAjaxRequest();
      },
      'locations': function(newValue, oldValue) {
        this.runAjaxRequest();
      },
      'categories': function(newValue, oldValue) {
        this.runAjaxRequest();
      }
    },
    computed: {
      dateFormatted: function(){
        return moment(this.date).format('MMMM D, dddd');
      }
    },
    methods: {
      runAjaxRequest: function() {
        var component = this;

        var url = drupalSettings.path.baseUrl + 'schedules/get-event-data';
        url += this.locations.length > 0 ? '/' + this.locations.join(',') : '/0';
        url += this.categories.length > 0 ? '/' + this.categories.join(',') : '/0';
        url += this.date ? '/' + this.date : '';
        url += this.categoriesExcluded.length > 0 ? '?excl=' + this.categoriesExcluded.join(',') : '';

        $('.schedules-empty_results').addClass('hidden');
        $('.schedules-loading').removeClass('hidden');

        $.getJSON(url, function(data) {
          component.globalData.table = data;
          if (data.length === 0) {
            $('.schedules-empty_results').removeClass('hidden');
          }
          $('.schedules-loading').addClass('hidden');
        });

        router.push({ query: {
          date: this.date,
          locations: this.locations.join(','),
          categories: this.categories.join(',')
        }});

        console.log(this.date);
        console.log(this.locations);
        console.log(this.categories);
      },
      populatePopupL: function(index) {
        this.locationPopup = this.globalData.table[index].location_info;
      },
      populatePopupC: function(index) {
        this.classPopup = this.globalData.table[index].class_info;
      },
      backOneDay: function() {
        this.date = moment(this.date).add(-1, 'day').format('D MMM YYYY');
      },
      forwardOneDay: function() {
        this.date = moment(this.date).add(1, 'day').format('D MMM YYYY');
      },
      addToCalendarDate: function(dateTime) {
        var dateTimeArray = dateTime.split(' ');
        return moment(this.date).format('YYYY-MM-D') + ' ' + dateTimeArray[1];
      },
      categoryExcluded: function(category) {
        return this.categoriesExcluded.indexOf(category) !== -1;
      }
    },
    updated: function() {
      if (typeof(addtocalendar) !== 'undefined') {
        addtocalendar.load();
      }
    },
    delimiters: ["${","}"]
  });

})(jQuery);
