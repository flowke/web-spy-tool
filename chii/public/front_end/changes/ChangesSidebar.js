import*as Common from"../common/common.js";import*as Snippets from"../snippets/snippets.js";import*as UI from"../ui/ui.js";import*as Workspace from"../workspace/workspace.js";import*as WorkspaceDiff from"../workspace_diff/workspace_diff.js";export class ChangesSidebar extends UI.Widget.Widget{constructor(e){super(),this._treeoutline=new UI.TreeOutline.TreeOutlineInShadow,this._treeoutline.setFocusable(!1),this._treeoutline.registerRequiredCSS("changes/changesSidebar.css"),this._treeoutline.setComparator((e,t)=>e.titleAsText().compareTo(t.titleAsText())),this._treeoutline.addEventListener(UI.TreeOutline.Events.ElementSelected,this._selectionChanged,this),UI.ARIAUtils.markAsTablist(this._treeoutline.contentElement),this.element.appendChild(this._treeoutline.element),this._treeElements=new Map,this._workspaceDiff=e,this._workspaceDiff.modifiedUISourceCodes().forEach(this._addUISourceCode.bind(this)),this._workspaceDiff.addEventListener(WorkspaceDiff.WorkspaceDiff.Events.ModifiedStatusChanged,this._uiSourceCodeMofiedStatusChanged,this)}selectUISourceCode(e,t){const i=this._treeElements.get(e);i&&i.select(t)}selectedUISourceCode(){return this._treeoutline.selectedTreeElement?this._treeoutline.selectedTreeElement.uiSourceCode:null}_selectionChanged(){this.dispatchEventToListeners(Events.SelectedUISourceCodeChanged)}_uiSourceCodeMofiedStatusChanged(e){e.data.isModified?this._addUISourceCode(e.data.uiSourceCode):this._removeUISourceCode(e.data.uiSourceCode)}_removeUISourceCode(e){const t=this._treeElements.get(e);if(this._treeElements.delete(e),this._treeoutline.selectedTreeElement===t){const e=t.previousSibling||t.nextSibling;e?e.select(!0):(t.deselect(),this._selectionChanged())}this._treeoutline.removeChild(t),t.dispose(),0===this._treeoutline.rootElement().childCount()&&this._treeoutline.setFocusable(!1)}_addUISourceCode(e){const t=new UISourceCodeTreeElement(e);this._treeElements.set(e,t),this._treeoutline.setFocusable(!0),this._treeoutline.appendChild(t),this._treeoutline.selectedTreeElement||t.select(!0)}}export const Events={SelectedUISourceCodeChanged:Symbol("SelectedUISourceCodeChanged")};export class UISourceCodeTreeElement extends UI.TreeOutline.TreeElement{constructor(e){super(),this.uiSourceCode=e,this.listItemElement.classList.add("navigator-"+e.contentType().name()+"-tree-item"),UI.ARIAUtils.markAsTab(this.listItemElement);let t="largeicon-navigator-file";Snippets.ScriptSnippetFileSystem.isSnippetsUISourceCode(this.uiSourceCode)&&(t="largeicon-navigator-snippet");const i=UI.Icon.Icon.create(t,"icon");this.setLeadingIcons([i]),this._eventListeners=[e.addEventListener(Workspace.UISourceCode.Events.TitleChanged,this._updateTitle,this),e.addEventListener(Workspace.UISourceCode.Events.WorkingCopyChanged,this._updateTitle,this),e.addEventListener(Workspace.UISourceCode.Events.WorkingCopyCommitted,this._updateTitle,this)],this._updateTitle()}_updateTitle(){let e=this.uiSourceCode.displayName();this.uiSourceCode.isDirty()&&(e="*"+e),this.title=e;let t=this.uiSourceCode.url();this.uiSourceCode.contentType().isFromSourceMap()&&(t=Common.UIString.UIString("%s (from source map)",this.uiSourceCode.displayName())),this.tooltip=t}dispose(){Common.EventTarget.EventTarget.removeEventListeners(this._eventListeners)}}