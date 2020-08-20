import{ObjectWrapper}from"./Object.js";import{reveal}from"./Revealer.js";let consoleInstance;export class Console extends ObjectWrapper{constructor(){super(),this._messages=[]}static instance({forceNew:e}={forceNew:!1}){return consoleInstance&&!e||(consoleInstance=new Console),consoleInstance}addMessage(e,s,t){const o=new Message(e,s||MessageLevel.Info,Date.now(),t||!1);this._messages.push(o),this.dispatchEventToListeners(Events.MessageAdded,o)}log(e){this.addMessage(e,MessageLevel.Info)}warn(e){this.addMessage(e,MessageLevel.Warning)}error(e){this.addMessage(e,MessageLevel.Error,!0)}messages(){return this._messages}show(){this.showPromise()}showPromise(){return reveal(this)}}export const Events={MessageAdded:Symbol("messageAdded")};export const MessageLevel={Info:"info",Warning:"warning",Error:"error"};export class Message{constructor(e,s,t,o){this.text=e,this.level=s,this.timestamp="number"==typeof t?t:Date.now(),this.show=o}}