/*!
 * ---
 * jquery.esarea
 * http://github.com/nakajmg/jquery.esarea/
 *
 * Under The MIT License
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * ---
 *
 * Dependencies:
 *   - jQuery: https://github.com/jquery/jquery
 *   - jQuery.selection: https://github.com/madapaja/jquery.selection
 *
 * Includes esarea
 * https://github.com/fukayatsu/esarea/
 * Copyright (c) 2015 fukayatsu
 * Released Under the MIT License (MIT)
 * https://github.com/fukayatsu/esarea/blob/master/LICENSE
 */

(function($) {
  $.fn.esarea = function(options) {
    var defaults = {};
    options = $.extend(defaults, options);

    return this.each(function() {
      return esarea(this);
    });

    function esarea (target, options) {
      $(target).on('keydown', function(e) {
        switch (e.which || e.keyCode) {
          case 9:
            handleTabKey(e);
            break;
          case 13:
            handleEnterKey(e);
            break;
          case 32:
            handleSpaceKey(e);
        }
      });
    }

    function handleTabKey(e) {
      var currentLine, newPos, pos, reindentedCount, reindentedText, text;
      e.preventDefault();
      currentLine = getCurrentLine(e);
      text = $(e.target).val();
      pos = $(e.target).selection('getPos');
      if (currentLine) {
        $(e.target).selection('setPos', {
          start: currentLine.start,
          end: currentLine.end - 1
        });
      }
      if (e.shiftKey) {
        if (currentLine && currentLine.text.charAt(0) === '|') {
          newPos = text.lastIndexOf('|', pos.start - 1);
          if (newPos > 0) {
            $(e.target).selection('setPos', {
              start: newPos - 1,
              end: newPos - 1
            });
          }
        } else {
          reindentedText = $(e.target).selection().replace(/^ {1,4}/gm, '');
          reindentedCount = $(e.target).selection().length - reindentedText.length;
          $(e.target).selection('replace', {
            text: reindentedText,
            mode: 'before'
          });
          if (currentLine) {
            $(e.target).selection('setPos', {
              start: pos.start - reindentedCount,
              end: pos.start - reindentedCount
            });
          }
        }
      } else {
        if (currentLine && currentLine.text.charAt(0) === '|') {
          newPos = text.indexOf('|', pos.start + 1);
          if ((newPos < 0) || (newPos === text.lastIndexOf('|', currentLine.end - 1))) {
            $(e.target).selection('setPos', {
              start: currentLine.end,
              end: currentLine.end
            });
          } else {
            $(e.target).selection('setPos', {
              start: newPos + 2,
              end: newPos + 2
            });
          }
        } else {
          $(e.target).selection('replace', {
            text: '    ' + $(e.target).selection().split("\n").join("\n    "),
            mode: 'before'
          });
          if (currentLine) {
            $(e.target).selection('setPos', {
              start: pos.start + 4,
              end: pos.start + 4
            });
          }
        }
      }
      return $(e.target).trigger('input');
    }

    function handleEnterKey(e) {
      var currentLine, i, indent, len, listMark, listMarkMatch, match, num, prevLine, ref, row;
      if (e.metaKey || e.ctrlKey || e.shiftKey) {
        return;
      }
      if (!(currentLine = getCurrentLine(e))) {
        return;
      }
      if (currentLine.start === currentLine.caret) {
        return;
      }
      if (match = currentLine.text.match(/^(\s*(?:-|\+|\*|\d+\.) (?:\[(?:x| )\] )?)\s*\S/)) {
        if (currentLine.text.match(/^(\s*(?:-|\+|\*|\d+\.) (?:\[(?:x| )\] ))\s*$/)) {
          $(e.target).selection('setPos', {
            start: currentLine.start,
            end: currentLine.end - 1
          });
          return;
        }
        e.preventDefault();
        listMark = match[1];
        if (listMarkMatch = listMark.match(/^(\s*)(\d+)\./)) {
          indent = listMarkMatch[1];
          num = parseInt(listMarkMatch[2]);
          if (num !== 1) {
            listMark = listMark.replace(/\s*\d+/, "" + indent + (num + 1));
          }
        }
        $(e.target).selection('insert', {
          text: "\n" + listMark,
          mode: 'before'
        });
      } else if (currentLine.text.match(/^(\s*(?:-|\+|\*|\d+\.) )/)) {
        $(e.target).selection('setPos', {
          start: currentLine.start,
          end: currentLine.end
        });
      } else if (currentLine.text.match(/^.*\|\s*$/)) {
        if (currentLine.text.match(/^[\|\s]+$/)) {
          $(e.target).selection('setPos', {
            start: currentLine.start,
            end: currentLine.end
          });
          return;
        }
        if (!currentLine.endOfLine) {
          return;
        }
        e.preventDefault();
        row = [];
        ref = currentLine.text.match(/\|/g);
        for (i = 0, len = ref.length; i < len; i++) {
          match = ref[i];
          row.push("|");
        }
        prevLine = getPrevLine(e);
        if (!prevLine || (!currentLine.text.match(/---/) && !prevLine.text.match(/\|/g))) {
          $(e.target).selection('insert', {
            text: "\n" + row.join(' --- ') + "\n" + row.join('  '),
            mode: 'before'
          });
          $(e.target).selection('setPos', {
            start: currentLine.caret + 6 * row.length - 1,
            end: currentLine.caret + 6 * row.length - 1
          });
        } else {
          $(e.target).selection('insert', {
            text: "\n" + row.join('  '),
            mode: 'before'
          });
          $(e.target).selection('setPos', {
            start: currentLine.caret + 3,
            end: currentLine.caret + 3
          });
        }
      }
      return $(e.target).trigger('input');
    }

    function handleSpaceKey(e) {
      var checkMark, currentLine, match, replaceTo;
      if (!(e.shiftKey && e.altKey)) {
        return;
      }
      if (!(currentLine = getCurrentLine(e))) {
        return;
      }
      if (match = currentLine.text.match(/^(\s*)(-|\+|\*|\d+\.) (?:\[(x| )\] )(.*)/)) {
        e.preventDefault();
        checkMark = match[3] === ' ' ? 'x' : ' ';
        replaceTo = "" + match[1] + match[2] + " [" + checkMark + "] " + match[4];
        $(e.target).selection('setPos', {
          start: currentLine.start,
          end: currentLine.end
        });
        $(e.target).selection('replace', {
          text: replaceTo,
          mode: 'keep'
        });
        $(e.target).selection('setPos', {
          start: currentLine.caret,
          end: currentLine.caret
        });
        return $(e.target).trigger('input');
      }
    }

    function getCurrentLine(e) {
      var endPos, pos, startPos, text;
      text = $(e.target).val();
      pos = $(e.target).selection('getPos');
      if (!text) {
        return null;
      }
      if (pos.start !== pos.end) {
        return null;
      }
      startPos = text.lastIndexOf("\n", pos.start - 1) + 1;
      endPos = text.indexOf("\n", pos.start);
      if (endPos === -1) {
        endPos = text.length;
      }
      return {
        text: text.slice(startPos, endPos),
        start: startPos,
        end: endPos,
        caret: pos.start,
        endOfLine: !$.trim(text.slice(pos.start, endPos))
      };
    }

    function getPrevLine(e) {
      var currentLine, endPos, startPos, text;
      currentLine = getCurrentLine(e);
      text = $(e.target).val().slice(0, currentLine.start);
      startPos = text.lastIndexOf("\n", currentLine.start - 2) + 1;
      endPos = currentLine.start;
      return {
        text: text.slice(startPos, endPos),
        start: startPos,
        end: endPos
      };
    }
  };
})(jQuery);
