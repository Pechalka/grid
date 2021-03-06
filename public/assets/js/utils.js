var $ = require('jquery');

$.ajaxSetup({ cache: false });


var http = {
	get : function(url, q){
		return $.get(url, q);
	},
	post : function(url, data){
		return $.post(url, data)
	},
	del : function(url){
		return $.ajax({
			url : url,
			type : 'DELETE'
		})
	},
	put : function(url ,data){
		return $.ajax({
				url : url,
				type : 'PUT',
				contentType:"application/json",
				data : JSON.stringify(data)
			})
	}
}

var Reflux = require('reflux');
var _ = require('lodash');

var CollectionStore = function(defautlValue){
	var _collection = defautlValue === undefined ? [] : defautlValue;
	var store = Reflux.createStore({
		getDefaultData : function(){
			return _collection;
		},
		get : function(){
			return _collection;
		},
		set : function(collection){
			_collection = collection;
			store.trigger(_collection);
			return _collection;
		},
		remove : function(obj){
			_collection = _.reject(_collection, { id : obj.id })
			store.trigger(_collection);
		},
		add : function(obj){
			_collection.push(obj);
			store.trigger(_collection);
			return obj;
		},
		update : function(obj){
			var index = _.findIndex(_collection, {
                id : obj.id
            });
            _collection[index] = obj;
            store.trigger(_collection);
            return obj;
		}
	});
	return store;
}

var ObjectStore = function(defautlValue){
	var _obj = defautlValue === undefined ? {} : defautlValue;

	var store = Reflux.createStore({
		getDefaultData : function(){
			return _obj;
		},
		set : function(obj){
			_obj = obj;
			store.trigger(_obj);
		},
		get : function(){
			return _obj;
		}
	})
	return store;
}

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();


var getCoords = function(elem) {
    // (1)
    var box = elem.getBoundingClientRect();
    
    var body = document.body;
    var docEl = document.documentElement;
    
    // (2)
    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
    
    // (3)
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;
    
    // (4)
    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    
    // (5)
    return { top: Math.round(top), left: Math.round(left) };
}

function addClass( classname, element ) {
    var cn = element.className;
    //test for existance
    if( cn.indexOf( classname ) != -1 ) {
        return;
    }
    //add a space if the element already has class
    if( cn != '' ) {
        classname = ' '+classname;
    }
    element.className = cn+classname;
}

function removeClass( classname, element ) {
    var cn = element.className;
    var rxp = new RegExp( "\\s?\\b"+classname+"\\b", "g" );
    cn = cn.replace( rxp, '' );
    element.className = cn;
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}


module.exports = {
	http : http,
	CollectionStore : CollectionStore,
	ObjectStore : ObjectStore,
	guid : guid,
	getCoords : getCoords,
	addClass : addClass,
	removeClass : removeClass,
	getSelectionText : getSelectionText
}