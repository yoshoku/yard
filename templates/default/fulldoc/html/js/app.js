(function () {
  var localStorage = {},
    sessionStorage = {};
  try {
    localStorage = window.localStorage;
  } catch (e) {}
  try {
    sessionStorage = window.sessionStorage;
  } catch (e) {}

  function createSourceLinks() {
    $(".method_details_list .source_code").before(
      "<span class='showSource'>[<a href='#' class='toggleSource'>View source</a>]</span>"
    );
    $(".toggleSource").toggle(
      function () {
        $(this).parent().nextAll(".source_code").slideDown(100);
        $(this).text("Hide source");
      },
      function () {
        $(this).parent().nextAll(".source_code").slideUp(100);
        $(this).text("View source");
      }
    );
  }

  function createDefineLinks() {
    var tHeight = 0;
    $(".defines").after(" <a href='#' class='toggleDefines'>more...</a>");
    $(".toggleDefines").toggle(
      function () {
        tHeight = $(this).parent().prev().height();
        $(this).prev().css("display", "inline");
        $(this).parent().prev().height($(this).parent().height());
        $(this).text("(less)");
      },
      function () {
        $(this).prev().hide();
        $(this).parent().prev().height(tHeight);
        $(this).text("more...");
      }
    );
  }

  function createFullTreeLinks() {
    var tHeight = 0;
    $(".inheritanceTree").toggle(
      function () {
        tHeight = $(this).parent().prev().height();
        $(this).parent().toggleClass("showAll");
        $(this).text("(hide)");
        $(this).parent().prev().height($(this).parent().height());
      },
      function () {
        $(this).parent().toggleClass("showAll");
        $(this).parent().prev().height(tHeight);
        $(this).text("show all");
      }
    );
  }

  function searchFrameButtons() {
    $(".full_list_link").click(function () {
      toggleSearchFrame(this, $(this).attr("href"));
      return false;
    });
    window.addEventListener("message", function (e) {
      if (e.data === "navEscape") {
        $("#nav").slideUp(100);
        $("#search a").removeClass("active inactive");
        $(window).focus();
      }
    });

    $(window).resize(function () {
      if ($("#search:visible").length === 0) {
        $("#nav").removeAttr("style");
        $("#search a").removeClass("active inactive");
        $(window).focus();
      }
    });
  }

  function toggleSearchFrame(id, link) {
    var frame = $("#nav");
    $("#search a").removeClass("active").addClass("inactive");
    if (frame.attr("src") === link && frame.css("display") !== "none") {
      frame.slideUp(100);
      $("#search a").removeClass("active inactive");
    } else {
      $(id).addClass("active").removeClass("inactive");
      if (frame.attr("src") !== link) frame.attr("src", link);
      frame.slideDown(100);
    }
  }

  function linkSummaries() {
    $(".summary_signature").click(function () {
      document.location = $(this).find("a").attr("href");
    });
  }

  function summaryToggle() {
    $(".summary_toggle").click(function (e) {
      e.preventDefault();
      localStorage.summaryCollapsed = $(this).text();
      $(".summary_toggle").each(function () {
        $(this).text($(this).text() == "collapse" ? "expand" : "collapse");
        var next = $(this).parent().parent().nextAll("ul.summary").first();
        if (next.hasClass("compact")) {
          next.toggle();
          next.nextAll("ul.summary").first().toggle();
        } else if (next.hasClass("summary")) {
          var list = $('<ul class="summary compact" />');
          list.html(next.html());
          list.find(".summary_desc, .note").remove();
          list.find("a").each(function () {
            $(this).html($(this).find("strong").html());
            $(this).parent().html($(this)[0].outerHTML);
          });
          next.before(list);
          next.toggle();
        }
      });
      return false;
    });
    if (localStorage.summaryCollapsed == "collapse") {
      $(".summary_toggle").first().click();
    } else {
      localStorage.summaryCollapsed = "expand";
    }
  }

  function constantSummaryToggle() {
    $(".constants_summary_toggle").click(function (e) {
      e.preventDefault();
      localStorage.summaryCollapsed = $(this).text();
      $(".constants_summary_toggle").each(function () {
        $(this).text($(this).text() == "collapse" ? "expand" : "collapse");
        var next = $(this).parent().parent().nextAll("dl.constants").first();
        if (next.hasClass("compact")) {
          next.toggle();
          next.nextAll("dl.constants").first().toggle();
        } else if (next.hasClass("constants")) {
          var list = $('<dl class="constants compact" />');
          list.html(next.html());
          list.find("dt").each(function () {
            $(this).addClass("summary_signature");
            $(this).text($(this).text().split("=")[0]);
            if ($(this).has(".deprecated").length) {
              $(this).addClass("deprecated");
            }
          });
          // Add the value of the constant as "Tooltip" to the summary object
          list.find("pre.code").each(function () {
            console.log($(this).parent());
            var dt_element = $(this).parent().prev();
            var tooltip = $(this).text();
            if (dt_element.hasClass("deprecated")) {
              tooltip = "Deprecated. " + tooltip;
            }
            dt_element.attr("title", tooltip);
          });
          list.find(".docstring, .tags, dd").remove();
          next.before(list);
          next.toggle();
        }
      });
      return false;
    });
    if (localStorage.summaryCollapsed == "collapse") {
      $(".constants_summary_toggle").first().click();
    } else {
      localStorage.summaryCollapsed = "expand";
    }
  }

  function generateTOC() {
    if (document.querySelectorAll('#filecontents').length === 0) return;
    var _toc = document.createElement('ol');
    _toc.className = 'top';
    var show = false;
    var toc = _toc;
    var counter = 0;
    var tags = ['h2', 'h3', 'h4', 'h5', 'h6'];
    var i;
    var curli;
    if (document.querySelectorAll('#filecontents h1').length > 1) tags.unshift('h1');
    for (i = 0; i < tags.length; i++) { tags[i] = '#filecontents ' + tags[i]; }
    var lastTag = parseInt(tags[0][1], 10);
    document.querySelectorAll(tags.join(', ')).forEach(function(el) {
      var targetEls = document.querySelectorAll('.method_details .docstring');
      if (targetEls.length != 0) {
        var finded = false;
        var parentEl = el;
        while (!finded && ((parentEl = parentEl.parentElement) !== null)) {
          for (i = 0; i < targetEls.length; i++) {
            if (parentEl.isEqualNode(targetEls[i])) {
              finded = true;
              break;
            }
          }
        }
        if (finded) return;
      }
      if (el.id == "filecontents") return;
      show = true;
      var thisTag = parseInt(el.tagName[1], 10);
      if (el.id.length === 0) {
        var proposedId = el.getAttribute('toc-id');
        if (typeof(proposedId) != "undefined") el.id = proposedId;
        else {
          var proposedId = el.textContent.replace(/[^a-z0-9-]/ig, '_');
          if (document.querySelectorAll('#' + proposedId).length > 0) { proposedId += counter; counter++; }
          el.id = proposedId;
        }
      }
      if (thisTag > lastTag) {
        for (i = 0; i < thisTag - lastTag; i++) {
          if ( typeof(curli) == "undefined" ) {
            curli = document.createElement('li');
            toc.appendChild(curli);
          }
          toc = document.createElement('ol');
          curli.appendChild(toc);
          curli = undefined;
        }
      }
      if (thisTag < lastTag) {
        for (i = 0; i < lastTag - thisTag; i++) {
          toc = toc.parentNode;
          toc = toc.parentNode;
        }
      }
      var title = el.getAttribute('toc-title');
      if (title === null) title = el.textContent;
      curli = document.createElement('li');
      var curli_a = document.createElement('a');
      curli_a.href = '#' + el.id;
      curli_a.textContent = title;
      curli.appendChild(curli_a);
      toc.appendChild(curli);
      lastTag = thisTag;
    });
    if (!show) return;
    var tocEl = document.createElement('div');
    tocEl.id = 'toc';
    tocEl.innerHTML = '<p class="title hide_toc"><a href="#"><strong>Table of Contents</strong></a></p>';
    var contentEl = document.querySelector('#content');
    contentEl.insertBefore(tocEl, contentEl.firstChild);
    toc = document.querySelector('#toc');
    toc.appendChild(_toc);
    document.querySelector('#toc .hide_toc').addEventListener('click', function() {
      var tocTitleSmallEl = document.querySelector('#toc .title small');
      if (document.querySelector('#toc').classList.contains('hidden')) {
        document.querySelector('#toc .top').style.display = 'block';
        if (tocTitleSmallEl) tocTitleSmallEl.style.display = 'block';
      } else {
        document.querySelector('#toc .top').style.display = 'none';
        if (tocTitleSmallEl) tocTitleSmallEl.style.display = 'none';
      }
      document.querySelector('#toc').classList.toggle('hidden');
    });
  }

  function navResizeFn(e) {
    if (e.which !== 1) {
      navResizeFnStop();
      return;
    }

    sessionStorage.navWidth = e.pageX.toString();
    var el = document.querySelector('.nav_wrap');
    el.style.width = e.pageX + 'px';
    el.style.msFlex = 'inherit';
  }

  function navResizeFnStop() {
    window.removeEventListener('mousemove', navResizeFn);
    window.removeEventListener('message', navMessageFn, false);
  }

  function navMessageFn(e) {
    if (e.data.action === "mousemove") navResizeFn(e.data.event);
    if (e.data.action === "mouseup") navResizeFnStop();
  }

  function navResizer() {
    document.querySelector('#resizer').addEventListener('mousedown', function(e) {
      e.preventDefault();
      window.addEventListener('mousemove', navResizeFn);
      window.addEventListener('message', navMessageFn, false);
    });
    window.addEventListener('mouseup', navResizeFnStop);

    if (sessionStorage.navWidth) {
      navResizeFn({which: 1, pageX: parseInt(sessionStorage.navWidth, 10)});
    }
  }

  function navExpander() {
    if (typeof pathId === "undefined") return;
    var done = false,
      timer = setTimeout(postMessage, 500);
    function postMessage() {
      if (done) return;
      clearTimeout(timer);
      var opts = { action: "expand", path: pathId };
      document.getElementById("nav").contentWindow.postMessage(opts, "*");
      done = true;
    }

    window.addEventListener(
      "message",
      function (event) {
        if (event.data === "navReady") postMessage();
        return false;
      },
      false
    );
  }

  function mainFocus() {
    var hash = window.location.hash;
    if (hash !== '') {
      var el = document.querySelector(hash);
      if (el) el.scrollIntoView();
    }

    setTimeout(function() {
      document.querySelector('#main').focus();
    }, 10);
  }

  function navigationChange() {
    // This works around the broken anchor navigation with the YARD template.
    window.onpopstate = function () {
      var hash = window.location.hash;
      if (hash !== '') {
        var el = document.querySelector(hash);
        if (el) el.scrollIntoView();
      }
    };
  }

  document.addEventListener('DOMContentLoaded', function() {
    navResizer();
    navExpander();
    createSourceLinks();
    createDefineLinks();
    createFullTreeLinks();
    searchFrameButtons();
    linkSummaries();
    summaryToggle();
    constantSummaryToggle();
    generateTOC();
    mainFocus();
    navigationChange();
  });
})();
