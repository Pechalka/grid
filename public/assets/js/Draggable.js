var React = require('react'),
	utils = require('./utils'),
	removeClass = utils.removeClass,
	addClass = utils.addClass, 
	getCoords = utils.getCoords
;

var none = function(e){ return false; }
var avatar = document.createElement("div");
avatar.id = "avatar";

var dragComponent = false;
var dndStart = false;

module.exports =  React.createClass({
		getInitialState: function() {
			return {
				drag : false  ,
				x : 0,
				y : 0
			};
		},
		getDefaultProps : function(){
			return {
				axis : 'both',
				delay : 500		
			}
		},
		moveAt : function(e){
			var x = e.pageX - this.state.shiftX ;
	 		var y = e.pageY - this.state.shiftY ;

	 		this.setState({
	            left : x - (this.props.mode=="relative" ? this.state.parentLeft : 0),
	            top : y - (this.props.mode=="relative" ? this.state.parentTop : 0)
	        })

	        if (this.props.onDrag)
	        	this.props.onDrag(x, y)

	        if (this.props.avatar){
		        avatar.style.left = x + 'px';
	        	avatar.style.top = y +'px';
        	}

        	if (this.props.onDrag)
				this.props.onDrag(e, x, y);
		},
		mouseup : function(e){
			dragComponent = false;

			document.removeEventListener('mouseup', this.mouseup);
			
			if (dndStart){
				dndStart = false;
				document.removeEventListener('mousemove', this.moveAt);
				removeClass('drag', document.body);
				
				
				if (this.props.avatar){
					React.unmountComponentAtNode(this.props.avatar(), avatar)
					document.body.removeChild(avatar);
		    	}

				this.setState({
					drag : false 
				})

				if (this.props.onEnd)
					this.props.onEnd(e, this.state.left, this.state.top, this.state.startX, this.state.startY)	 
			}
		},
		mousedown : function(e){
			if (e.button != 0) return;

			if (this.props.onMouseDown){
				this.props.onMouseDown(e)
			}


			dragComponent = true;
    
	    	var target = e.target;
	    	var pageX = e.pageX;
	    	var pageY = e.pageY;
	    	
	    	//console.log(target);

	    	document.addEventListener('mouseup', this.mouseup);

			window.setTimeout(function(){
				var dndProgress;
				if (this.props.onStart){
					dndProgress = this.props.onStart(e)
				}
				if (dndProgress === false) return;

				if (!dragComponent) return;
				
				this._mousedown({ target : target, pageX : pageX,  pageY : pageY})
			
			}.bind(this), this.props.delay);
		},
		_mousedown : function(e){
			dndStart = true;

			document.addEventListener('mousemove', this.moveAt);
			
			addClass('drag', document.body);
			
			var coords = getCoords(e.target),
				shiftX = e.pageX - coords.left,
	            shiftY = e.pageY - coords.top
			;

			var parentCoords = getCoords(e.target.parentNode);


			var s = window.getComputedStyle(e.target);
			var marginLeft = parseInt(s.getPropertyValue('margin-left'));
			var marginTop = parseInt(s.getPropertyValue('margin-top'));


			if (this.props.avatar){
				avatar.style.left = coords.left + 'px';
		        avatar.style.top = coords.top + 'px';
		        avatar.style.zIndex = 99999;

		       	React.renderComponent(this.props.avatar(), avatar);
		        document.body.appendChild(avatar)
	    	}
			
			this.setState({
				drag : true ,
				shiftX : shiftX + marginLeft ,
	            shiftY : shiftY + marginTop,

	            left : coords.left - marginLeft - (this.props.mode=="relative" ? parentCoords.left : 0),
	            top : coords.top - marginTop - (this.props.mode=="relative" ? parentCoords.top : 0),

	            parentLeft : parentCoords.left,
	            paretnTop : parentCoords.top,

	            startX : coords.left,
    	        startY : coords.top
			})
		},
		canDragY : function(){
			return this.props.axis === 'y' || 
				   this.props.axis === "both";
		},
		canDragX : function(){
			return this.props.axis === 'x' || 
				   this.props.axis === "both";
		},
		render: function() {
			var drag = this.state.drag;
			var avatarMode = !!this.props.avatar;
			var style = {
				display : drag && avatarMode ? 'none' : '',
				position : drag && !avatarMode ? 'absolute' : '',
				left : drag && this.canDragY() ? this.state.left : '',
				top : drag && this.canDragX() ? this.state.top : ''
			}
			return React.addons.cloneWithProps(React.Children.only(this.props.children), {
				onMouseDown : this.mousedown,
				onDragStart : none,
				style : style
			});
		}
	});


