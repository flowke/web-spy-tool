import*as Bindings from"../bindings/bindings.js";import*as Common from"../common/common.js";import*as SDK from"../sdk/sdk.js";import*as TextUtils from"../text_utils/text_utils.js";import*as UI from"../ui/ui.js";import*as Workspace from"../workspace/workspace.js";export class JavaScriptBreakpointsSidebarPane extends UI.ThrottledWidget.ThrottledWidget{constructor(){super(!0),this.registerRequiredCSS("chii_sources/javaScriptBreakpointsSidebarPane.css"),this._breakpointManager=Bindings.BreakpointManager.BreakpointManager.instance(),this._breakpointManager.addEventListener(Bindings.BreakpointManager.Events.BreakpointAdded,this.update,this),this._breakpointManager.addEventListener(Bindings.BreakpointManager.Events.BreakpointRemoved,this.update,this),Common.Settings.Settings.instance().moduleSetting("breakpointsActive").addChangeListener(this.update,this),this._breakpoints=new UI.ListModel.ListModel,this._list=new UI.ListControl.ListControl(this._breakpoints,this,UI.ListControl.ListMode.NonViewport),UI.ARIAUtils.markAsList(this._list.element),this.contentElement.appendChild(this._list.element),this._emptyElement=this.contentElement.createChild("div","gray-info-message"),this._emptyElement.textContent=ls`No breakpoints`,this._emptyElement.tabIndex=-1,this.update()}_getBreakpointLocations(){const t=this._breakpointManager.allBreakpointLocations().filter(t=>t.uiLocation.uiSourceCode.project().type()!==Workspace.Workspace.projectTypes.Debugger);return t.sort((t,e)=>t.uiLocation.compareTo(e.uiLocation)),t}_hideList(){this._list.element.classList.add("hidden"),this._emptyElement.classList.remove("hidden")}_ensureListShown(){this._list.element.classList.remove("hidden"),this._emptyElement.classList.add("hidden")}_groupBreakpointLocationsById(t){const e=new Platform.Multimap;for(const n of t){const t=n.uiLocation;e.set(t.id(),n)}const n=[];for(const t of e.keysArray()){const o=Array.from(e.get(t));o.length&&n.push(o)}return n}_getLocationIdsByLineId(t){const e=new Platform.Multimap;for(const n of t){const t=n.uiLocation;e.set(t.lineId(),t.id())}return e}async _getSelectedUILocation(){const t=self.UI.context.flavor(SDK.DebuggerModel.DebuggerPausedDetails);return t&&t.callFrames.length?await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(t.callFrames[0].location()):null}async _getContent(t){const e=new Map;return Promise.all(t.map(async([t])=>{const n=await t.uiLocation.uiSourceCode.requestContent();if(e.has(n.content))return e.get(n.content);const o=new TextUtils.Text.Text(n.content||"");return e.set(n.content,o),o}))}async doUpdate(){const t=this.hasFocus(),e=this._getBreakpointLocations();if(!e.length)return this._hideList(),this._setBreakpointItems([]),this._didUpdateForTest();this._ensureListShown();const n=this._groupBreakpointLocationsById(e),o=this._getLocationIdsByLineId(e),i=await this._getContent(n),s=await this._getSelectedUILocation(),a=[];for(let t=0;t<n.length;t++){const e=n[t],r=e[0].uiLocation,l=!!s&&e.some(t=>t.uiLocation.id()===s.id()),c=o.get(r.lineId()).size>1,m=i[t];a.push(new BreakpointItem(e,m,l,c))}return a.some(t=>t.isSelected)&&UI.ViewManager.ViewManager.instance().showView("sources.jsBreakpoints"),this._list.element.classList.toggle("breakpoints-list-deactivated",!Common.Settings.Settings.instance().moduleSetting("breakpointsActive").get()),this._setBreakpointItems(a),t&&this.focus(),this._didUpdateForTest()}_setBreakpointItems(t){if(this._breakpoints.length===t.length)for(let e=0;e<this._breakpoints.length;e++)this._breakpoints.at(e).isSimilar(t[e])||this._breakpoints.replace(e,t[e]);else this._breakpoints.replaceAll(t)}createElementForItem(t){const e=createElementWithClass("div","breakpoint-entry");UI.ARIAUtils.markAsListitem(e),e.tabIndex=this._list.selectedItem()===t?0:-1,e.addEventListener("contextmenu",this._breakpointContextMenu.bind(this),!0),e.addEventListener("click",this._revealLocation.bind(this,e),!1);const n=UI.UIUtils.CheckboxLabel.create(""),o=t.locations[0].uiLocation,i=t.locations.some(t=>t.breakpoint.enabled()),s=t.locations.some(t=>!t.breakpoint.enabled());n.textElement.textContent=o.linkText()+(t.showColumn?":"+(o.columnNumber+1):""),n.checkboxElement.checked=i,n.checkboxElement.indeterminate=i&&s,n.checkboxElement.tabIndex=-1,n.addEventListener("click",this._breakpointCheckboxClicked.bind(this),!1),e.appendChild(n);let a=i?ls`checked`:ls`unchecked`;i&&s&&(a=ls`mixed`),t.isSelected?(UI.ARIAUtils.setDescription(e,ls`${a} breakpoint hit`),e.classList.add("breakpoint-hit"),this.setDefaultFocusedElement(e)):UI.ARIAUtils.setDescription(e,a),e.addEventListener("keydown",t=>{" "===t.key&&(n.checkboxElement.click(),t.consume(!0))});const r=e.createChild("div","source-text monospace"),l=o.lineNumber;if(t.text&&l<t.text.lineCount()){const e=t.text.lineAt(l),n=200;r.textContent=e.substring(t.showColumn?o.columnNumber:0).trimEndWithMaxLength(n)}return e[breakpointLocationsSymbol]=t.locations,e[locationSymbol]=o,e}heightForItem(t){return 0}isItemSelectable(t){return!0}selectedItemChanged(t,e,n,o){n&&(n.tabIndex=-1),o&&(o.tabIndex=0,this.setDefaultFocusedElement(o),this.hasFocus()&&o.focus())}updateSelectedItemARIA(t,e){return!0}_breakpointLocations(t){return t.target instanceof Element?this._breakpointLocationsForElement(t.target):[]}_breakpointLocationsForElement(t){const e=t.enclosingNodeOrSelfWithClass("breakpoint-entry");return e&&e[breakpointLocationsSymbol]||[]}_breakpointCheckboxClicked(t){const e=this.hasFocus(),n=this._breakpointLocations(t).map(t=>t.breakpoint),o=t.target.checkboxElement.checked;for(const t of n){t.setEnabled(o);const e=this._breakpoints.find(e=>e.locations.some(e=>e.breakpoint===t));e&&this._list.refreshItem(e)}e&&this.focus(),t.consume()}_revealLocation(t){const e=this._breakpointLocationsForElement(t).map(t=>t.uiLocation);let n=null;for(const t of e)(!n||t.columnNumber<n.columnNumber)&&(n=t);n&&Common.Revealer.reveal(n)}_breakpointContextMenu(t){const e=this._breakpointLocations(t).map(t=>t.breakpoint),n=new UI.ContextMenu.ContextMenu(t),o=e.length>1?Common.UIString.UIString("Remove all breakpoints in line"):Common.UIString.UIString("Remove breakpoint");n.defaultSection().appendItem(o,()=>e.map(t=>t.remove(!1))),t.target instanceof Element&&n.defaultSection().appendItem(ls`Reveal location`,this._revealLocation.bind(this,t.target));const i=Common.Settings.Settings.instance().moduleSetting("breakpointsActive").get(),s=i?Common.UIString.UIString("Deactivate breakpoints"):Common.UIString.UIString("Activate breakpoints");if(n.defaultSection().appendItem(s,()=>Common.Settings.Settings.instance().moduleSetting("breakpointsActive").set(!i)),e.some(t=>!t.enabled())){const t=Common.UIString.UIString("Enable all breakpoints");n.defaultSection().appendItem(t,this._toggleAllBreakpoints.bind(this,!0))}if(e.some(t=>t.enabled())){const t=Common.UIString.UIString("Disable all breakpoints");n.defaultSection().appendItem(t,this._toggleAllBreakpoints.bind(this,!1))}const a=Common.UIString.UIString("Remove all breakpoints");n.defaultSection().appendItem(a,this._removeAllBreakpoints.bind(this));const r=Common.UIString.UIString("Remove other breakpoints");n.defaultSection().appendItem(r,this._removeOtherBreakpoints.bind(this,new Set(e))),n.show()}_toggleAllBreakpoints(t){for(const e of this._breakpointManager.allBreakpointLocations())e.breakpoint.setEnabled(t)}_removeAllBreakpoints(){for(const t of this._breakpointManager.allBreakpointLocations())t.breakpoint.remove(!1)}_removeOtherBreakpoints(t){for(const e of this._breakpointManager.allBreakpointLocations())t.has(e.breakpoint)||e.breakpoint.remove(!1)}flavorChanged(t){this.update()}_didUpdateForTest(){}}class BreakpointItem{constructor(t,e,n,o){this.locations=t,this.text=e,this.isSelected=n,this.showColumn=o}isSimilar(t){return this.locations.length===t.locations.length&&this.locations.every((e,n)=>e.uiLocation===t.locations[n].uiLocation)&&this.locations.every((e,n)=>e.breakpoint===t.locations[n].breakpoint)&&(this.text===t.text||this.text&&t.text&&this.text.value()===t.text.value())&&this.isSelected===t.isSelected&&this.showColumn===t.showColumn}}export const locationSymbol=Symbol("location");export const checkboxLabelSymbol=Symbol("checkbox-label");export const snippetElementSymbol=Symbol("snippet-element");export const breakpointLocationsSymbol=Symbol("locations");export let BreakpointLocation;