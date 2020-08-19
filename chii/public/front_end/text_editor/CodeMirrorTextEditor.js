import*as Common from"../common/common.js";import*as Host from"../host/host.js";import*as Platform from"../platform/platform.js";import*as TextUtils from"../text_utils/text_utils.js";import*as UI from"../ui/ui.js";import{changeObjectToEditOperation,toPos,toRange}from"./CodeMirrorUtils.js";import{TextEditorAutocompleteController}from"./TextEditorAutocompleteController.js";export class CodeMirrorTextEditor extends UI.Widget.VBox{constructor(e){super(),this._options=e,this.registerRequiredCSS("cm/codemirror.css"),this.registerRequiredCSS("text_editor/cmdevtools.css");const{indentWithTabs:t,indentUnit:o}=CodeMirrorTextEditor._getIndentation(Common.Settings.Settings.instance().moduleSetting("textEditorIndent").get());this._codeMirror=new CodeMirror(this.element,{screenReaderLabel:e.devtoolsAccessibleName||ls`Code editor`,lineNumbers:e.lineNumbers,matchBrackets:!0,smartIndent:!0,styleSelectedText:!0,electricChars:!0,styleActiveLine:!0,indentUnit:o,indentWithTabs:t,lineWrapping:e.lineWrapping,lineWiseCopyCut:!1,tabIndex:0,pollInterval:Math.pow(2,31)-1,inputStyle:e.inputStyle||"devToolsAccessibleTextArea"}),this._codeMirrorElement=this.element.lastElementChild,this._codeMirror._codeMirrorTextEditor=this,Common.Settings.Settings.instance().moduleSetting("textEditorIndent").addChangeListener(this._updateIndentSize.bind(this)),CodeMirror.keyMap["devtools-common"]={Left:"goCharLeft",Right:"goCharRight",Up:"goLineUp",Down:"goLineDown",End:"goLineEnd",Home:"goLineStartSmart",PageUp:"goSmartPageUp",PageDown:"goSmartPageDown",Delete:"delCharAfter",Backspace:"delCharBefore",Tab:"UserIndent","Shift-Tab":"indentLessOrPass",Enter:"newlineAndIndent","Ctrl-Space":"autocomplete",Esc:"dismiss","Ctrl-M":"gotoMatchingBracket"},CodeMirror.keyMap["devtools-pc"]={"Ctrl-A":"selectAll","Ctrl-Z":"undoAndReveal","Shift-Ctrl-Z":"redoAndReveal","Ctrl-Y":"redo","Ctrl-Home":"goDocStart","Ctrl-Up":"goDocStart","Ctrl-End":"goDocEnd","Ctrl-Down":"goDocEnd","Ctrl-Left":"goGroupLeft","Ctrl-Right":"goGroupRight","Alt-Left":"moveCamelLeft","Alt-Right":"moveCamelRight","Shift-Alt-Left":"selectCamelLeft","Shift-Alt-Right":"selectCamelRight","Ctrl-Backspace":"delGroupBefore","Ctrl-Delete":"delGroupAfter","Ctrl-/":"toggleComment","Ctrl-D":"selectNextOccurrence","Ctrl-U":"undoLastSelection",fallthrough:"devtools-common"},CodeMirror.keyMap["devtools-mac"]={"Cmd-A":"selectAll","Cmd-Z":"undoAndReveal","Shift-Cmd-Z":"redoAndReveal","Cmd-Up":"goDocStart","Cmd-Down":"goDocEnd","Alt-Left":"goGroupLeft","Alt-Right":"goGroupRight","Ctrl-Left":"moveCamelLeft","Ctrl-Right":"moveCamelRight","Ctrl-A":"goLineLeft","Ctrl-E":"goLineRight","Ctrl-B":"goCharLeft","Ctrl-F":"goCharRight","Ctrl-Alt-B":"goGroupLeft","Ctrl-Alt-F":"goGroupRight","Ctrl-H":"delCharBefore","Ctrl-D":"delCharAfter","Ctrl-K":"killLine","Ctrl-T":"transposeChars","Ctrl-P":"goLineUp","Ctrl-N":"goLineDown","Shift-Ctrl-Left":"selectCamelLeft","Shift-Ctrl-Right":"selectCamelRight","Cmd-Left":"goLineStartSmart","Cmd-Right":"goLineEnd","Cmd-Backspace":"delLineLeft","Alt-Backspace":"delGroupBefore","Alt-Delete":"delGroupAfter","Cmd-/":"toggleComment","Cmd-D":"selectNextOccurrence","Cmd-U":"undoLastSelection",fallthrough:"devtools-common"},e.bracketMatchingSetting&&e.bracketMatchingSetting.addChangeListener(this._enableBracketMatchingIfNeeded,this),this._enableBracketMatchingIfNeeded(),this._codeMirror.setOption("keyMap",Host.Platform.isMac()?"devtools-mac":"devtools-pc"),this._codeMirror.setOption("flattenSpans",!1);let r=e.maxHighlightLength;"number"!=typeof r&&(r=CodeMirrorTextEditor.maxHighlightLength),this._codeMirror.setOption("maxHighlightLength",r),this._codeMirror.setOption("mode",null),this._codeMirror.setOption("crudeMeasuringFrom",1e3),this._shouldClearHistory=!0,this._lineSeparator="\n",CodeMirrorTextEditor._fixWordMovement(this._codeMirror),this._selectNextOccurrenceController=new SelectNextOccurrenceController(this,this._codeMirror),this._codeMirror.on("changes",this._changes.bind(this)),this._codeMirror.on("beforeSelectionChange",this._beforeSelectionChange.bind(this)),this._codeMirror.on("cursorActivity",()=>{this.dispatchEventToListeners(UI.TextEditor.Events.CursorChanged)}),this.element.style.overflow="hidden",this._codeMirrorElement.classList.add("source-code"),this._codeMirrorElement.classList.add("fill"),this._decorations=new Platform.Multimap,this.element.addEventListener("keydown",this._handleKeyDown.bind(this),!0),this.element.addEventListener("keydown",this._handlePostKeyDown.bind(this),!1),this._needsRefresh=!0,this._readOnly=!1,this._mimeType="",e.mimeType&&this.setMimeType(e.mimeType),e.autoHeight&&this._codeMirror.setSize(null,"auto"),this._placeholderElement=null,e.placeholder&&(this._placeholderElement=createElement("pre"),this._placeholderElement.classList.add("placeholder-text"),this._placeholderElement.textContent=e.placeholder,this._updatePlaceholder())}static autocompleteCommand(e){const t=e._codeMirrorTextEditor._autocompleteController;t&&t.autocomplete(!0)}static undoLastSelectionCommand(e){e._codeMirrorTextEditor._selectNextOccurrenceController.undoLastSelection()}static selectNextOccurrenceCommand(e){e._codeMirrorTextEditor._selectNextOccurrenceController.selectNextOccurrence()}static moveCamelLeftCommand(e,t){t._codeMirrorTextEditor._doCamelCaseMovement(-1,e)}static moveCamelRightCommand(e,t){t._codeMirrorTextEditor._doCamelCaseMovement(1,e)}static _getIndentation(e){const t=/\t/.test(e);return{indentWithTabs:t,indentUnit:t?4:e.length}}static _overrideModeWithPrefixedTokens(e,t){const o=e+"-old";function r(e,o,r){const i=e(o,r);return i?t+i.split(/ +/).join(" "+t):i}CodeMirror.modes[o]||(CodeMirror.defineMode(o,CodeMirror.modes[e]),CodeMirror.defineMode(e,(function(t,i){const n={};for(const e in i)n[e]=i[e];n.name=o;const s=CodeMirror.getMode(t,n);return s.name=e,s.token=r.bind(null,s.token),s})))}static _collectUninstalledModes(e){const t=loadedMimeModeExtensions,o=new Map,r=self.runtime.extensions(CodeMirrorMimeMode);for(const e of r)o.set(e.descriptor().fileName,e);const i=new Set;for(const n of r){const r=n.descriptor();if(t.has(n)||-1===r.mimeTypes.indexOf(e))continue;i.add(n);const s=r.dependencies||[];for(let e=0;e<s.length;++e){const r=o.get(s[e]);r&&!t.has(r)&&i.add(r)}}return Array.from(i)}static _installMimeTypeModes(e){const t=e.map(e=>e.instance().then(o.bind(null,e)));return Promise.all(t);function o(e,t){if(loadedMimeModeExtensions.has(e))return;t.install(e),loadedMimeModeExtensions.add(e)}}static _fixWordMovement(e){function t(e,t){t.setExtending(e);const o=t.getCursor("head");t.execCommand("goGroupLeft");const r=t.getCursor("head");if(0===r.ch&&0!==r.line)return void t.setExtending(!1);const i=t.getRange(r,o,"#");/^\s+$/.test(i)&&t.execCommand("goGroupLeft"),t.setExtending(!1)}function o(e,t){t.setExtending(e);const o=t.getCursor("head");t.execCommand("goGroupRight");const r=t.getCursor("head");if(0===r.ch&&0!==r.line)return void t.setExtending(!1);const i=t.getRange(o,r,"#");/^\s+$/.test(i)&&t.execCommand("goGroupRight"),t.setExtending(!1)}const r=Host.Platform.isMac()?"Alt":"Ctrl",i=r+"-Left",n=r+"-Right",s={};s[i]=t.bind(null,!1),s[n]=o.bind(null,!1),s["Shift-"+i]=t.bind(null,!0),s["Shift-"+n]=o.bind(null,!0),e.addKeyMap(s)}codeMirror(){return this._codeMirror}widget(){return this}setPlaceholder(e){this._placeholderElement||(this._placeholderElement=createElement("pre"),this._placeholderElement.classList.add("placeholder-text")),this._placeholderElement.textContent=e||"",this._updatePlaceholder()}_normalizePositionForOverlappingColumn(e,t,o){const r=this._codeMirror.lineCount();let i=o;return o<0&&e>0?(--e,i=this.line(e).length):o>=t&&e<r-1?(++e,i=0):i=Platform.NumberUtilities.clamp(o,0,t),{lineNumber:e,columnNumber:i}}_camelCaseMoveFromPosition(e,t,o){function r(e,t){return e>=0&&e<t}function i(e,t){const o=t,i=t+1;return r(o,e.length)&&r(i,e.length)&&TextUtils.TextUtils.Utils.isWordChar(e[o])&&TextUtils.TextUtils.Utils.isWordChar(e[i])&&TextUtils.TextUtils.Utils.isUpperCase(e[o])&&TextUtils.TextUtils.Utils.isLowerCase(e[i])}function n(e,t){const o=t,i=t-1;return r(o,e.length)&&r(i,e.length)&&TextUtils.TextUtils.Utils.isWordChar(e[o])&&TextUtils.TextUtils.Utils.isWordChar(e[i])&&TextUtils.TextUtils.Utils.isUpperCase(e[o])&&TextUtils.TextUtils.Utils.isLowerCase(e[i])}function s(e,t,o){return{lineNumber:e,columnNumber:Platform.NumberUtilities.clamp(o,0,t)}}const l=this.line(e),d=l.length;if(t===d&&1===o||0===t&&-1===o)return this._normalizePositionForOverlappingColumn(e,d,t+o);let c=1===o?t:t-1;for(;r(c,d)&&TextUtils.TextUtils.Utils.isSpaceChar(l[c]);)c+=o;if(!r(c,d))return s(e,d,c);if(TextUtils.TextUtils.Utils.isStopChar(l[c])){for(;r(c,d)&&TextUtils.TextUtils.Utils.isStopChar(l[c]);)c+=o;return r(c,d)?{lineNumber:e,columnNumber:-1===o?c+1:c}:s(e,d,c)}for(c+=o;r(c,d)&&!i(l,c)&&!n(l,c)&&TextUtils.TextUtils.Utils.isWordChar(l[c]);)c+=o;return r(c,d)?i(l,c)||n(l,c)?{lineNumber:e,columnNumber:c}:{lineNumber:e,columnNumber:-1===o?c+1:c}:s(e,d,c)}_doCamelCaseMovement(e,t){const o=this.selections();for(let r=0;r<o.length;++r){const i=o[r],n=this._camelCaseMoveFromPosition(i.endLine,i.endColumn,e);i.endLine=n.lineNumber,i.endColumn=n.columnNumber,t||(o[r]=i.collapseToEnd())}this.setSelections(o)}dispose(){this._options.bracketMatchingSetting&&this._options.bracketMatchingSetting.removeChangeListener(this._enableBracketMatchingIfNeeded,this)}_enableBracketMatchingIfNeeded(){this._codeMirror.setOption("autoCloseBrackets",!(!this._options.bracketMatchingSetting||!this._options.bracketMatchingSetting.get())&&{explode:!1})}wasShown(){this._needsRefresh&&this.refresh()}refresh(){if(this.isShowing())return this._codeMirror.refresh(),void(this._needsRefresh=!1);this._needsRefresh=!0}willHide(){delete this._editorSizeInSync}undo(){this._codeMirror.undo()}redo(){this._codeMirror.redo()}_handleKeyDown(e){"Tab"===e.key&&Common.Settings.Settings.instance().moduleSetting("textEditorTabMovesFocus").get()?e.consume(!1):this._autocompleteController&&this._autocompleteController.keyDown(e)&&e.consume(!0)}_handlePostKeyDown(e){e.defaultPrevented&&e.consume(!0)}configureAutocomplete(e){this._autocompleteController&&(this._autocompleteController.dispose(),delete this._autocompleteController),e&&(this._autocompleteController=new TextEditorAutocompleteController(this,this._codeMirror,e))}cursorPositionToCoordinates(e,t){if(e>=this._codeMirror.lineCount()||e<0||t<0||t>this._codeMirror.getLine(e).length)return null;const o=this._codeMirror.cursorCoords(new CodeMirror.Pos(e,t));return{x:o.left,y:o.top,height:o.bottom-o.top}}coordinatesToCursorPosition(e,t){const o=this.element.ownerDocument.elementFromPoint(e,t);if(!o||!o.isSelfOrDescendant(this._codeMirror.getWrapperElement()))return null;const r=this._codeMirror.getGutterElement().boxInWindow();if(e>=r.x&&e<=r.x+r.width&&t>=r.y&&t<=r.y+r.height)return null;const i=this._codeMirror.coordsChar({left:e,top:t});return toRange(i,i)}visualCoordinates(e,t){const o=this._codeMirror.cursorCoords(new CodeMirror.Pos(e,t));return{x:o.left,y:o.top}}tokenAtTextPosition(e,t){if(e<0||e>=this._codeMirror.lineCount())return null;const o=this._codeMirror.getTokenAt(new CodeMirror.Pos(e,(t||0)+1));return o?{startColumn:o.start,endColumn:o.end,type:o.type}:null}isClean(e){return this._codeMirror.isClean(e)}markClean(){return this._codeMirror.changeGeneration(!0)}_hasLongLines(){let e=!1;return this._codeMirror.eachLine((function(t){return t.text.length>CodeMirrorTextEditor.LongLineModeLineLengthThreshold&&(e=!0),e})),e}_enableLongLinesMode(){this._codeMirror.setOption("styleSelectedText",!1)}_disableLongLinesMode(){this._codeMirror.setOption("styleSelectedText",!0)}_updateIndentSize(e){const{indentWithTabs:t,indentUnit:o}=CodeMirrorTextEditor._getIndentation(e.data);this._codeMirror.setOption("indentUnit",o),this._codeMirror.setOption("indentWithTabs",t)}setMimeType(e){this._mimeType=e;const t=CodeMirrorTextEditor._collectUninstalledModes(e);function o(){const t=this.rewriteMimeType(e);this._codeMirror.options.mode!==t&&this._codeMirror.setOption("mode",t)}t.length?CodeMirrorTextEditor._installMimeTypeModes(t).then(o.bind(this)):o.call(this)}setHighlightMode(e){this._mimeType="",this._codeMirror.setOption("mode",e)}rewriteMimeType(e){return e}mimeType(){return this._mimeType}setReadOnly(e){this._readOnly!==e&&(this.clearPositionHighlight(),this._readOnly=e,this.element.classList.toggle("CodeMirror-readonly",e),this._codeMirror.setOption("readOnly",e))}readOnly(){return!!this._codeMirror.getOption("readOnly")}setLineNumberFormatter(e){this._codeMirror.setOption("lineNumberFormatter",e)}addKeyDownHandler(e){this._codeMirror.on("keydown",(t,o)=>e(o))}addBookmark(e,t,o,r,i){const n=new TextEditorBookMark(this._codeMirror.setBookmark(new CodeMirror.Pos(e,t),{widget:o,insertLeft:i}),r,this);return this._updateDecorations(e),n}bookmarks(e,t){const o=toPos(e);let r=this._codeMirror.findMarksAt(o.start);if(!e.isEmpty()){const e=this._codeMirror.findMarks(o.start,o.end),t=this._codeMirror.findMarksAt(o.end);r=r.concat(e,t)}const i=[];for(let e=0;e<r.length;e++){const o=r[e][TextEditorBookMark._symbol];!o||t&&o.type()!==t||i.push(o)}return i}focus(){this._codeMirror.focus()}hasFocus(){return this._codeMirror.hasFocus()}operation(e){this._codeMirror.operation(e)}scrollLineIntoView(e){this._innerRevealLine(e,this._codeMirror.getScrollInfo())}_innerRevealLine(e,t){const o=this._codeMirror.lineAtHeight(t.top,"local"),r=this._codeMirror.lineAtHeight(t.top+t.clientHeight,"local"),i=r-o+1;if(e<o){const t=0|Math.max(e-i/2+1,0);this._codeMirror.scrollIntoView(new CodeMirror.Pos(t,0))}else if(e>r){const t=0|Math.min(e+i/2-1,this.linesCount-1);this._codeMirror.scrollIntoView(new CodeMirror.Pos(t,0))}}addDecoration(e,t,o,r){const i=this._codeMirror.addLineWidget(t,e);let n=null;void 0!==o&&(void 0===r&&(r=1/0),n=this._updateFloatingDecoration.bind(this,e,t,o,r),n()),this._decorations.set(t,{element:e,update:n,widget:i})}_updateFloatingDecoration(e,t,o,r){const i=this._codeMirror.cursorCoords(new CodeMirror.Pos(t,0),"page"),n=this._codeMirror.cursorCoords(new CodeMirror.Pos(t,o),"page"),s=this._codeMirror.charCoords(new CodeMirror.Pos(t,r),"page");e.style.width=s.right-n.left+"px",e.style.left=n.left-i.left+"px"}_updateDecorations(e){this._decorations.get(e).forEach((function(e){e.update&&e.update()}))}removeDecoration(e,t){this._decorations.get(t).forEach(function(o){if(o.element!==e)return;this._codeMirror.removeLineWidget(o.widget),this._decorations.delete(t,o)}.bind(this))}revealPosition(e,t,o){e=Platform.NumberUtilities.clamp(e,0,this._codeMirror.lineCount()-1),"number"!=typeof t&&(t=0),t=Platform.NumberUtilities.clamp(t,0,this._codeMirror.getLine(e).length),this.clearPositionHighlight(),this._highlightedLine=this._codeMirror.getLineHandle(e),this._highlightedLine&&(this.scrollLineIntoView(e),o&&(this._codeMirror.addLineClass(this._highlightedLine,null,this._readOnly?"cm-readonly-highlight":"cm-highlight"),this._readOnly||(this._clearHighlightTimeout=setTimeout(this.clearPositionHighlight.bind(this),2e3))),this.setSelection(TextUtils.TextRange.TextRange.createFromLocation(e,t)))}clearPositionHighlight(){this._clearHighlightTimeout&&clearTimeout(this._clearHighlightTimeout),delete this._clearHighlightTimeout,this._highlightedLine&&this._codeMirror.removeLineClass(this._highlightedLine,null,this._readOnly?"cm-readonly-highlight":"cm-highlight"),delete this._highlightedLine}elementsToRestoreScrollPositionsFor(){return[]}_updatePaddingBottom(e,t){let o=0;const r=this._codeMirrorElement.getElementsByClassName("CodeMirror-lines")[0];if(this._options.padBottom){const e=this._codeMirror.getScrollInfo();this._codeMirror.lineCount()>1&&(o=Math.max(e.clientHeight-this._codeMirror.getLineHandle(this._codeMirror.lastLine()).height,0))}o+="px",r.style.paddingBottom!==o&&(r.style.paddingBottom=o,this._codeMirror.setSize(e,t))}toggleScrollPastEof(e){this._options.padBottom!==e&&(this._options.padBottom=e,this._resizeEditor())}_resizeEditor(){const e=this.element.parentElement;e&&this.isShowing()&&this._codeMirror.operation(()=>{const t=this._codeMirror.doc.scrollLeft,o=this._codeMirror.doc.scrollTop,r=e.offsetWidth,i=e.offsetHeight-this.element.offsetTop;this._options.autoHeight?this._codeMirror.setSize(r,"auto"):(this._codeMirror.setSize(r,i),this._updatePaddingBottom(r,i)),this._codeMirror.scrollTo(t,o)})}onResize(){this._autocompleteController&&this._autocompleteController.clearAutocomplete(),this._resizeEditor(),this._editorSizeInSync=!0,this._selectionSetScheduled&&(delete this._selectionSetScheduled,this.setSelection(this._lastSelection))}editRange(e,t,o){const r=toPos(e);this._codeMirror.replaceRange(t,r.start,r.end,o);const i=toRange(r.start,this._codeMirror.posFromIndex(this._codeMirror.indexFromPos(r.start)+t.length));return this.dispatchEventToListeners(UI.TextEditor.Events.TextChanged,{oldRange:e,newRange:i}),i}clearAutocomplete(){this._autocompleteController&&this._autocompleteController.clearAutocomplete()}wordRangeForCursorPosition(e,t,o){const r=this.line(e);let i=t;if(0!==t&&o(r.charAt(t-1)))for(i=t-1;i>0&&o(r.charAt(i-1));)--i;let n=t;for(;n<r.length&&o(r.charAt(n));)++n;return new TextUtils.TextRange.TextRange(e,i,e,n)}_changes(e,t){if(!t.length)return;this._updatePlaceholder();const o=1===this._codeMirror.lineCount();o!==this._hasOneLine&&this._resizeEditor(),this._hasOneLine=o,this._decorations.valuesArray().forEach(e=>this._codeMirror.removeLineWidget(e.widget)),this._decorations.clear();const r=[];let i;for(let e=0;e<t.length;++e){const o=t[e],n=changeObjectToEditOperation(o);i&&n.oldRange.equal(i.newRange)?i.newRange=n.newRange:(i=n,r.push(i))}for(let e=0;e<r.length;e++)this.dispatchEventToListeners(UI.TextEditor.Events.TextChanged,{oldRange:r[e].oldRange,newRange:r[e].newRange})}_beforeSelectionChange(e,t){this._selectNextOccurrenceController.selectionWillChange()}scrollToLine(e){const t=new CodeMirror.Pos(e,0),o=this._codeMirror.charCoords(t,"local");this._codeMirror.scrollTo(0,o.top)}firstVisibleLine(){return this._codeMirror.lineAtHeight(this._codeMirror.getScrollInfo().top,"local")}scrollTop(){return this._codeMirror.getScrollInfo().top}setScrollTop(e){this._codeMirror.scrollTo(0,e)}lastVisibleLine(){const e=this._codeMirror.getScrollInfo();return this._codeMirror.lineAtHeight(e.top+e.clientHeight,"local")}selection(){const e=this._codeMirror.getCursor("anchor"),t=this._codeMirror.getCursor("head");return toRange(e,t)}selections(){const e=this._codeMirror.listSelections(),t=[];for(let o=0;o<e.length;++o){const r=e[o];t.push(toRange(r.anchor,r.head))}return t}lastSelection(){return this._lastSelection}setSelection(e,t){if(this._lastSelection=e,!this._editorSizeInSync)return void(this._selectionSetScheduled=!0);const o=toPos(e);this._codeMirror.setSelection(o.start,o.end,{scroll:!t})}setSelections(e,t){const o=[];for(let t=0;t<e.length;++t){const r=toPos(e[t]);o.push({anchor:r.start,head:r.end})}t=t||0,this._codeMirror.setSelections(o,t,{scroll:!1})}_detectLineSeparator(e){this._lineSeparator=e.indexOf("\r\n")>=0?"\r\n":"\n"}setText(e){e.length>CodeMirrorTextEditor.MaxEditableTextSize&&(this.configureAutocomplete(null),this.setReadOnly(!0)),this._codeMirror.setValue(e),this._shouldClearHistory&&(this._codeMirror.clearHistory(),this._shouldClearHistory=!1),this._detectLineSeparator(e),this._hasLongLines()?this._enableLongLinesMode():this._disableLongLinesMode(),this.isShowing()||this.refresh()}text(e){if(!e)return this._codeMirror.getValue(this._lineSeparator);const t=toPos(e.normalize());return this._codeMirror.getRange(t.start,t.end,this._lineSeparator)}textWithCurrentSuggestion(){return this._autocompleteController?this._autocompleteController.textWithCurrentSuggestion():this.text()}fullRange(){const e=this.linesCount,t=this._codeMirror.getLine(e-1);return toRange(new CodeMirror.Pos(0,0),new CodeMirror.Pos(e-1,t.length))}currentLineNumber(){return this._codeMirror.getCursor().line}line(e){return this._codeMirror.getLine(e)}get linesCount(){return this._codeMirror.lineCount()}newlineAndIndent(){this._codeMirror.execCommand("newlineAndIndent")}textEditorPositionHandle(e,t){return new CodeMirrorPositionHandle(this._codeMirror,new CodeMirror.Pos(e,t))}_updatePlaceholder(){this._placeholderElement&&(this._placeholderElement.remove(),1!==this.linesCount||this.line(0)||this._codeMirror.display.lineSpace.insertBefore(this._placeholderElement,this._codeMirror.display.lineSpace.firstChild))}}CodeMirrorTextEditor.maxHighlightLength=1e3,CodeMirrorTextEditor.LongLineModeLineLengthThreshold=2e3,CodeMirrorTextEditor.MaxEditableTextSize=10485760,CodeMirrorTextEditor._overrideModeWithPrefixedTokens("css","css-"),CodeMirrorTextEditor._overrideModeWithPrefixedTokens("javascript","js-"),CodeMirrorTextEditor._overrideModeWithPrefixedTokens("xml","xml-"),CodeMirror.commands.autocomplete=CodeMirrorTextEditor.autocompleteCommand,CodeMirror.commands.undoLastSelection=CodeMirrorTextEditor.undoLastSelectionCommand,CodeMirror.commands.selectNextOccurrence=CodeMirrorTextEditor.selectNextOccurrenceCommand,CodeMirror.commands.moveCamelLeft=CodeMirrorTextEditor.moveCamelLeftCommand.bind(null,!1),CodeMirror.commands.selectCamelLeft=CodeMirrorTextEditor.moveCamelLeftCommand.bind(null,!0),CodeMirror.commands.moveCamelRight=CodeMirrorTextEditor.moveCamelRightCommand.bind(null,!1),CodeMirror.commands.selectCamelRight=CodeMirrorTextEditor.moveCamelRightCommand.bind(null,!0),CodeMirror.commands.UserIndent=function(e){if(0===e.listSelections().length)return;if(e.somethingSelected())return void e.indentSelection("add");const t=Common.Settings.Settings.instance().moduleSetting("textEditorIndent").get();e.replaceSelection(t)},CodeMirror.commands.indentLessOrPass=function(e){const t=e.listSelections();if(1===t.length){const o=toRange(t[0].anchor,t[0].head);if(o.isEmpty()&&!/^\s/.test(e.getLine(o.startLine)))return CodeMirror.Pass}e.execCommand("indentLess")},CodeMirror.commands.gotoMatchingBracket=function(e){const t=[],o=e.listSelections();for(let r=0;r<o.length;++r){const i=o[r].head,n=e.findMatchingBracket(i,!1,{maxScanLines:1e4});let s=i;if(n&&n.match){const e=0===CodeMirror.cmpPos(n.from,i)?1:0;s=new CodeMirror.Pos(n.to.line,n.to.ch+e)}t.push({anchor:s,head:s})}e.setSelections(t)},CodeMirror.commands.undoAndReveal=function(e){const t=e.getScrollInfo();e.execCommand("undo");const o=e.getCursor("start");e._codeMirrorTextEditor._innerRevealLine(o.line,t);const r=e._codeMirrorTextEditor._autocompleteController;r&&r.clearAutocomplete()},CodeMirror.commands.redoAndReveal=function(e){const t=e.getScrollInfo();e.execCommand("redo");const o=e.getCursor("start");e._codeMirrorTextEditor._innerRevealLine(o.line,t);const r=e._codeMirrorTextEditor._autocompleteController;r&&r.clearAutocomplete()},CodeMirror.commands.dismiss=function(e){const t=e.listSelections(),o=t[0];if(1===t.length)return toRange(o.anchor,o.head).isEmpty()?CodeMirror.Pass:(e.setSelection(o.anchor,o.anchor,{scroll:!1}),void e._codeMirrorTextEditor.scrollLineIntoView(o.anchor.line));e.setSelection(o.anchor,o.head,{scroll:!1}),e._codeMirrorTextEditor.scrollLineIntoView(o.anchor.line)},CodeMirror.commands.goSmartPageUp=function(e){if(e._codeMirrorTextEditor.selection().equal(TextUtils.TextRange.TextRange.createFromLocation(0,0)))return CodeMirror.Pass;e.execCommand("goPageUp")},CodeMirror.commands.goSmartPageDown=function(e){if(e._codeMirrorTextEditor.selection().equal(e._codeMirrorTextEditor.fullRange().collapseToEnd()))return CodeMirror.Pass;e.execCommand("goPageDown")};export class CodeMirrorPositionHandle{constructor(e,t){this._codeMirror=e,this._lineHandle=e.getLineHandle(t.line),this._columnNumber=t.ch}resolve(){const e=this._lineHandle?this._codeMirror.getLineNumber(this._lineHandle):null;return"number"!=typeof e?null:{lineNumber:e,columnNumber:this._columnNumber}}equal(e){const t=e;return t._lineHandle===this._lineHandle&&t._columnNumber===this._columnNumber&&t._codeMirror===this._codeMirror}}export class SelectNextOccurrenceController{constructor(e,t){this._textEditor=e,this._codeMirror=t}selectionWillChange(){this._muteSelectionListener||delete this._fullWordSelection}_findRange(e,t){for(let o=0;o<e.length;++o)if(t.equal(e[o]))return!0;return!1}undoLastSelection(){this._muteSelectionListener=!0,this._codeMirror.execCommand("undoSelection"),this._muteSelectionListener=!1}selectNextOccurrence(){const e=this._textEditor.selections();let t=!1;for(let o=0;o<e.length;++o){const r=e[o];if(t=t||r.isEmpty(),r.startLine!==r.endLine)return}if(t)return void this._expandSelectionsToWords(e);const o=e[e.length-1];let r=o;do{r=this._findNextOccurrence(r,!!this._fullWordSelection)}while(r&&this._findRange(e,r)&&!r.equal(o));r&&(e.push(r),this._muteSelectionListener=!0,this._textEditor.setSelections(e,e.length-1),delete this._muteSelectionListener,this._textEditor.scrollLineIntoView(r.startLine))}_expandSelectionsToWords(e){const t=[];for(let o=0;o<e.length;++o){const r=e[o],i=this._textEditor.wordRangeForCursorPosition(r.startLine,r.startColumn,TextUtils.TextUtils.Utils.isWordChar)||TextUtils.TextRange.TextRange.createFromLocation(r.startLine,r.startColumn),n=this._textEditor.wordRangeForCursorPosition(r.endLine,r.endColumn,TextUtils.TextUtils.Utils.isWordChar)||TextUtils.TextRange.TextRange.createFromLocation(r.endLine,r.endColumn),s=new TextUtils.TextRange.TextRange(i.startLine,i.startColumn,n.endLine,n.endColumn);t.push(s)}this._textEditor.setSelections(t,t.length-1),this._fullWordSelection=!0}_findNextOccurrence(e,t){let o,r;e=e.normalize();const i=this._textEditor.text(e);function n(e,t,n,s,l){if("number"==typeof o)return!0;e.lastIndex=s;const d=e.exec(n);return!(!d||d.index+i.length>l)&&(o=t,r=d.index,!0)}let s;function l(e,t){if(n(e,s++,t.text,0,t.text.length))return!0}let d=i.escapeForRegExp();t&&(d="\\b"+d+"\\b");const c=new RegExp(d,"g"),a=this._codeMirror.getLine(e.startLine);return n(c,e.startLine,a,e.endColumn,a.length),s=e.startLine+1,this._codeMirror.eachLine(e.startLine+1,this._codeMirror.lineCount(),l.bind(null,c)),s=0,this._codeMirror.eachLine(0,e.startLine,l.bind(null,c)),n(c,e.startLine,a,0,e.startColumn),"number"!=typeof o?null:new TextUtils.TextRange.TextRange(o,r,o,r+i.length)}}export class TextEditorPositionHandle{resolve(){}equal(e){}}export const loadedMimeModeExtensions=new Set;export class CodeMirrorMimeMode{async install(e){}}export class TextEditorBookMark{constructor(e,t,o){e[TextEditorBookMark._symbol]=this,this._marker=e,this._type=t,this._editor=o}clear(){const e=this._marker.find();this._marker.clear(),e&&this._editor._updateDecorations(e.line)}refresh(){this._marker.changed();const e=this._marker.find();e&&this._editor._updateDecorations(e.line)}type(){return this._type}position(){const e=this._marker.find();return e?TextUtils.TextRange.TextRange.createFromLocation(e.line,e.ch):null}}TextEditorBookMark._symbol=Symbol("TextEditorBookMark");export class CodeMirrorTextEditorFactory{createEditor(e){return new CodeMirrorTextEditor(e)}}CodeMirror.inputStyles.devToolsAccessibleTextArea=class extends CodeMirror.inputStyles.textarea{init(e){super.init(e),this.textarea.addEventListener("compositionstart",this._onCompositionStart.bind(this))}_onCompositionStart(){this.textarea.selectionEnd!==this.textarea.value.length&&(this.textarea.value=this.textarea.value.substring(0,this.textarea.selectionEnd),this.textarea.setSelectionRange(this.textarea.value.length,this.textarea.value.length),this.prevInput=this.textarea.value)}reset(e){if(this.textAreaBusy(!!e))return void super.reset(e);const t=this.cm.getCursor();let o,r;if(this.cm.options.lineWrapping){const e=this.cm.charCoords(t,"page").top;o=this.cm.coordsChar({left:-1/0,top:e}),r=this.cm.coordsChar({left:1/0,top:e})}else{const e=1e3*Math.floor(t.ch/1e3);o={ch:e,line:t.line},r={ch:e+1e3,line:t.line}}this.textarea.value=this.cm.getRange(o,r);const i=t.ch-o.ch;this.textarea.setSelectionRange(i,i),this.prevInput=this.textarea.value}textAreaBusy(e){return e||this.contextMenuPending||this.composing||this.cm.somethingSelected()}poll(){if(this.contextMenuPending||this.composing)return super.poll();const e=this.textarea.value;let t=0;const o=Math.min(this.prevInput.length,e.length);for(;t<o&&this.prevInput[t]===e[t];)++t;let r=0;for(;r<o-t&&this.prevInput[this.prevInput.length-r-1]===e[e.length-r-1];)++r;const i=this.textarea;this.textarea=createElement("textarea"),this.textarea.value=e.substring(t,e.length-r),this.textarea.setSelectionRange(i.selectionStart-t,i.selectionEnd-t),this.prevInput="";const n=super.poll();return this.prevInput=e,this.textarea=i,n}};export let Decoration;