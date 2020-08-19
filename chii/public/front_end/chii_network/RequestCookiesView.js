import*as Common from"../common/common.js";import*as CookieTable from"../chii_cookie_table/chii_cookie_table.js";import*as SDK from"../sdk/sdk.js";import*as UI from"../ui/ui.js";export class RequestCookiesView extends UI.Widget.Widget{constructor(e){super(),this.registerRequiredCSS("chii_network/requestCookiesView.css"),this.element.classList.add("request-cookies-view"),this._request=e,this._detailedRequestCookies=null,this._showFilteredOutCookiesSetting=Common.Settings.Settings.instance().createSetting("show-filtered-out-request-cookies",!1),this._emptyWidget=new UI.EmptyWidget.EmptyWidget(Common.UIString.UIString("This request has no cookies.")),this._emptyWidget.show(this.element),this._requestCookiesTitle=this.element.createChild("div");const s=this._requestCookiesTitle.createChild("span","request-cookies-title");s.textContent=ls`Request Cookies`,s.title=ls`Cookies that were sent to the server in the 'cookie' header of the request`;const o=UI.SettingsUI.createSettingCheckbox(ls`show filtered out request cookies`,this._showFilteredOutCookiesSetting,!0);o.checkboxElement.addEventListener("change",()=>{this._refreshRequestCookiesView()}),this._requestCookiesTitle.appendChild(o),this._requestCookiesEmpty=this.element.createChild("div","cookies-panel-item"),this._requestCookiesEmpty.textContent=ls`No request cookies were sent.`,this._requestCookiesTable=new CookieTable.CookiesTable.CookiesTable(!0),this._requestCookiesTable.contentElement.classList.add("cookie-table","cookies-panel-item"),this._requestCookiesTable.show(this.element),this._responseCookiesTitle=this.element.createChild("div","request-cookies-title"),this._responseCookiesTitle.textContent=ls`Response Cookies`,this._responseCookiesTitle.title=ls`Cookies that were received from the server in the 'set-cookie' header of the response`,this._responseCookiesTable=new CookieTable.CookiesTable.CookiesTable(!0),this._responseCookiesTable.contentElement.classList.add("cookie-table","cookies-panel-item"),this._responseCookiesTable.show(this.element),this._malformedResponseCookiesTitle=this.element.createChild("div","request-cookies-title"),this._malformedResponseCookiesTitle.textContent=ls`Malformed Response Cookies`,this._malformedResponseCookiesTitle.title=ls`Cookies that were received from the server in the 'set-cookie' header of the response but were malformed`,this._malformedResponseCookiesList=this.element.createChild("div")}_getRequestCookies(){let e=[];const s=new Map;if(this._request.requestCookies.length)if(e=this._request.requestCookies.slice(),this._detailedRequestCookies)e=e.map(e=>{for(const s of this._detailedRequestCookies||[])if(s.name()===e.name()&&s.value()===e.value())return s;return e});else{const e=SDK.NetworkManager.NetworkManager.forRequest(this._request);if(e){const s=e.target().model(SDK.CookieModel.CookieModel);s&&s.getCookies([this._request.url()]).then(e=>{this._detailedRequestCookies=e,this._refreshRequestCookiesView()})}}if(this._showFilteredOutCookiesSetting.get())for(const o of this._request.blockedRequestCookies())s.set(o.cookie,o.blockedReasons.map(e=>({attribute:SDK.NetworkRequest.cookieBlockedReasonToAttribute(e),uiString:SDK.NetworkRequest.cookieBlockedReasonToUiString(e)}))),e.push(o.cookie);return{requestCookies:e,requestCookieToBlockedReasons:s}}_getResponseCookies(){let e=[];const s=new Map,o=[];if(this._request.responseCookies.length){const t=this._request.blockedResponseCookies().map(e=>e.cookieLine);e=this._request.responseCookies.filter(e=>{const s=t.indexOf(e.getCookieLine());return-1===s||(t[s]=null,!1)});for(const t of this._request.blockedResponseCookies()){const i=SDK.CookieParser.CookieParser.parseSetCookie(t.cookieLine);if(!i.length||t.blockedReasons.includes(Protocol.Network.SetCookieBlockedReason.SyntaxError)){o.push(t);continue}const r=t.cookie||i[0];r&&(s.set(r,t.blockedReasons.map(e=>({attribute:SDK.NetworkRequest.setCookieBlockedReasonToAttribute(e),uiString:SDK.NetworkRequest.setCookieBlockedReasonToUiString(e)}))),e.push(r))}}return{responseCookies:e,responseCookieToBlockedReasons:s,malformedResponseCookies:o}}_refreshRequestCookiesView(){if(!this.isShowing())return;this._request.requestCookies.length||this._request.responseCookies.length?this._emptyWidget.hideWidget():this._emptyWidget.showWidget();const{requestCookies:e,requestCookieToBlockedReasons:s}=this._getRequestCookies(),{responseCookies:o,responseCookieToBlockedReasons:t,malformedResponseCookies:i}=this._getResponseCookies();if(e.length?(this._requestCookiesTitle.classList.remove("hidden"),this._requestCookiesEmpty.classList.add("hidden"),this._requestCookiesTable.showWidget(),this._requestCookiesTable.setCookies(e,s)):this._request.blockedRequestCookies().length?(this._requestCookiesTitle.classList.remove("hidden"),this._requestCookiesEmpty.classList.remove("hidden"),this._requestCookiesTable.hideWidget()):(this._requestCookiesTitle.classList.add("hidden"),this._requestCookiesEmpty.classList.add("hidden"),this._requestCookiesTable.hideWidget()),o.length?(this._responseCookiesTitle.classList.remove("hidden"),this._responseCookiesTable.showWidget(),this._responseCookiesTable.setCookies(o,t)):(this._responseCookiesTitle.classList.add("hidden"),this._responseCookiesTable.hideWidget()),i.length){this._malformedResponseCookiesTitle.classList.remove("hidden"),this._malformedResponseCookiesList.classList.remove("hidden"),this._malformedResponseCookiesList.removeChildren();for(const e of i){const s=this._malformedResponseCookiesList.createChild("span","cookie-line source-code"),o=UI.Icon.Icon.create("smallicon-error","cookie-warning-icon");s.appendChild(o),s.createTextChild(e.cookieLine),s.title=SDK.NetworkRequest.setCookieBlockedReasonToUiString(Protocol.Network.SetCookieBlockedReason.SyntaxError)}}else this._malformedResponseCookiesTitle.classList.add("hidden"),this._malformedResponseCookiesList.classList.add("hidden")}wasShown(){this._request.addEventListener(SDK.NetworkRequest.Events.RequestHeadersChanged,this._refreshRequestCookiesView,this),this._request.addEventListener(SDK.NetworkRequest.Events.ResponseHeadersChanged,this._refreshRequestCookiesView,this),this._refreshRequestCookiesView()}willHide(){this._request.removeEventListener(SDK.NetworkRequest.Events.RequestHeadersChanged,this._refreshRequestCookiesView,this),this._request.removeEventListener(SDK.NetworkRequest.Events.ResponseHeadersChanged,this._refreshRequestCookiesView,this)}}