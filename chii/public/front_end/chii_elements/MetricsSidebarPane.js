import*as Common from"../common/common.js";import*as HostModule from"../host/host.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";import{ElementsSidebarPane}from"./ElementsSidebarPane.js";export class MetricsSidebarPane extends ElementsSidebarPane{constructor(){super(),this.registerRequiredCSS("chii_elements/metricsSidebarPane.css"),this._inlineStyle=null}doUpdate(){if(this._isEditingMetrics)return Promise.resolve();const t=this.node(),e=this.cssModel();if(!t||t.nodeType()!==Node.ELEMENT_NODE||!e)return this.contentElement.removeChildren(),Promise.resolve();const i=[e.computedStylePromise(t.id).then(function(e){e&&this.node()===t&&this._updateMetrics(e)}.bind(this)),e.inlineStylesPromise(t.id).then(function(e){e&&this.node()===t&&(this._inlineStyle=e.inlineStyle)}.bind(this))];return Promise.all(i)}onCSSModelChanged(){this.update()}_getPropertyValueAsPx(t,e){return Number(t.get(e).replace(/px$/,"")||0)}_getBox(t,e){const i="border"===e?"-width":"";return{left:this._getPropertyValueAsPx(t,e+"-left"+i),top:this._getPropertyValueAsPx(t,e+"-top"+i),right:this._getPropertyValueAsPx(t,e+"-right"+i),bottom:this._getPropertyValueAsPx(t,e+"-bottom"+i)}}_highlightDOMNode(t,e,i){if(i.consume(),t&&this.node()){if(this._highlightMode===e)return;this._highlightMode=e,this.node().highlight(e)}else delete this._highlightMode,SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();for(let t=0;this._boxElements&&t<this._boxElements.length;++t){const i=this._boxElements[t];this.node()&&"all"!==e&&i._name!==e?i.style.backgroundColor="":i.style.backgroundColor=i._backgroundColor}}_updateMetrics(t){const e=createElement("div");e.className="metrics";const i=this;function o(t,e,i,o){const n=("position"!==e?e+"-":"")+i+o;let r=t.get(n);(""===r||"position"!==e&&"0px"===r||"position"===e&&"auto"===r)&&(r="‒"),r=r.replace(/px$/,""),r=Number.toFixedIfFloating(r);const s=createElement("div");return s.className=i,s.textContent=r,s.addEventListener("dblclick",this.startEditing.bind(this,s,e,n,t),!1),s}function n(t){let e=t.get("width").replace(/px$/,"");if(!isNaN(e)&&"border-box"===t.get("box-sizing")){const o=i._getBox(t,"border"),n=i._getBox(t,"padding");e=e-o.left-o.right-n.left-n.right}return Number.toFixedIfFloating(e.toString())}function r(t){let e=t.get("height").replace(/px$/,"");if(!isNaN(e)&&"border-box"===t.get("box-sizing")){const o=i._getBox(t,"border"),n=i._getBox(t,"padding");e=e-o.top-o.bottom-n.top-n.bottom}return Number.toFixedIfFloating(e.toString())}const s={"table-cell":!0,"table-column":!0,"table-column-group":!0,"table-footer-group":!0,"table-header-group":!0,"table-row":!0,"table-row-group":!0},l={"table-column":!0,"table-column-group":!0,"table-footer-group":!0,"table-header-group":!0,"table-row":!0,"table-row-group":!0},d={static:!0},a=["content","padding","border","margin","position"],h=[Common.Color.PageHighlight.Content,Common.Color.PageHighlight.Padding,Common.Color.PageHighlight.Border,Common.Color.PageHighlight.Margin,Common.Color.Color.fromRGBA([0,0,0,0])],g=[Common.UIString.UIString("content"),Common.UIString.UIString("padding"),Common.UIString.UIString("border"),Common.UIString.UIString("margin"),Common.UIString.UIString("position")];let p=null;this._boxElements=[];for(let e=0;e<a.length;++e){const i=a[e];if("margin"===i&&s[t.get("display")])continue;if("padding"===i&&l[t.get("display")])continue;if("position"===i&&d[t.get("position")])continue;const c=createElement("div");if(c.className=i,c._backgroundColor=h[e].asString(Common.Color.Format.RGBA),c._name=i,c.style.backgroundColor=c._backgroundColor,c.addEventListener("mouseover",this._highlightDOMNode.bind(this,!0,"position"===i?"all":i),!1),this._boxElements.push(c),"content"===i){const e=createElement("span");e.textContent=n(t),e.addEventListener("dblclick",this.startEditing.bind(this,e,"width","width",t),!1);const i=createElement("span");i.textContent=r(t),i.addEventListener("dblclick",this.startEditing.bind(this,i,"height","height",t),!1),c.appendChild(e),c.createTextChild(" × "),c.appendChild(i)}else{const n="border"===i?"-width":"",r=createElement("div");r.className="label",r.textContent=g[e],c.appendChild(r),c.appendChild(o.call(this,t,i,"top",n)),c.appendChild(createElement("br")),c.appendChild(o.call(this,t,i,"left",n)),p&&c.appendChild(p),c.appendChild(o.call(this,t,i,"right",n)),c.appendChild(createElement("br")),c.appendChild(o.call(this,t,i,"bottom",n))}p=c}e.appendChild(p),e.addEventListener("mouseover",this._highlightDOMNode.bind(this,!1,"all"),!1),this.contentElement.removeChildren(),this.contentElement.appendChild(e),HostModule.userMetrics.panelLoaded("elements","DevTools.Launch.Elements")}startEditing(t,e,i,o){if(UI.UIUtils.isBeingEdited(t))return;const n={box:e,styleProperty:i,computedStyle:o},r=this._handleKeyDown.bind(this,n,i);n.keyDownHandler=r,t.addEventListener("keydown",r,!1),this._isEditingMetrics=!0;const s=new UI.InplaceEditor.Config(this._editingCommitted.bind(this),this.editingCancelled.bind(this),n);UI.InplaceEditor.InplaceEditor.startEditing(t,s),t.getComponentSelection().selectAllChildren(t)}_handleKeyDown(t,e,i){const o=i.currentTarget;UI.UIUtils.handleElementValueModifications(i,o,function(e,i){this._applyUserInput(o,i,e,t,!1)}.bind(this),void 0,(function(t,i,o){return"margin"!==e&&i<0&&(i=0),t+i+o}))}editingEnded(t,e){delete this.originalPropertyData,delete this.previousPropertyDataCandidate,t.removeEventListener("keydown",e.keyDownHandler,!1),delete this._isEditingMetrics}editingCancelled(t,e){if("originalPropertyData"in this&&this._inlineStyle)if(this.originalPropertyData)this._inlineStyle.allProperties()[this.originalPropertyData.index].setText(this.originalPropertyData.propertyText,!1);else{const t=this._inlineStyle.pastLastSourcePropertyIndex();t&&this._inlineStyle.allProperties()[t-1].setText("",!1)}this.editingEnded(t,e),this.update()}_applyUserInput(t,e,i,o,n){if(!this._inlineStyle)return this.editingCancelled(t,o);if(n&&e===i)return this.editingCancelled(t,o);"position"===o.box||e&&"‒"!==e?"position"!==o.box||e&&"‒"!==e||(e="auto"):e="0px",e=e.toLowerCase(),/^\d+$/.test(e)&&(e+="px");const r=o.styleProperty,s=o.computedStyle;if("border-box"===s.get("box-sizing")&&("width"===r||"height"===r)){if(!e.match(/px$/))return void Common.Console.Console.instance().error("For elements with box-sizing: border-box, only absolute content area dimensions can be applied");const t=this._getBox(s,"border"),i=this._getBox(s,"padding");let o=Number(e.replace(/px$/,""));if(isNaN(o))return;o+="width"===r?t.left+t.right+i.left+i.right:t.top+t.bottom+i.top+i.bottom,e=o+"px"}this.previousPropertyDataCandidate=null;const l=this._inlineStyle.allProperties();for(let t=0;t<l.length;++t){const i=l[t];if(i.name===o.styleProperty&&i.activeInStyle())return this.previousPropertyDataCandidate=i,void i.setValue(e,n,!0,d.bind(this))}function d(t){t&&("originalPropertyData"in this||(this.originalPropertyData=this.previousPropertyDataCandidate),void 0!==this._highlightMode&&this.node().highlight(this._highlightMode),n&&this.update())}this._inlineStyle.appendProperty(o.styleProperty,e,d.bind(this))}_editingCommitted(t,e,i,o){this.editingEnded(t,o),this._applyUserInput(t,e,i,o,!0)}}