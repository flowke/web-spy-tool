import*as Common from"../common/common.js";import*as Host from"../host/host.js";import*as Platform from"../platform/platform.js";import*as ProtocolClient from"../protocol_client/protocol_client.js";import{Cookie}from"./Cookie.js";import{ContentData,Events as NetworkRequestEvents,ExtraRequestInfo,ExtraResponseInfo,NameValue,NetworkRequest}from"./NetworkRequest.js";import{Capability,SDKModel,SDKModelObserver,Target,TargetManager}from"./SDKModel.js";export class NetworkManager extends SDKModel{constructor(e){super(e),this._dispatcher=new NetworkDispatcher(this),this._networkAgent=e.networkAgent(),e.registerNetworkDispatcher(this._dispatcher),Common.Settings.Settings.instance().moduleSetting("cacheDisabled").get()&&this._networkAgent.setCacheDisabled(!0),this._networkAgent.enable(void 0,void 0,MAX_EAGER_POST_REQUEST_BODY_LENGTH),this._bypassServiceWorkerSetting=Common.Settings.Settings.instance().createSetting("bypassServiceWorker",!1),this._bypassServiceWorkerSetting.get()&&this._bypassServiceWorkerChanged(),this._bypassServiceWorkerSetting.addChangeListener(this._bypassServiceWorkerChanged,this),Common.Settings.Settings.instance().moduleSetting("cacheDisabled").addChangeListener(this._cacheDisabledSettingChanged,this)}static forRequest(e){return e[_networkManagerForRequestSymbol]}static canReplayRequest(e){return!!e[_networkManagerForRequestSymbol]&&e.resourceType()===Common.ResourceType.resourceTypes.XHR}static replayRequest(e){const t=e[_networkManagerForRequestSymbol];t&&t._networkAgent.replayXHR(e.requestId())}static async searchInRequest(e,t,s,r){const o=NetworkManager.forRequest(e);if(!o)return[];return(await o._networkAgent.invoke_searchInResponseBody({requestId:e.requestId(),query:t,caseSensitive:s,isRegex:r})).result||[]}static async requestContentData(e){if(e.resourceType()===Common.ResourceType.resourceTypes.WebSocket)return{error:"Content for WebSockets is currently not supported",content:null,encoded:!1};e.finished||await e.once(NetworkRequestEvents.FinishedLoading);const t=NetworkManager.forRequest(e);if(!t)return{error:"No network manager for request",content:null,encoded:!1};const s=await t._networkAgent.invoke_getResponseBody({requestId:e.requestId()}),r=s[ProtocolClient.InspectorBackend.ProtocolError]||null;return{error:r,content:r?null:s.body,encoded:s.base64Encoded}}static requestPostData(e){const t=NetworkManager.forRequest(e);return t?t._networkAgent.getRequestPostData(e.backendRequestId()):(console.error("No network manager for request"),Promise.resolve(null))}static _connectionType(e){if(!e.download&&!e.upload)return Protocol.Network.ConnectionType.None;let t=NetworkManager._connectionTypes;t||(NetworkManager._connectionTypes=[],t=NetworkManager._connectionTypes,t.push(["2g",Protocol.Network.ConnectionType.Cellular2g]),t.push(["3g",Protocol.Network.ConnectionType.Cellular3g]),t.push(["4g",Protocol.Network.ConnectionType.Cellular4g]),t.push(["bluetooth",Protocol.Network.ConnectionType.Bluetooth]),t.push(["wifi",Protocol.Network.ConnectionType.Wifi]),t.push(["wimax",Protocol.Network.ConnectionType.Wimax]));for(const s of t)if(-1!==e.title.toLowerCase().indexOf(s[0]))return s[1];return Protocol.Network.ConnectionType.Other}static lowercaseHeaders(e){const t={};for(const s in e)t[s.toLowerCase()]=e[s];return t}inflightRequestForURL(e){return this._dispatcher._inflightRequestsByURL[e]}_cacheDisabledSettingChanged(e){const t=e.data;this._networkAgent.setCacheDisabled(t)}dispose(){Common.Settings.Settings.instance().moduleSetting("cacheDisabled").removeChangeListener(this._cacheDisabledSettingChanged,this)}_bypassServiceWorkerChanged(){this._networkAgent.setBypassServiceWorker(this._bypassServiceWorkerSetting.get())}}export const Events={RequestStarted:Symbol("RequestStarted"),RequestUpdated:Symbol("RequestUpdated"),RequestFinished:Symbol("RequestFinished"),RequestUpdateDropped:Symbol("RequestUpdateDropped"),ResponseReceived:Symbol("ResponseReceived"),MessageGenerated:Symbol("MessageGenerated"),RequestRedirected:Symbol("RequestRedirected"),LoadingFinished:Symbol("LoadingFinished")};const _MIMETypes={"text/html":{document:!0},"text/xml":{document:!0},"text/plain":{document:!0},"application/xhtml+xml":{document:!0},"image/svg+xml":{document:!0},"text/css":{stylesheet:!0},"text/xsl":{stylesheet:!0},"text/vtt":{texttrack:!0},"application/pdf":{document:!0}};export const NoThrottlingConditions={title:Common.UIString.UIString("Online"),download:-1,upload:-1,latency:0};export const OfflineConditions={title:Common.UIString.UIString("Offline"),download:0,upload:0,latency:0};export const Slow3GConditions={title:Common.UIString.UIString("Slow 3G"),download:51200,upload:51200,latency:2e3};export const Fast3GConditions={title:Common.UIString.UIString("Fast 3G"),download:209715.2*.9,upload:86400,latency:562.5};const _networkManagerForRequestSymbol=Symbol("NetworkManager"),MAX_EAGER_POST_REQUEST_BODY_LENGTH=65536;export class NetworkDispatcher{constructor(e){this._manager=e,this._inflightRequestsById={},this._inflightRequestsByURL={},this._requestIdToRedirectExtraInfoBuilder=new Map}_headersMapToHeadersArray(e){const t=[];for(const s in e){const r=e[s].split("\n");for(let e=0;e<r.length;++e)t.push({name:s,value:r[e]})}return t}_updateNetworkRequestWithRequest(e,t){e.requestMethod=t.method,e.setRequestHeaders(this._headersMapToHeadersArray(t.headers)),e.setRequestFormData(!!t.hasPostData,t.postData||null),e.setInitialPriority(t.initialPriority),e.mixedContentType=t.mixedContentType||Protocol.Security.MixedContentType.None,e.setReferrerPolicy(t.referrerPolicy)}_updateNetworkRequestWithResponse(e,t){if(t.url&&e.url()!==t.url&&e.setUrl(t.url),e.mimeType=t.mimeType,e.statusCode=t.status,e.statusText=t.statusText,e.hasExtraResponseInfo()||(e.responseHeaders=this._headersMapToHeadersArray(t.headers)),t.encodedDataLength>=0&&e.setTransferSize(t.encodedDataLength),t.requestHeaders&&!e.hasExtraRequestInfo()&&(e.setRequestHeaders(this._headersMapToHeadersArray(t.requestHeaders)),e.setRequestHeadersText(t.requestHeadersText||"")),e.connectionReused=t.connectionReused,e.connectionId=String(t.connectionId),t.remoteIPAddress&&e.setRemoteAddress(t.remoteIPAddress,t.remotePort||-1),t.fromServiceWorker&&(e.fetchedViaServiceWorker=!0),t.fromDiskCache&&e.setFromDiskCache(),t.fromPrefetchCache&&e.setFromPrefetchCache(),e.timing=t.timing,e.protocol=t.protocol||"",e.setSecurityState(t.securityState),!this._mimeTypeIsConsistentWithType(e)){const t=Common.UIString.UIString('Resource interpreted as %s but transferred with MIME type %s: "%s".',e.resourceType().title(),e.mimeType,e.url());this._manager.dispatchEventToListeners(Events.MessageGenerated,{message:t,requestId:e.requestId(),warning:!0})}t.securityDetails&&e.setSecurityDetails(t.securityDetails)}_mimeTypeIsConsistentWithType(e){if(e.hasErrorStatusCode()||304===e.statusCode||204===e.statusCode)return!0;const t=e.resourceType();return t!==Common.ResourceType.resourceTypes.Stylesheet&&t!==Common.ResourceType.resourceTypes.Document&&t!==Common.ResourceType.resourceTypes.TextTrack||(!e.mimeType||e.mimeType in _MIMETypes&&t.name()in _MIMETypes[e.mimeType])}resourceChangedPriority(e,t,s){const r=this._inflightRequestsById[e];r&&r.setPriority(t)}signedExchangeReceived(e,t){let s=this._inflightRequestsById[e];(s||(s=this._inflightRequestsByURL[t.outerResponse.url],s))&&(s.setSignedExchangeInfo(t),s.setResourceType(Common.ResourceType.resourceTypes.SignedExchange),this._updateNetworkRequestWithResponse(s,t.outerResponse),this._updateNetworkRequest(s),this._manager.dispatchEventToListeners(Events.ResponseReceived,s))}requestWillBeSent(e,t,s,r,o,n,i,a,d,c){let u=this._inflightRequestsById[e];if(u){if(!a)return;u.signedExchangeInfo()||this.responseReceived(e,t,o,Protocol.Network.ResourceType.Other,a,c),u=this._appendRedirect(e,o,r.url),this._manager.dispatchEventToListeners(Events.RequestRedirected,u)}else u=this._createNetworkRequest(e,c||"",t,r.url,s,i);u.hasNetworkData=!0,this._updateNetworkRequestWithRequest(u,r),u.setIssueTime(o,n),u.setResourceType(d?Common.ResourceType.resourceTypes[d]:Protocol.Network.ResourceType.Other),this._getExtraInfoBuilder(e).addRequest(u),this._startNetworkRequest(u)}requestServedFromCache(e){const t=this._inflightRequestsById[e];t&&t.setFromMemoryCache()}responseReceived(e,t,s,r,o,n){const i=this._inflightRequestsById[e],a=NetworkManager.lowercaseHeaders(o.headers);if(!i){const e={};e.url=o.url,e.frameId=n||"",e.loaderId=t,e.resourceType=r,e.mimeType=o.mimeType;const s=a["last-modified"];return e.lastModified=s?new Date(s):null,void this._manager.dispatchEventToListeners(Events.RequestUpdateDropped,e)}if(i.responseReceivedTime=s,i.setResourceType(Common.ResourceType.resourceTypes[r]),"set-cookie"in a&&a["set-cookie"].length>4096){const t=a["set-cookie"].split("\n");for(let s=0;s<t.length;++s){if(t[s].length<=4096)continue;const r=Common.UIString.UIString("Set-Cookie header is ignored in response from url: %s. Cookie length should be less than or equal to 4096 characters.",o.url);this._manager.dispatchEventToListeners(Events.MessageGenerated,{message:r,requestId:e,warning:!0})}}this._updateNetworkRequestWithResponse(i,o),this._updateNetworkRequest(i),this._manager.dispatchEventToListeners(Events.ResponseReceived,i)}dataReceived(e,t,s,r){let o=this._inflightRequestsById[e];o||(o=this._maybeAdoptMainResourceRequest(e)),o&&(o.resourceSize+=s,-1!==r&&o.increaseTransferSize(r),o.endTime=t,this._updateNetworkRequest(o))}loadingFinished(e,t,s,r){let o=this._inflightRequestsById[e];o||(o=this._maybeAdoptMainResourceRequest(e)),o&&(this._getExtraInfoBuilder(e).finished(),this._finishNetworkRequest(o,t,s,r),this._manager.dispatchEventToListeners(Events.LoadingFinished,o))}loadingFailed(e,t,s,r,o,n){const i=this._inflightRequestsById[e];if(i){if(i.failed=!0,i.setResourceType(Common.ResourceType.resourceTypes[s]),i.canceled=!!o,n&&(i.setBlockedReason(n),n===Protocol.Network.BlockedReason.Inspector)){const t=Common.UIString.UIString('Request was blocked by DevTools: "%s".',i.url());this._manager.dispatchEventToListeners(Events.MessageGenerated,{message:t,requestId:e,warning:!0})}i.localizedFailDescription=r,this._getExtraInfoBuilder(e).finished(),this._finishNetworkRequest(i,t,-1)}}webSocketCreated(e,t,s){const r=new NetworkRequest(e,t,"","","",s||null);r[_networkManagerForRequestSymbol]=this._manager,r.setResourceType(Common.ResourceType.resourceTypes.WebSocket),this._startNetworkRequest(r)}webSocketWillSendHandshakeRequest(e,t,s,r){const o=this._inflightRequestsById[e];o&&(o.requestMethod="GET",o.setRequestHeaders(this._headersMapToHeadersArray(r.headers)),o.setIssueTime(t,s),this._updateNetworkRequest(o))}webSocketHandshakeResponseReceived(e,t,s){const r=this._inflightRequestsById[e];r&&(r.statusCode=s.status,r.statusText=s.statusText,r.responseHeaders=this._headersMapToHeadersArray(s.headers),r.responseHeadersText=s.headersText||"",s.requestHeaders&&r.setRequestHeaders(this._headersMapToHeadersArray(s.requestHeaders)),s.requestHeadersText&&r.setRequestHeadersText(s.requestHeadersText),r.responseReceivedTime=t,r.protocol="websocket",this._updateNetworkRequest(r))}webSocketFrameReceived(e,t,s){const r=this._inflightRequestsById[e];r&&(r.addProtocolFrame(s,t,!1),r.responseReceivedTime=t,this._updateNetworkRequest(r))}webSocketFrameSent(e,t,s){const r=this._inflightRequestsById[e];r&&(r.addProtocolFrame(s,t,!0),r.responseReceivedTime=t,this._updateNetworkRequest(r))}webSocketFrameError(e,t,s){const r=this._inflightRequestsById[e];r&&(r.addProtocolFrameError(s,t),r.responseReceivedTime=t,this._updateNetworkRequest(r))}webSocketClosed(e,t){const s=this._inflightRequestsById[e];s&&this._finishNetworkRequest(s,t,-1)}eventSourceMessageReceived(e,t,s,r,o){const n=this._inflightRequestsById[e];n&&n.addEventSourceMessage(t,s,r,o)}requestIntercepted(e,t,s,r,o,n,i,a,d,c,u,h){self.SDK.multitargetNetworkManager._requestIntercepted(new InterceptedRequest(this._manager.target().networkAgent(),e,t,s,r,o,n,i,a,d,c,u,h))}requestWillBeSentExtraInfo(e,t,s){const r={blockedRequestCookies:t.map(e=>({blockedReasons:e.blockedReasons,cookie:Cookie.fromProtocolCookie(e.cookie)})),requestHeaders:this._headersMapToHeadersArray(s)};this._getExtraInfoBuilder(e).addRequestExtraInfo(r)}responseReceivedExtraInfo(e,t,s,r){const o={blockedResponseCookies:t.map(e=>({blockedReasons:e.blockedReasons,cookieLine:e.cookieLine,cookie:e.cookie?Cookie.fromProtocolCookie(e.cookie):null})),responseHeaders:this._headersMapToHeadersArray(s),responseHeadersText:r};this._getExtraInfoBuilder(e).addResponseExtraInfo(o)}cookiesChanged(e,t,s){}_getExtraInfoBuilder(e){if(!this._requestIdToRedirectExtraInfoBuilder.get(e)){const t=()=>{this._requestIdToRedirectExtraInfoBuilder.delete(e)};this._requestIdToRedirectExtraInfoBuilder.set(e,new RedirectExtraInfoBuilder(t))}return this._requestIdToRedirectExtraInfoBuilder.get(e)}_appendRedirect(e,t,s){const r=this._inflightRequestsById[e];let o=0;for(let e=r.redirectSource();e;e=e.redirectSource())o++;r.markAsRedirect(o),this._finishNetworkRequest(r,t,-1);const n=this._createNetworkRequest(e,r.frameId,r.loaderId,s,r.documentURL,r.initiator());return n.setRedirectSource(r),r.setRedirectDestination(n),n}_maybeAdoptMainResourceRequest(e){const t=self.SDK.multitargetNetworkManager._inflightMainResourceRequests.get(e);if(!t)return null;const s=NetworkManager.forRequest(t)._dispatcher;return delete s._inflightRequestsById[e],delete s._inflightRequestsByURL[t.url()],this._inflightRequestsById[e]=t,this._inflightRequestsByURL[t.url()]=t,t[_networkManagerForRequestSymbol]=this._manager,t}_startNetworkRequest(e){this._inflightRequestsById[e.requestId()]=e,this._inflightRequestsByURL[e.url()]=e,e.loaderId===e.requestId()&&self.SDK.multitargetNetworkManager._inflightMainResourceRequests.set(e.requestId(),e),this._manager.dispatchEventToListeners(Events.RequestStarted,e)}_updateNetworkRequest(e){this._manager.dispatchEventToListeners(Events.RequestUpdated,e)}_finishNetworkRequest(e,t,s,r){if(e.endTime=t,e.finished=!0,s>=0){const t=e.redirectSource();t&&t.signedExchangeInfo()?(e.setTransferSize(0),t.setTransferSize(s),this._updateNetworkRequest(t)):e.setTransferSize(s)}if(this._manager.dispatchEventToListeners(Events.RequestFinished,e),delete this._inflightRequestsById[e.requestId()],delete this._inflightRequestsByURL[e.url()],self.SDK.multitargetNetworkManager._inflightMainResourceRequests.delete(e.requestId()),r){const t=Common.UIString.UIString("Cross-Origin Read Blocking (CORB) blocked cross-origin response %s with MIME type %s. See https://www.chromestatus.com/feature/5629709824032768 for more details.",e.url(),e.mimeType);this._manager.dispatchEventToListeners(Events.MessageGenerated,{message:t,requestId:e.requestId(),warning:!0})}if(Common.Settings.Settings.instance().moduleSetting("monitoringXHREnabled").get()&&e.resourceType().category()===Common.ResourceType.resourceCategories.XHR){let t;t=e.failed||e.hasErrorStatusCode()?Common.UIString.UIString('%s failed loading: %s "%s".',e.resourceType().title(),e.requestMethod,e.url()):Common.UIString.UIString('%s finished loading: %s "%s".',e.resourceType().title(),e.requestMethod,e.url()),this._manager.dispatchEventToListeners(Events.MessageGenerated,{message:t,requestId:e.requestId(),warning:!1})}}_createNetworkRequest(e,t,s,r,o,n){const i=new NetworkRequest(e,r,o,t,s,n);return i[_networkManagerForRequestSymbol]=this._manager,i}}export class MultitargetNetworkManager extends Common.ObjectWrapper.ObjectWrapper{constructor(){super(),this._userAgentOverride="",this._agents=new Set,this._inflightMainResourceRequests=new Map,this._networkConditions=NoThrottlingConditions,this._updatingInterceptionPatternsPromise=null,this._blockingEnabledSetting=Common.Settings.Settings.instance().moduleSetting("requestBlockingEnabled"),this._blockedPatternsSetting=Common.Settings.Settings.instance().createSetting("networkBlockedPatterns",[]),this._effectiveBlockedURLs=[],this._updateBlockedPatterns(),this._urlsForRequestInterceptor=new Platform.Multimap,TargetManager.instance().observeModels(NetworkManager,this)}static patchUserAgentWithChromeVersion(e){const t=new RegExp("(?:^|\\W)Chrome/(\\S+)"),s=navigator.userAgent.match(t);if(s&&s.length>1){const t=s[1].split(".",1)[0]+".0.100.0";return Platform.StringUtilities.sprintf(e,s[1],t)}return e}modelAdded(e){const t=e.target().networkAgent();this._extraHeaders&&t.setExtraHTTPHeaders(this._extraHeaders),this.currentUserAgent()&&t.setUserAgentOverride(this.currentUserAgent()),this._effectiveBlockedURLs.length&&t.setBlockedURLs(this._effectiveBlockedURLs),this.isIntercepting()&&t.setRequestInterception(this._urlsForRequestInterceptor.valuesArray()),this._agents.add(t),this.isThrottling()&&this._updateNetworkConditions(t)}modelRemoved(e){for(const t of this._inflightMainResourceRequests){NetworkManager.forRequest(t[1])===e&&this._inflightMainResourceRequests.delete(t[0])}this._agents.delete(e.target().networkAgent())}isThrottling(){return this._networkConditions.download>=0||this._networkConditions.upload>=0||this._networkConditions.latency>0}isOffline(){return!this._networkConditions.download&&!this._networkConditions.upload}setNetworkConditions(e){this._networkConditions=e;for(const e of this._agents)this._updateNetworkConditions(e);this.dispatchEventToListeners(MultitargetNetworkManager.Events.ConditionsChanged)}networkConditions(){return this._networkConditions}_updateNetworkConditions(e){const t=this._networkConditions;this.isThrottling()?e.emulateNetworkConditions(this.isOffline(),t.latency,t.download<0?0:t.download,t.upload<0?0:t.upload,NetworkManager._connectionType(t)):e.emulateNetworkConditions(!1,0,0,0)}setExtraHTTPHeaders(e){this._extraHeaders=e;for(const e of this._agents)e.setExtraHTTPHeaders(this._extraHeaders)}currentUserAgent(){return this._customUserAgent?this._customUserAgent:this._userAgentOverride}_updateUserAgentOverride(){const e=this.currentUserAgent();for(const t of this._agents)t.setUserAgentOverride(e)}setUserAgentOverride(e){this._userAgentOverride!==e&&(this._userAgentOverride=e,this._customUserAgent||this._updateUserAgentOverride(),this.dispatchEventToListeners(MultitargetNetworkManager.Events.UserAgentChanged))}userAgentOverride(){return this._userAgentOverride}setCustomUserAgentOverride(e){this._customUserAgent=e,this._updateUserAgentOverride()}blockedPatterns(){return this._blockedPatternsSetting.get().slice()}blockingEnabled(){return this._blockingEnabledSetting.get()}isBlocking(){return!!this._effectiveBlockedURLs.length}setBlockedPatterns(e){this._blockedPatternsSetting.set(e),this._updateBlockedPatterns(),this.dispatchEventToListeners(MultitargetNetworkManager.Events.BlockedPatternsChanged)}setBlockingEnabled(e){this._blockingEnabledSetting.get()!==e&&(this._blockingEnabledSetting.set(e),this._updateBlockedPatterns(),this.dispatchEventToListeners(MultitargetNetworkManager.Events.BlockedPatternsChanged))}_updateBlockedPatterns(){const e=[];if(this._blockingEnabledSetting.get())for(const t of this._blockedPatternsSetting.get())t.enabled&&e.push(t.url);if(e.length||this._effectiveBlockedURLs.length){this._effectiveBlockedURLs=e;for(const e of this._agents)e.setBlockedURLs(this._effectiveBlockedURLs)}}isIntercepting(){return!!this._urlsForRequestInterceptor.size}setInterceptionHandlerForPatterns(e,t){this._urlsForRequestInterceptor.deleteAll(t);for(const s of e)this._urlsForRequestInterceptor.set(t,s);return this._updateInterceptionPatternsOnNextTick()}_updateInterceptionPatternsOnNextTick(){return this._updatingInterceptionPatternsPromise||(this._updatingInterceptionPatternsPromise=Promise.resolve().then(this._updateInterceptionPatterns.bind(this))),this._updatingInterceptionPatternsPromise}_updateInterceptionPatterns(){Common.Settings.Settings.instance().moduleSetting("cacheDisabled").get()||Common.Settings.Settings.instance().moduleSetting("cacheDisabled").set(!0),this._updatingInterceptionPatternsPromise=null;const e=[];for(const t of this._agents)e.push(t.setRequestInterception(this._urlsForRequestInterceptor.valuesArray()));return this.dispatchEventToListeners(MultitargetNetworkManager.Events.InterceptorsChanged),Promise.all(e)}async _requestIntercepted(e){for(const t of this._urlsForRequestInterceptor.keysArray())if(await t(e),e.hasResponded())return;e.hasResponded()||e.continueRequestWithoutChange()}clearBrowserCache(){for(const e of this._agents)e.clearBrowserCache()}clearBrowserCookies(){for(const e of this._agents)e.clearBrowserCookies()}getCertificate(e){return TargetManager.instance().mainTarget().networkAgent().getCertificate(e).then(e=>e||[])}loadResource(e,t){const s={},r=this.currentUserAgent();r&&(s["User-Agent"]=r),Common.Settings.Settings.instance().moduleSetting("cacheDisabled").get()&&(s["Cache-Control"]="no-cache"),Host.ResourceLoader.load(e,s,t)}}MultitargetNetworkManager.Events={BlockedPatternsChanged:Symbol("BlockedPatternsChanged"),ConditionsChanged:Symbol("ConditionsChanged"),UserAgentChanged:Symbol("UserAgentChanged"),InterceptorsChanged:Symbol("InterceptorsChanged")};export class InterceptedRequest{constructor(e,t,s,r,o,n,i,a,d,c,u,h,l){this._networkAgent=e,this._interceptionId=t,this._hasResponded=!1,this.request=s,this.frameId=r,this.resourceType=o,this.isNavigationRequest=n,this.isDownload=!!i,this.redirectUrl=a,this.authChallenge=d,this.responseErrorReason=c,this.responseStatusCode=u,this.responseHeaders=h,this.requestId=l}hasResponded(){return this._hasResponded}async continueRequestWithContent(e){this._hasResponded=!0;const t=["HTTP/1.1 200 OK","Date: "+(new Date).toUTCString(),"Server: Chrome Devtools Request Interceptor","Connection: closed","Content-Length: "+e.size,"Content-Type: "+e.type||"text/x-unknown"],s=await async function(e){const t=new FileReader,s=new Promise(e=>t.onloadend=e);if(t.readAsDataURL(e),await s,t.error)return console.error("Could not convert blob to base64.",t.error),"";const r=t.result;if(void 0===r)return console.error("Could not convert blob to base64."),"";return r.substring(r.indexOf(",")+1)}(new Blob([t.join("\r\n"),"\r\n\r\n",e]));this._networkAgent.continueInterceptedRequest(this._interceptionId,void 0,s)}continueRequestWithoutChange(){console.assert(!this._hasResponded),this._hasResponded=!0,this._networkAgent.continueInterceptedRequest(this._interceptionId)}continueRequestWithError(e){console.assert(!this._hasResponded),this._hasResponded=!0,this._networkAgent.continueInterceptedRequest(this._interceptionId,e)}async responseBody(){const e=await this._networkAgent.invoke_getResponseBodyForInterception({interceptionId:this._interceptionId}),t=e[ProtocolClient.InspectorBackend.ProtocolError]||null;return{error:t,content:t?null:e.body,encoded:e.base64Encoded}}}class RedirectExtraInfoBuilder{constructor(e){this._requests=[],this._requestExtraInfos=[],this._responseExtraInfos=[],this._finished=!1,this._hasExtraInfo=!1,this._deleteCallback=e}addRequest(e){this._requests.push(e),this._sync(this._requests.length-1)}addRequestExtraInfo(e){this._hasExtraInfo=!0,this._requestExtraInfos.push(e),this._sync(this._requestExtraInfos.length-1)}addResponseExtraInfo(e){this._responseExtraInfos.push(e),this._sync(this._responseExtraInfos.length-1)}finished(){this._finished=!0,this._deleteIfComplete()}_sync(e){const t=this._requests[e];if(!t)return;const s=this._requestExtraInfos[e];s&&(t.addExtraRequestInfo(s),this._requestExtraInfos[e]=null);const r=this._responseExtraInfos[e];r&&(t.addExtraResponseInfo(r),this._responseExtraInfos[e]=null),this._deleteIfComplete()}_deleteIfComplete(){this._finished&&(this._hasExtraInfo&&!this._requests.peekLast().hasExtraResponseInfo()||this._deleteCallback())}}SDKModel.register(NetworkManager,Capability.Network,!0);export let Conditions;export let BlockedPattern;export let Message;export let InterceptionPattern;export let RequestInterceptor;