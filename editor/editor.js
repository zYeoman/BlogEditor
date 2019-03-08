/*
 * editor.js
 * Copyright (C) 2019 Yongwen Zhuang <zeoman@163.com>
 *
 * Distributed under terms of the MIT license.
 */
(function(){
  'use strict';
  var myTextarea = document.getElementById('md')
  var editor = HyperMD.fromTextArea(myTextarea, {
    // for code fence highlighting
    hmdModeLoader: "https://cdn.jsdelivr.net/npm/codemirror/",
  })
  editor.on("change", debounce(function(cm, change){
    var reg = /date: \d*-\d*-\d*.*/
    var localTimeString = localeTime()
    postAjax(window.location.href, {data:editor.getValue().replace(reg, 'date: '+localTimeString)}, (responseText)=>{
      Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000

      }).fire({
          type: 'success',
          title: responseText
      })
    })
  }, 5000))

  function localeTime() {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -5).replace("T", " ") + " +0800";
  }

// https://javascript.ruanyifeng.com/advanced/timer.html
  function debounce(fn, delay){
    var timer = null; // 声明计时器
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }
// https://plainjs.com/javascript/ajax/send-ajax-get-and-post-requests-47/
  // TODO: 用fetch更好
  function postAjax(url, data, success) {
    var params = typeof data == 'string' ? data : Object.keys(data).map(
            function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
        ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    return xhr;
  }
  // and that's all
  // now you get a `editor` and you can do whatever you want
  editor.setSize(null, "100%") // set height
  editor.focus()

  // TODO:
  // for debugging
  window.CodeMirror = CodeMirror
  window.HyperMD = HyperMD
  window.editor = editor
  window.cm = editor

  // load_and_update_editor(demo_filename)

  document.getElementById("search").oninput = function () {
    var text = document.getElementById("search").value.toLowerCase()
    var posts = document.getElementsByClassName("post-item")
    for (var i = 0, len = posts.length; i < len; i++) {
      var str = posts[i].innerText
      posts[i].hidden = !PinyinMatch.match(str, text)
    }
  }

  // Toggle
  editor.hyper = true
  document.getElementById("toggle").onclick = function () {
    if (editor.hyper) {
      HyperMD.switchToNormal(editor)
      editor.hyper = false
    } else {
      HyperMD.switchToHyperMD(editor)
      editor.hyper = true
    }
  }

  // New File
  document.getElementById("create").onclick = function (){
    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      progressSteps: ['1', '2', '3']
    }).queue([
      {
        title: '文件名',
        text: '输入文件名'
      },
      '标题',
      {
        title: '分类',
        input: 'select',
        inputOptions: {
          '法': '法',
          '理': '理',
          '器': '器',
          '用': '用',
          '杂': '杂'
        }
      }
    ]).then((result) => {
      if (result.value) {
        var path = result.value[0]
        var title = result.value[1]
        var category = result.value[2]
        var current = localeTime()
        var filename = '/' + current.slice(0,10)+'-'+path.replace(/ /g,'-')+'.md'
        var url = document.location.href.replace(/\/(\d{4}-\d{2}-\d{2}-.*\.md)?$/, filename)
        var str = '---\nlayout: post\ntitle: '+title+'\ncategory: '+category+'\ndate: '+current+'\ncreate: '+current+'\ntags: \n  - \n---\n\n- TOC\n{:toc}'
        postAjax(url, {data: str, action: 'Save'}, (responseText) => {
          var type='success'
          if (responseText != 'Save Success!') {
            type = 'error'
          }
          Swal.fire(
            responseText,
            '',
            type
          ).then((result) => {
            window.location.href = url
          })
        })
      }
    })
  }
  // Delete File
  document.getElementById("delete").onclick = function (){
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'

    }).then((result) => {
      if (result.value) {
        postAjax(window.location.href, {action:'Delete'}, function(){
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
        });
      }
    })
  }

  // Preview Tex Math formula
  // @see demo/math-preview.js
  // init_math_preview(editor)

  // Watch editor and generate TOC
  // @see demo/toc.js
  // init_toc(editor)

  // @see demo/lab.js
  // init_lab(editor)

function clickHandler(info, cm) {
  if (info.type === "link" || info.type === "url") {
    var url = info.url
    if ((demoPageConfig.directOpen || info.ctrlKey || info.altKey) && !/^http/i.test(url) && /\.(?:md|markdown)$/.test(url.replace(/[?#].*$/, ''))) {
      // open a link whose URL is *.md with ajax_load_file
      // and supress HyperMD default behavoir
      load_and_update_editor(url) // see index2.js
      return false
    } else if (demoPageConfig.directOpen && url) {
      window.open(url)
      return false
    } else if (/^\[(?:Try out|试试看)\]$/i.test(info.text)) {
      demo_tryout(info) // see index2.js
      return false
    }
  }
  if (info.type === "hashtag") {
    var msg = "You clicked a hashtag"
    if (info.ctrlKey) msg += " (with Ctrl)"
    if (info.altKey) msg += " (with Alt)"
    console.log(msg, info.text, info.pos)
  }
}
})();
