/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/core/format/DateFormat','sap/ui/model/FilterType','sap/ui/model/ListBinding','sap/ui/model/odata/ODataUtils','sap/ui/model/odata/CountMode','sap/ui/model/odata/OperationMode','sap/ui/model/ChangeReason','sap/ui/model/Filter','sap/ui/model/FilterProcessor','sap/ui/model/SorterProcessor'],function(q,D,F,L,O,C,a,b,c,d,S){"use strict";var e=L.extend("sap.ui.model.odata.v2.ODataListBinding",{constructor:function(m,p,o,s,f,P){L.apply(this,arguments);this.sFilterParams=null;this.sSortParams=null;this.sRangeParams=null;this.sCustomParams=this.oModel.createCustomParams(this.mParameters);this.iStartIndex=0;this.iLength=0;this.bPendingChange=false;this.aAllKeys=null;this.aKeys=[];this.sCountMode=(P&&P.countMode)||this.oModel.sDefaultCountMode;this.sOperationMode=(P&&P.operationMode)||this.oModel.sDefaultOperationMode;this.bRefresh=false;this.bNeedsUpdate=false;this.bDataAvailable=false;this.bIgnoreSuspend=false;this.sBatchGroupId=undefined;this.bLengthRequestd=false;this.bUseExtendedChangeDetection=true;this.bFaultTolerant=P&&P.faultTolerant;this.bLengthFinal=false;this.iLastEndIndex=0;this.aLastContexts=null;this.oLastContextData=null;this.bInitial=true;this.mRequestHandles={};if(P&&P.batchGroupId){this.sBatchGroupId=P.batchGroupId;}var r=this.oModel._getObject(this.sPath,this.oContext);this.aExpandRefs=r;if(q.isArray(r)&&!s&&!f){this.aKeys=r;this.iLength=r.length;this.bLengthFinal=true;this.bDataAvailable=true;}else if(r===null&&this.oModel.resolve(this.sPath,this.oContext)){this.aKeys=[];this.iLength=0;this.bLengthFinal=true;this.bDataAvailable=true;}else{this.resetData();}},metadata:{publicMethods:["getLength"]}});e.prototype.getContexts=function(s,l,t){if(this.bInitial){return[];}if(!this.bLengthFinal&&!this.bPendingRequest&&!this.bLengthRequestd){this._getLength();this.bLengthRequestd=true;}this.iLastLength=l;this.iLastStartIndex=s;this.iLastThreshold=t;if(!s){s=0;}if(!l){l=this.oModel.iSizeLimit;if(this.bLengthFinal&&this.iLength<l){l=this.iLength;}}if(!t){t=0;}var f=true,g=this._getContexts(s,l),o={},h;if(this.sOperationMode==a.Server){h=this.calculateSection(s,l,t,g);f=g.length!==l&&!(this.bLengthFinal&&g.length>=this.iLength-s);if(this.oModel.getServiceMetadata()){if(!this.bPendingRequest&&h.length>0&&(f||l<h.length)){this.loadData(h.startIndex,h.length);g.dataRequested=true;}}}else if(this.sOperationMode==a.Client){if(!this.aAllKeys){this.loadData();g.dataRequested=true;}}if(this.bRefresh){if(this.bLengthFinal&&this.iLength===0){this.loadData(h.startIndex,h.length,true);g.dataRequested=true;}this.bRefresh=false;}else{for(var i=0;i<g.length;i++){o[g[i].getPath()]=g[i].getObject();}if(this.bUseExtendedChangeDetection){if(this.aLastContexts&&s<this.iLastEndIndex){var j=this;var k=q.sap.arrayDiff(this.aLastContexts,g,function(m,n){return q.sap.equal(m&&j.oLastContextData&&j.oLastContextData[m.getPath()],n&&o&&o[n.getPath()]);},true);g.diff=k;}}this.iLastEndIndex=s+l;this.aLastContexts=g.slice(0);this.oLastContextData=q.sap.extend(true,{},o);}return g;};e.prototype._getContexts=function(s,l){var f=[],o,k;if(!s){s=0;}if(!l){l=this.oModel.iSizeLimit;if(this.bLengthFinal&&this.iLength<l){l=this.iLength;}}for(var i=s;i<s+l;i++){k=this.aKeys[i];if(!k){break;}o=this.oModel.getContext('/'+k);f.push(o);}return f;};e.prototype.calculateSection=function(s,l,t,f){var g,h,p,P,r,o={},k;h=s;g=0;for(var i=s;i>=Math.max(s-t,0);i--){k=this.aKeys[i];if(!k){P=i+1;break;}}for(var j=s+l;j<s+l+t;j++){k=this.aKeys[j];if(!k){p=j;break;}}r=s-P;if(P&&s>t&&r<t){if(f.length!==l){h=s-t;}else{h=P-t;}g=t;}if(h===s){h+=f.length;}if(f.length!==l){g+=l-f.length;}r=p-s-l;if(r===0){g+=t;}if(p&&r<t&&r>0){if(h>s){h=p;g+=t;}}if(this.bLengthFinal&&this.iLength<(g+h)){g=this.iLength-h;}o.startIndex=h;o.length=g;return o;};e.prototype.setContext=function(o){if(this.oContext!==o){this.oContext=o;if(this.isRelative()){this._initSortersFilters();if(!this.bInitial){var r=this.oModel._getObject(this.sPath,this.oContext);this.aExpandRefs=r;if(q.isArray(r)&&!this.aSorters.length>0&&!this.aFilters.length>0){this.aKeys=r;this.iLength=r.length;this.bLengthFinal=true;this._fireChange();}else if(!this.oModel.resolve(this.sPath,this.oContext)||r===null){this.aKeys=[];this.iLength=0;this.bLengthFinal=true;this._fireChange();}else{this.refresh();}}}}};e.prototype.loadData=function(s,l,p){var t=this,I=false;if(s||l){this.sRangeParams="$skip="+s+"&$top="+l;this.iStartIndex=s;}else{s=this.iStartIndex;}var P=[];if(this.sRangeParams){P.push(this.sRangeParams);}if(this.sSortParams){P.push(this.sSortParams);}if(this.sFilterParams){P.push(this.sFilterParams);}if(this.sCustomParams){P.push(this.sCustomParams);}if(this.sCountMode==C.InlineRepeat||!this.bLengthFinal&&(this.sCountMode===C.Inline||this.sCountMode===C.Both)){P.push("$inlinecount=allpages");I=true;}function f(h){q.each(h.results,function(i,j){t.aKeys[s+i]=t.oModel._getKey(j);});if(I&&h.__count){t.iLength=parseInt(h.__count,10);if(t.sCountMode!=C.InlineRepeat){t.bLengthFinal=true;}}if(t.iLength<s+h.results.length){t.iLength=s+h.results.length;t.bLengthFinal=false;}if(!h.__next&&(h.results.length<l||l===undefined)){t.iLength=s+h.results.length;t.bLengthFinal=true;}if(t.bFaultTolerant&&h.__next&&h.results.length==0){t.iLength=s;t.bLengthFinal=true;}if(s===0&&h.results.length===0){t.iLength=0;t.bLengthFinal=true;}if(t.sOperationMode==a.Client){t.aAllKeys=t.aKeys.slice();t.applyFilter();t.applySort();t.iLength=t.aKeys.length;t.bLengthFinal=true;}delete t.mRequestHandles[g];t.bPendingRequest=false;t.bNeedsUpdate=true;t.bIgnoreSuspend=true;t.oModel.callAfterUpdate(function(){t.fireDataReceived({data:h});});}function E(h,A){delete t.mRequestHandles[g];t.bPendingRequest=false;if(t.bFaultTolerant){t.iLength=t.aKeys.length;t.bLengthFinal=true;t.bDataAvailable=true;}else if(!A){t.aKeys=[];t.iLength=0;t.bLengthFinal=true;t.bDataAvailable=true;t._fireChange({reason:b.Change});}t.fireDataReceived();}var g=this.sPath,o=this.oContext;if(this.isRelative()){g=this.oModel.resolve(g,o);}if(g){if(p){var u=this.oModel._createRequestUrl(g,P);this.fireDataRequested();this.oModel.fireRequestSent({url:u,method:"GET",async:true});setTimeout(function(){t.bNeedsUpdate=true;t.checkUpdate();t.oModel.fireRequestCompleted({url:u,method:"GET",async:true,success:true});t.fireDataReceived();},0);}else{this.bPendingRequest=true;this.fireDataRequested();this.mRequestHandles[g]=this.oModel.read(g,{batchGroupId:this.sBatchGroupId,urlParameters:P,success:f,error:E});}}};e.prototype.isLengthFinal=function(){return this.bLengthFinal;};e.prototype.getLength=function(){if(this.bLengthFinal||this.iLength==0){return this.iLength;}else{var A=this.iLastThreshold||this.iLastLength||10;return this.iLength+A;}};e.prototype._getLength=function(){var t=this;if(this.sCountMode!==C.Request&&this.sCountMode!==C.Both){return;}var p=[];if(this.sFilterParams){p.push(this.sFilterParams);}if(this.mParameters&&this.mParameters.custom){var o={custom:{}};q.each(this.mParameters.custom,function(s,v){o.custom[s]=v;});p.push(this.oModel.createCustomParams(o));}function _(g){t.iLength=parseInt(g,10);t.bLengthFinal=true;t.bLengthRequestd=true;delete t.mRequestHandles[P];}function f(E){delete t.mRequestHandles[P];var s="Request for $count failed: "+E.message;if(E.response){s+=", "+E.response.statusCode+", "+E.response.statusText+", "+E.response.body;}q.sap.log.warning(s);}var P=this.oModel.resolve(this.sPath,this.oContext);if(P){P=P+"/$count";this.mRequestHandles[P]=this.oModel.read(P,{withCredentials:this.oModel.bWithCredentials,batchGroupId:this.sBatchGroupId,urlParameters:p,success:_,error:f});}};e.prototype.refresh=function(f,m,E){var g=false;if(!f){if(E){var r=this.oModel.resolve(this.sPath,this.oContext);if(r){var o=this.oModel.oMetadata._getEntityTypeByPath(r);if(o&&(o.entityType in E)){g=true;}}}if(m&&!g){q.each(this.aKeys,function(i,k){if(k in m){g=true;return false;}});}if(!m&&!E){g=true;}}if(f||g){this.abortPendingRequest();this.resetData();this._fireRefresh({reason:sap.ui.model.ChangeReason.Refresh});}};e.prototype._fireRefresh=function(p){if(this.oModel.resolve(this.sPath,this.oContext)){this.bRefresh=true;this.fireEvent("refresh",p);}};e.prototype.initialize=function(){if(this.oModel.oMetadata&&this.oModel.oMetadata.isLoaded()){this.bInitial=false;this._initSortersFilters();if(this.bDataAvailable){this._fireChange({reason:b.Change});}else{this._fireRefresh({reason:b.Refresh});}}return this;};e.prototype.checkUpdate=function(f,m){var g=this.sChangeReason?this.sChangeReason:b.Change,h=false,l,o,t=this,r,R;if(this.bSuspended&&!this.bIgnoreSuspend){return false;}if(!f&&!this.bNeedsUpdate){r=this.oModel._getObject(this.sPath,this.oContext);R=q.isArray(r)&&!q.sap.equal(r,this.aExpandRefs);this.aExpandRefs=r;if(R){if(this.aSorters.length>0||this.aFilters.length>0){this.refresh();return false;}else{this.aKeys=r;this.iLength=r.length;this.bLengthFinal=true;h=true;}}else if(m){q.each(this.aKeys,function(i,k){if(k in m){h=true;return false;}});}else{h=true;}if(h&&this.aLastContexts){h=false;var j=this._getContexts(this.iLastStartIndex,this.iLastLength,this.iLastThreshold);if(this.aLastContexts.length!==j.length){h=true;}else{q.each(this.aLastContexts,function(i,k){l=t.oLastContextData[k.getPath()];o=j[i].getObject();if(!q.sap.equal(l,o,3,true)){h=true;return false;}});}}}if(f||h||this.bNeedsUpdate){this.bNeedsUpdate=false;this._fireChange({reason:g});}this.sChangeReason=undefined;this.bIgnoreSuspend=false;};e.prototype.resetData=function(){this.aKeys=[];this.iLength=0;this.bLengthFinal=false;this.sChangeReason=undefined;this.bDataAvailable=false;this.bLengthRequestd=false;};e.prototype.abortPendingRequest=function(){if(!q.isEmptyObject(this.mRequestHandles)){q.each(this.mRequestHandles,function(p,r){r.abort();});this.mRequestHandles={};this.bPendingRequest=false;}};e.prototype.getDownloadUrl=function(f){var p=[],P;if(f){p.push("$format="+encodeURIComponent(f));}if(this.sSortParams){p.push(this.sSortParams);}if(this.sFilterParams){p.push(this.sFilterParams);}if(this.sCustomParams){p.push(this.sCustomParams);}P=this.oModel.resolve(this.sPath,this.oContext);if(P){return this.oModel._createRequestUrl(P,null,p);}};e.prototype.sort=function(s,r){var f=false;if(s instanceof sap.ui.model.Sorter){s=[s];}this.aSorters=s;if(this.sOperationMode==a.Server){this.createSortParams(s);}if(!this.bInitial){if(this.sOperationMode==a.Server){this.aKeys=[];this.abortPendingRequest();this.sChangeReason=b.Sort;this._fireRefresh({reason:this.sChangeReason});this._fireSort({sorter:s});f=true;}else if(this.sOperationMode==a.Client){this.applySort();this._fireChange({reason:b.Sort});}}if(r){return f;}else{return this;}};e.prototype.applySort=function(){var t=this,o;this.aKeys=S.apply(this.aKeys,this.aSorters,function(r,p){o=t.oModel.getContext('/'+r);return t.oModel.getProperty(p,o);});};e.prototype.createSortParams=function(s){this.sSortParams=O.createSortParams(s);};e.prototype.filter=function(f,s,r){var g=false;if(!f){f=[];}if(f instanceof sap.ui.model.Filter){f=[f];}if(s===F.Application){this.aApplicationFilters=f;}else{this.aFilters=f;}f=this.aFilters.concat(this.aApplicationFilters);if(!f||!q.isArray(f)||f.length===0){this.aFilters=[];this.aApplicationFilters=[];}if(this.sOperationMode==a.Server){this.createFilterParams(f);}if(!this.bInitial){if(this.sOperationMode==a.Server){this.resetData();this.abortPendingRequest();this.sChangeReason=b.Filter;this._fireRefresh({reason:this.sChangeReason});if(s===F.Application){this._fireFilter({filters:this.aApplicationFilters});}else{this._fireFilter({filters:this.aFilters});}g=true;}else if(this.sOperationMode==a.Client){this.applyFilter();this.applySort();this._fireChange({reason:b.Filter});}}if(r){return g;}else{return this;}};e.prototype.applyFilter=function(){var t=this,o,f=this.aFilters.concat(this.aApplicationFilters),g=[];q.each(f,function(i,h){if(h instanceof sap.ui.model.odata.Filter){g.push(h.convert());}else{g.push(h);}});this.aKeys=d.apply(this.aAllKeys,g,function(r,p){o=t.oModel.getContext('/'+r);return t.oModel.getProperty(p,o);});this.iLength=this.aKeys.length;};e.prototype.createFilterParams=function(f){this.sFilterParams=O.createFilterParams(f,this.oModel.oMetadata,this.oEntityType);};e.prototype._initSortersFilters=function(){var r=this.oModel.resolve(this.sPath,this.oContext);if(!r){return;}this.oEntityType=this._getEntityType();if(this.sOperationMode==a.Server){this.createSortParams(this.aSorters);this.createFilterParams(this.aFilters.concat(this.aApplicationFilters));}};e.prototype._getEntityType=function(){var r=this.oModel.resolve(this.sPath,this.oContext);if(r){var E=this.oModel.oMetadata._getEntityTypeByPath(r);return E;}return undefined;};e.prototype.resume=function(){this.bIgnoreSuspend=false;L.prototype.resume.apply(this,arguments);};return e;},true);