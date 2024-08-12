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
    document.querySelectorAll('.method_details_list .source_code').forEach(function(el) {
      var aNode = document.createElement('a');
      aNode.href = '#';
      aNode.className = 'toggleSource';
      aNode.appendChild(document.createTextNode('View source'));
      aNode.addEventListener('click', function(e) {
        e.preventDefault();
        if (this.textContent === 'View source') {
          this.parentNode.nextElementSibling.style.display = 'block';
          this.textContent = 'Hide source';
        } else {
          this.parentNode.nextElementSibling.style.display = 'none';
          this.textContent = 'View source';
        }
      });
      var spanNode = document.createElement('span');
      spanNode.className = 'showSource';
      spanNode.appendChild(document.createTextNode('['));
      spanNode.appendChild(aNode);
      spanNode.appendChild(document.createTextNode(']'));
      el.parentNode.insertBefore(spanNode, el);
    });
  }

  function createDefineLinks() {
    var tHeight = 0;
    var defsEl = document.querySelector('.defines');
    if (defsEl) {
      var aNode = document.createElement('a');
      aNode.href = '#';
      aNode.className = 'toggleDefines';
      aNode.appendChild(document.createTextNode('more...'));
      aNode.addEventListener('click', function(e) {
        e.preventDefault();
        if (this.textContent === 'more...') {
          tHeight = this.parentNode.previousElementSibling.innerHeight;
          this.previousElementSibling.style.display = 'inline';
          this.parentNode.previousElementSibling.style.height = this.parentNode.innerHeight + 'px';
          this.textContent = '(less)';
        } else {
          this.previousElementSibling.style.display = 'none';
          this.parentNode.previousElementSibling.style.height = tHeight + 'px';
          this.textContent = 'more...';
        }
      });
      defsEl.parentNode.insertBefore(aNode, defsEl.nextElementSibling);
    }
  }

  function createFullTreeLinks() {
    var tHeight = 0;
    var inhTreeEl = document.querySelector('.inheritanceTree');
    if (inhTreeEl) {
      inhTreeEl.addEventListener('click', function(e) {
        e.preventDefault();
        if (this.textContent === 'show all') {
          tHeight = this.parentNode.previousElementSibling.innerHeight;
          this.parentNode.classList.add('showAll');
          this.parentNode.previousElementSibling.style.height = this.parentNode.innerHeight + 'px';
          this.textContent = '(hide)';
        } else {
          this.parentNode.classList.remove('showAll');
          this.parentNode.previousElementSibling.style.height = tHeight + 'px';
          this.textContent = 'show all';
        }
      });
    }
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
    var sumSignEl = document.querySelector('.summary_signature');
    if (sumSignEl) {
      sumSignEl.addEventListener('click', function() {
        var aTag = this.getElementsByTagName('a')[0];
        if (aTag) document.location = aTag.getAttribute('href');
      });
    }
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
