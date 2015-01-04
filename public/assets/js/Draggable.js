var React = require('react'),
	utils = require('./utils'),
	removeClass = utils.removeClass,
	addClass = utils.addClass, 
	getCoords = utils.getCoords
;

var none = function(e){ return false; }
var avatar = document.createElement("div");
avatar.id = "avatar";

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
				axis : 'both'		
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

		},
		mouseup : function(e){
			document.removeEventListener('mousemove', this.moveAt);
			document.removeEventListener('mouseup', this.mouseup);
			removeClass('drag', document.body);
			
			
			if (this.props.avatar){
				React.unmountComponentAtNode(this.props.avatar(), avatar)
				document.body.removeChild(avatar);
	    	}

			this.setState({
				drag : false 
			})

			if (this.props.onEnd)
				this.props.onEnd(e, this.state.left, this.state.top)
		},
		mousedown : function(e){
			if (e.button != 0) return;

			document.addEventListener('mousemove', this.moveAt);
			document.addEventListener('mouseup', this.mouseup);
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

		        // avatar.style.width =  '200px';
		        // avatar.style.height =  '200px';
//		        avatar.innerHTML =  '<i class="glyphicon glyphicon-arrow-down"></>block';

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
	            paretnTop : parentCoords.top
			})

			if (this.props.onStart)
				this.props.onStart(e)
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
				top : drag && this.canDragX() ? this.state.top : '',
				zIndex : 3000
			}
			return React.addons.cloneWithProps(React.Children.only(this.props.children), {
				onMouseDown : this.mousedown,
				onDragStart : none,
				style : style
			});
		}
	});


