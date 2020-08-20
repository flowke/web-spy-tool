import*as Common from"../common/common.js";import{ls}from"../common/common.js";import{NameValue}from"./NetworkRequest.js";export class ServerTiming{constructor(e,r,n){this.metric=e,this.value=r,this.description=n}static parseHeaders(e){const r=e.filter(e=>"server-timing"===e.name.toLowerCase());if(!r.length)return null;const n=r.reduce((e,r)=>{const n=this.createFromHeaderValue(r.value);return e.push(...n.map((function(e){return new ServerTiming(e.name,e.hasOwnProperty("dur")?e.dur:null,e.hasOwnProperty("desc")?e.desc:"")}))),e},[]);return n.sort((e,r)=>e.metric.toLowerCase().compareTo(r.metric.toLowerCase())),n}static createFromHeaderValue(e){function r(){e=e.replace(/^\s*/,"")}function n(n){return console.assert(1===n.length),r(),e.charAt(0)===n&&(e=e.substring(1),!0)}function t(){const r=/^(?:\s*)([\w!#$%&'*+\-.^`|~]+)(?:\s*)(.*)/.exec(e);return r?(e=r[2],r[1]):null}function s(){return r(),'"'===e.charAt(0)?function(){console.assert('"'===e.charAt(0)),e=e.substring(1);let r="";for(;e.length;){const n=/^([^"\\]*)(.*)/.exec(e);if(!n)return null;if(r+=n[1],'"'===n[2].charAt(0))return e=n[2].substring(1),r;console.assert("\\"===n[2].charAt(0)),r+=n[2].charAt(1),e=n[2].substring(2)}return null}():t()}function o(){const r=/([,;].*)/.exec(e);r&&(e=r[1])}const a=[];let i;for(;null!==(i=t());){const r={name:i};for("="===e.charAt(0)&&this.showWarning(ls`Deprecated syntax found. Please use: <name>;dur=<duration>;desc=<description>`);n(";");){let e;if(null===(e=t()))continue;e=e.toLowerCase();const a=this.getParserForParameter(e);let i=null;if(n("=")&&(i=s(),o()),a){if(r.hasOwnProperty(e)){this.showWarning(ls`Duplicate parameter "${e}" ignored.`);continue}null===i&&this.showWarning(ls`No value found for parameter "${e}".`),a.call(this,r,i)}else this.showWarning(ls`Unrecognized parameter "${e}".`)}if(a.push(r),!n(","))break}return e.length&&this.showWarning(ls`Extraneous trailing characters.`),a}static getParserForParameter(e){switch(e){case"dur":return function(r,n){if(r.dur=0,null!==n){const t=parseFloat(n);if(isNaN(t))return void ServerTiming.showWarning(ls`Unable to parse "${e}" value "${n}".`);r.dur=t}};case"desc":return function(e,r){e.desc=r||""};default:return null}}static showWarning(e){Common.Console.Console.instance().warn(Common.UIString.UIString("ServerTiming: "+e))}}