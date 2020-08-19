import*as Common from"../common/common.js";import*as DataGrid from"../data_grid/data_grid.js";import*as Host from"../host/host.js";import*as SDK from"../sdk/sdk.js";import*as SourceFrame from"../source_frame/source_frame.js";import*as TextUtils from"../text_utils/text_utils.js";import*as UI from"../ui/ui.js";import{BinaryResourceView}from"./BinaryResourceView.js";export class ResourceWebSocketFrameView extends UI.Widget.VBox{constructor(e){super(),this.registerRequiredCSS("network/webSocketFrameView.css"),this.element.classList.add("websocket-frame-view"),this._request=e,this._splitWidget=new UI.SplitWidget.SplitWidget(!1,!0,"resourceWebSocketFrameSplitViewState"),this._splitWidget.show(this.element);const t=[{id:"data",title:Common.UIString.UIString("Data"),sortable:!1,weight:88},{id:"length",title:Common.UIString.UIString("Length"),sortable:!1,align:DataGrid.DataGrid.Align.Right,weight:5},{id:"time",title:Common.UIString.UIString("Time"),sortable:!0,weight:7}];this._dataGrid=new DataGrid.SortableDataGrid.SortableDataGrid({displayName:ls`Web Socket Frame`,columns:t}),this._dataGrid.setRowContextMenuCallback(function(e,t){const r=t,i=r.binaryView();i?i.addCopyToContextMenu(e,ls`Copy message...`):e.clipboardSection().appendItem(Common.UIString.UIString("Copy message"),Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText.bind(Host.InspectorFrontendHost.InspectorFrontendHostInstance,r.data.data));e.footerSection().appendItem(Common.UIString.UIString("Clear all"),this._clearFrames.bind(this))}.bind(this)),this._dataGrid.setStickToBottom(!0),this._dataGrid.setCellClass("websocket-frame-view-td"),this._timeComparator=ResourceWebSocketFrameNodeTimeComparator,this._dataGrid.sortNodes(this._timeComparator,!1),this._dataGrid.markColumnAsSortedBy("time",DataGrid.DataGrid.Order.Ascending),this._dataGrid.addEventListener(DataGrid.DataGrid.Events.SortingChanged,this._sortItems,this),this._dataGrid.setName("ResourceWebSocketFrameView"),this._dataGrid.addEventListener(DataGrid.DataGrid.Events.SelectedNode,e=>{this._onFrameSelected(e)},this),this._dataGrid.addEventListener(DataGrid.DataGrid.Events.DeselectedNode,this._onFrameDeselected,this),this._mainToolbar=new UI.Toolbar.Toolbar(""),this._clearAllButton=new UI.Toolbar.ToolbarButton(Common.UIString.UIString("Clear All"),"largeicon-clear"),this._clearAllButton.addEventListener(UI.Toolbar.ToolbarButton.Events.Click,this._clearFrames,this),this._mainToolbar.appendToolbarItem(this._clearAllButton),this._filterTypeCombobox=new UI.Toolbar.ToolbarComboBox(this._updateFilterSetting.bind(this),ls`Filter`);for(const e of _filterTypes){const t=this._filterTypeCombobox.createOption(e.label,e.name);this._filterTypeCombobox.addOption(t)}this._mainToolbar.appendToolbarItem(this._filterTypeCombobox),this._filterType=null;this._filterTextInput=new UI.Toolbar.ToolbarInput(Common.UIString.UIString("Enter regex, for example: (web)?socket"),"",.4),this._filterTextInput.addEventListener(UI.Toolbar.ToolbarInput.Event.TextChanged,this._updateFilterSetting,this),this._mainToolbar.appendToolbarItem(this._filterTextInput),this._filterRegex=null;const r=new UI.Widget.VBox;r.element.appendChild(this._mainToolbar.element),this._dataGrid.asWidget().show(r.element),r.setMinimumSize(0,72),this._splitWidget.setMainWidget(r),this._frameEmptyWidget=new UI.EmptyWidget.EmptyWidget(Common.UIString.UIString("Select message to browse its content.")),this._splitWidget.setSidebarWidget(this._frameEmptyWidget),this._selectedNode=null}static opCodeDescription(e,t){const r=opCodeDescriptions[e]||"";return t?ls`${r} (Opcode ${e}, mask)`:ls`${r} (Opcode ${e})`}wasShown(){this.refresh(),this._request.addEventListener(SDK.NetworkRequest.Events.WebsocketFrameAdded,this._frameAdded,this)}willHide(){this._request.removeEventListener(SDK.NetworkRequest.Events.WebsocketFrameAdded,this._frameAdded,this)}_frameAdded(e){const t=e.data;this._frameFilter(t)&&this._dataGrid.insertChild(new ResourceWebSocketFrameNode(this._request.url(),t))}_frameFilter(e){return(!this._filterType||e.type===this._filterType)&&(!this._filterRegex||this._filterRegex.test(e.text))}_clearFrames(){this._request[_clearFrameOffsetSymbol]=this._request.frames().length,this.refresh()}_updateFilterSetting(){const e=this._filterTextInput.value(),t=this._filterTypeCombobox.selectedOption().value;this._filterRegex=e?new RegExp(e,"i"):null,this._filterType="all"===t?null:t,this.refresh()}async _onFrameSelected(e){this._currentSelectedNode=e.data;const t=this._currentSelectedNode.dataText(),r=this._currentSelectedNode.binaryView();if(r)return void this._splitWidget.setSidebarWidget(r);const i=await SourceFrame.JSONView.JSONView.createView(t);i?this._splitWidget.setSidebarWidget(i):this._splitWidget.setSidebarWidget(new SourceFrame.ResourceSourceFrame.ResourceSourceFrame(TextUtils.StaticContentProvider.StaticContentProvider.fromString(this._request.url(),Common.ResourceType.resourceTypes.WebSocket,t)))}_onFrameDeselected(e){this._currentSelectedNode=null,this._splitWidget.setSidebarWidget(this._frameEmptyWidget)}refresh(){this._dataGrid.rootNode().removeChildren();const e=this._request.url();let t=this._request.frames();const r=this._request[_clearFrameOffsetSymbol]||0;t=t.slice(r),t=t.filter(this._frameFilter.bind(this)),t.forEach(t=>this._dataGrid.insertChild(new ResourceWebSocketFrameNode(e,t)))}_sortItems(){this._dataGrid.sortNodes(this._timeComparator,!this._dataGrid.isSortOrderAscending())}}export const OpCodes={ContinuationFrame:0,TextFrame:1,BinaryFrame:2,ConnectionCloseFrame:8,PingFrame:9,PongFrame:10};export const opCodeDescriptions=function(){const e=OpCodes,t=[];return t[e.ContinuationFrame]=ls`Continuation Frame`,t[e.TextFrame]=ls`Text Message`,t[e.BinaryFrame]=ls`Binary Message`,t[e.ContinuationFrame]=ls`Connection Close Message`,t[e.PingFrame]=ls`Ping Message`,t[e.PongFrame]=ls`Pong Message`,t}();export const _filterTypes=[{name:"all",label:Common.UIString.UIString("All")},{name:"send",label:Common.UIString.UIString("Send")},{name:"receive",label:Common.UIString.UIString("Receive")}];export class ResourceWebSocketFrameNode extends DataGrid.SortableDataGrid.SortableDataGridNode{constructor(e,t){let r=t.text.length;const i=new Date(1e3*t.time),s=("0"+i.getHours()).substr(-2)+":"+("0"+i.getMinutes()).substr(-2)+":"+("0"+i.getSeconds()).substr(-2)+"."+("00"+i.getMilliseconds()).substr(-3),o=createElement("div");o.createTextChild(s),o.title=i.toLocaleString();let a=t.text,n=ResourceWebSocketFrameView.opCodeDescription(t.opCode,t.mask);const d=t.opCode===OpCodes.TextFrame;t.type===SDK.NetworkRequest.WebSocketFrameType.Error?(n=a,r=ls`N/A`):d?n=a:t.opCode===OpCodes.BinaryFrame?(r=Number.bytesToString(base64ToSize(t.text)),n=opCodeDescriptions[t.opCode]):a=n,super({data:n,length:r,time:o}),this._url=e,this._frame=t,this._isTextFrame=d,this._dataText=a}createCells(e){e.classList.toggle("websocket-frame-view-row-error",this._frame.type===SDK.NetworkRequest.WebSocketFrameType.Error),e.classList.toggle("websocket-frame-view-row-send",this._frame.type===SDK.NetworkRequest.WebSocketFrameType.Send),e.classList.toggle("websocket-frame-view-row-receive",this._frame.type===SDK.NetworkRequest.WebSocketFrameType.Receive),super.createCells(e)}nodeSelfHeight(){return 21}dataText(){return this._dataText}opCode(){return this._frame.opCode}binaryView(){return this._isTextFrame||this._frame.type===SDK.NetworkRequest.WebSocketFrameType.Error?null:(this._binaryView||(this._binaryView=new BinaryResourceView(this._dataText,"",Common.ResourceType.resourceTypes.WebSocket)),this._binaryView)}}export function ResourceWebSocketFrameNodeTimeComparator(e,t){return e._frame.time-t._frame.time}export const _clearFrameOffsetSymbol=Symbol("ClearFrameOffset");