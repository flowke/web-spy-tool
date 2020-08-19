import*as Common from"../common/common.js";import*as ProtocolClient from"../protocol_client/protocol_client.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";import{ApplicationCacheModel}from"./ApplicationCacheModel.js";import{DatabaseModel}from"./DatabaseModel.js";import{DOMStorageModel}from"./DOMStorageModel.js";import{IndexedDBModel}from"./IndexedDBModel.js";export class ClearStorageView extends UI.ThrottledWidget.ThrottledWidget{constructor(){super(!0,1e3);const e=Protocol.Storage.StorageType;this._pieColors=new Map([[e.Appcache,"rgb(110, 161, 226)"],[e.Cache_storage,"rgb(229, 113, 113)"],[e.Cookies,"rgb(239, 196, 87)"],[e.Indexeddb,"rgb(155, 127, 230)"],[e.Local_storage,"rgb(116, 178, 102)"],[e.Service_workers,"rgb(255, 167, 36)"],[e.Websql,"rgb(203, 220, 56)"]]),this._reportView=new UI.ReportView.ReportView(Common.UIString.UIString("Clear storage")),this._reportView.registerRequiredCSS("chii_resources/clearStorageView.css"),this._reportView.element.classList.add("clear-storage-header"),this._reportView.show(this.contentElement),this._target=null,this._securityOrigin=null,this._settings=new Map;for(const e of AllStorageTypes)this._settings.set(e,Common.Settings.Settings.instance().createSetting("clear-storage-"+e,!0));const t=this._reportView.appendSection(Common.UIString.UIString("Usage"));this._quotaRow=t.appendSelectableRow();const o=t.appendRow(),r=UI.XLink.XLink.create("https://developers.google.com/web/tools/chrome-devtools/progressive-web-apps#opaque-responses",ls`Learn more`);o.appendChild(r),this._quotaUsage=null,this._pieChart=new PerfUI.PieChart({chartName:ls`Storage Usage`,size:110,formatter:Number.bytesToString,showLegend:!0});const i=t.appendRow();i.classList.add("usage-breakdown-row"),i.appendChild(this._pieChart.element);const a=this._reportView.appendSection("","clear-storage-button").appendRow();if(this._clearButton=UI.UIUtils.createTextButton(ls`Clear site data`,this._clear.bind(this)),a.appendChild(this._clearButton),!window.ChiiMain){const e=this._reportView.appendSection(Common.UIString.UIString("Application"));this._appendItem(e,Common.UIString.UIString("Unregister service workers"),"service_workers"),e.markFieldListAsGroup()}const n=this._reportView.appendSection(Common.UIString.UIString("Storage"));if(this._appendItem(n,Common.UIString.UIString("Local and session storage"),"local_storage"),window.ChiiMain||(this._appendItem(n,Common.UIString.UIString("IndexedDB"),"indexeddb"),this._appendItem(n,Common.UIString.UIString("Web SQL"),"websql")),this._appendItem(n,Common.UIString.UIString("Cookies"),"cookies"),n.markFieldListAsGroup(),!window.ChiiMain){const e=this._reportView.appendSection(Common.UIString.UIString("Cache"));this._appendItem(e,Common.UIString.UIString("Cache storage"),"cache_storage"),this._appendItem(e,Common.UIString.UIString("Application cache"),"appcache"),e.markFieldListAsGroup()}SDK.SDKModel.TargetManager.instance().observeTargets(this)}_appendItem(e,t,o){e.appendRow().appendChild(UI.SettingsUI.createSettingCheckbox(t,this._settings.get(o),!0))}targetAdded(e){if(this._target)return;this._target=e;const t=e.model(SDK.SecurityOriginManager.SecurityOriginManager);this._updateOrigin(t.mainSecurityOrigin(),t.unreachableMainSecurityOrigin()),t.addEventListener(SDK.SecurityOriginManager.Events.MainSecurityOriginChanged,this._originChanged,this)}targetRemoved(e){if(this._target!==e)return;e.model(SDK.SecurityOriginManager.SecurityOriginManager).removeEventListener(SDK.SecurityOriginManager.Events.MainSecurityOriginChanged,this._originChanged,this)}_originChanged(e){const t=e.data.mainSecurityOrigin,o=e.data.unreachableMainSecurityOrigin;this._updateOrigin(t,o)}_updateOrigin(e,t){t?(this._securityOrigin=t,this._reportView.setSubtitle(ls`${t} (failed to load)`)):(this._securityOrigin=e,this._reportView.setSubtitle(e)),this.doUpdate()}_clear(){if(!this._securityOrigin)return;const e=[];for(const t of this._settings.keys())this._settings.get(t).get()&&e.push(t);this._target&&ClearStorageView.clear(this._target,this._securityOrigin,e),this._clearButton.disabled=!0;const t=this._clearButton.textContent;this._clearButton.textContent=Common.UIString.UIString("Clearing..."),setTimeout(()=>{this._clearButton.disabled=!1,this._clearButton.textContent=t,this._clearButton.focus()},500)}static clear(e,t,o){e.storageAgent().clearDataForOrigin(t,o.join(","));const r=new Set(o),i=r.has(Protocol.Storage.StorageType.All);if(r.has(Protocol.Storage.StorageType.Cookies)||i){const t=e.model(SDK.CookieModel.CookieModel);t&&t.clear()}if(r.has(Protocol.Storage.StorageType.Indexeddb)||i)for(const e of SDK.SDKModel.TargetManager.instance().targets()){const o=e.model(IndexedDBModel);o&&o.clearForOrigin(t)}if(r.has(Protocol.Storage.StorageType.Local_storage)||i){const o=e.model(DOMStorageModel);o&&o.clearForOrigin(t)}if(r.has(Protocol.Storage.StorageType.Websql)||i){const t=e.model(DatabaseModel);t&&(t.disable(),t.enable())}if(r.has(Protocol.Storage.StorageType.Cache_storage)||i){const e=SDK.SDKModel.TargetManager.instance().mainTarget(),o=e&&e.model(SDK.ServiceWorkerCacheModel.ServiceWorkerCacheModel);o&&o.clearForOrigin(t)}if(r.has(Protocol.Storage.StorageType.Appcache)||i){const t=e.model(ApplicationCacheModel);t&&t.reset()}}async doUpdate(){if(!this._securityOrigin)return;const e=this._securityOrigin,t=await this._target.storageAgent().invoke_getUsageAndQuota({origin:e});if(t[ProtocolClient.InspectorBackend.ProtocolError])return this._quotaRow.textContet="",void this._resetPieChart(0);if(this._quotaRow.textContent=Common.UIString.UIString("%s used out of %s storage quota. ",Number.bytesToString(t.usage),Number.bytesToString(t.quota)),t.quota<125829120&&(this._quotaRow.title=ls`Storage quota is limited in Incognito mode`,this._quotaRow.appendChild(UI.Icon.Icon.create("smallicon-info"))),null===this._quotaUsage||this._quotaUsage!==t.usage){this._quotaUsage=t.usage,this._resetPieChart(t.usage);for(const e of t.usageBreakdown.sort((e,t)=>t.usage-e.usage)){const t=e.usage;if(!t)continue;const o=this._getStorageTypeName(e.storageType),r=this._pieColors.get(e.storageType)||"#ccc";this._pieChart.addSlice(t,r,o)}}this._usageUpdatedForTest(t.usage,t.quota,t.usageBreakdown),this.update()}_resetPieChart(e){this._pieChart.initializeWithTotal(e)}_getStorageTypeName(e){switch(e){case Protocol.Storage.StorageType.File_systems:return Common.UIString.UIString("File System");case Protocol.Storage.StorageType.Websql:return Common.UIString.UIString("Web SQL");case Protocol.Storage.StorageType.Appcache:return Common.UIString.UIString("Application Cache");case Protocol.Storage.StorageType.Indexeddb:return Common.UIString.UIString("IndexedDB");case Protocol.Storage.StorageType.Cache_storage:return Common.UIString.UIString("Cache Storage");case Protocol.Storage.StorageType.Service_workers:return Common.UIString.UIString("Service Workers");default:return Common.UIString.UIString("Other")}}_usageUpdatedForTest(e,t,o){}}export const AllStorageTypes=[Protocol.Storage.StorageType.Cookies,Protocol.Storage.StorageType.Local_storage];export class ActionDelegate{handleAction(e,t){switch(t){case"resources.clear":return this._handleClear()}return!1}_handleClear(){const e=SDK.SDKModel.TargetManager.instance().mainTarget();if(!e)return!1;const t=e.model(SDK.ResourceTreeModel.ResourceTreeModel);if(!t)return!1;const o=t.getMainSecurityOrigin();return!!o&&(ClearStorageView.clear(e,o,AllStorageTypes),!0)}}