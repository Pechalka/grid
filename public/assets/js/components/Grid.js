/**
 * @jsx React.DOM
 */

var React = require('react');
var Bootstrap = require('react-bootstrap')
	, Grid = Bootstrap.Grid
	, Row = Bootstrap.Row
	, Col = Bootstrap.Col
	, ButtonToolbar = Bootstrap.ButtonToolbar
	, DropdownButton = Bootstrap.DropdownButton
	, MenuItem = Bootstrap.MenuItem
	, ButtonGroup = Bootstrap.ButtonGroup
;



var Reflux = require('reflux');
var actions = require('../actions');
var stores = require('../stores');
var getCoords = require('../utils').getCoords;
var cx = React.addons.classSet;
var Draggable = require('../Draggable');

var _ = require('lodash');
var lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi, ut officia exercitationem magni modi magnam dolor labore iusto explicabo optio consequatur ad quo voluptatibus dolores enim, eveniet voluptatum neque perferendis?';

var r = React.DOM;
 
var ComponentIcon = React.createClass({
  	dragEnd : function(){
  		actions.drop(this.props.type);
  	},
  	drag : function(x, y){
		var el = document.elementFromPoint(x-1, y-1 );

	    if (!el) return;

		actions.hoverElement(el.id);
  	},
  	render : function(){
  		return <Draggable onEnd={this.dragEnd} onDrag={this.drag}>
  			<div className="componentIcon">{this.props.type}</div>
  		</Draggable>
  	}
})

var avatar = document.createElement("div");
avatar.id = "avatar";


function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

var dd = false,
	w,
	h
;
var Block = React.createClass({
    getInitialState: function() {
        return { 
            shiftX : 25,
            shiftY : 25,
            dragging : false
        }
    },
    onmousedown : function(e){
    	document.body.style.cursor = 'url(../build/img/closedhand.cur) 7 5, move';

        var coords = getCoords(e.target);

        this.setState({
            shiftX : e.pageX - coords.left,
            shiftY : e.pageY - coords.top ,
            dragging : true,

            startX : coords.left,
            startY : coords.top,

            left : coords.left,
            top : coords.top
        })
        document.body.addEventListener('mousemove', this.moveAt);
        document.body.addEventListener('mouseup', this.onmouseup); 
        avatar.style.left = coords.left + 'px';
        avatar.style.top = coords.top + 'px';
        avatar.style.zIndex = 99999;

      //  console.log(e.target.parentNode);

        //i => div => component
        avatar.style.width = w + 'px';
        avatar.style.height = h + 'px';
        avatar.innerHTML =  '<i class="glyphicon glyphicon-arrow-down"></>block';

        document.body.appendChild(avatar)

        actions.drag();

    },
    onmousedown2 : function(e){
    	if (e.button != 0) return;

    	actions.selectComponent(this.props.id);

    
    	var target = e.target;
    	var pageX = e.pageX;
    	var pageY = e.pageY;
    	
    	console.log(e.target);



    	dd = true;
    	w = target.parentNode.offsetWidth;
    	h = target.parentNode.offsetHeight
    	window.setTimeout(function(){
    		var selectedText = getSelectionText();
    		if (!!selectedText) dd = false;

    		if (dd)
    			this.onmousedown({ target : target, pageX : pageX,  pageY : pageY})
    	}.bind(this), 500)
    	
    },
    onMouseUp2 : function(){
    	dd = false;
    },
    onmouseup : function(e){
    	dd = false;
    	document.body.style.cursor = '';

    	document.body.removeChild(avatar);

        document.body.removeEventListener('mousemove', this.moveAt);
        document.body.removeEventListener('mouseup', this.onmouseup);

    	console.log(this.state);

		
        	
        

    	this.setState({ 
    		left : this.state.startX,
    		top : this.state.startY,
    		dragging : false 
    	})

		var cansel = (Math.abs(this.state.left - this.state.startX)<25 &&
 			       	 Math.abs(this.state.top - this.state.startY) < 25)
		if (!cansel)
        	actions.drop(this.props);
        else{
        	stores.drag.set(false)
        	stores.dragHoverElementId.set(null);
        }
        	
    },
    moveAt : function(e){
		
	 	var x = e.pageX - this.state.shiftX ;
	 	var y = e.pageY - this.state.shiftY;
		
		this.setState({
			left : x,
			top : y
		})

		//move avatar
	  	avatar.style.left = x + 'px';
        avatar.style.top = y +'px';
	 	
	 	var el = document.elementFromPoint(x - 1, y - 1);

	   window.console.log(el);

	   	if (!el) return;

	   actions.hoverElement(el.id);

    },
    none : function(e){ return false; },
    align : function(value){
    	if (value == "level-reduce" || value == "level-increase"){
	    	var delte = value == "level-reduce" ? -1 : 1;

	    	var data = {
	        	row_id : this.props.row_id,
	        	col_id : this.props.col_id,
	        	id : this.props.id,
	        	level : (this.props.level || 1) + delte
	        }
	    	actions.updateComponent(data);	
    	} else {
	    	var data = {
	        	row_id : this.props.row_id,
	        	col_id : this.props.col_id,
	        	id : this.props.id,
	        	style : { 'text-align' : value },
	        	align : value
	        }
	    	actions.updateComponent(data);	
    	}
    	return false;
    },
    effect : function(value){
    	var data = {
	        	row_id : this.props.row_id,
	        	col_id : this.props.col_id,
	        	id : this.props.id,
	        	effect : value
	        }
	    actions.updateComponent(data);
	    return false;	
    },
    remove : function(){
    	actions.removeComponent(this.props)
    	return false;
    },
    renderAvatar : function(){
    	var el = this.getDOMNode();
    	var style = {
    		width : el.offsetWidth,
    		height : el.offsetHeight
    	}

    	return <div style={style} ><i className="glyphicon glyphicon-arrow-down"></i>block</div>;
    },
    dragEnd : function(e, left, top){
  		//actions.drop(this.props.type);
  		var cansel = (Math.abs(left - this.state.startX)<25 &&
 			       	 Math.abs(top - this.state.startY) < 25)
		if (!cansel)
        	actions.drop(this.props);
        else{
        	stores.drag.set(false)
        	stores.dragHoverElementId.set(null);
        }
  	},
  	drag : function(x, y){
		var el = document.elementFromPoint(x-1, y-1 );

	    if (!el) return;

		//actions.hoverElement(el.id);
  	},
    render : function(){
    	var style = {
	         display : this.state.dragging ? 'none' : 'block',// hide component, move block avatar
	    }
	    if (this.props.componentClass === "Image" && (this.props.align == "left" || this.props.align == "right")){
	    	style = {
	    		float : this.props.align,
	    		clear : this.props.align,
	    		zIndex : 2000
	    	}

	    }

	    var size = null;
	    if (this.props.componentClass === "Title" ){
	    	var level = this.props.level || 1;

	    	size = [
		    	<button disabled={level <= 1  ? "disabled" : ""} onClick={this.align.bind(this, "level-reduce")} type="button" className="btn btn-default btn-xs"><span className="glyphicon glyphicon-plus"></span></button>,
		    	<button disabled={level >= 6 ? "disabled" : ""} onClick={this.align.bind(this, "level-increase")} type="button" className="btn btn-default btn-xs"><span className="glyphicon glyphicon-minus"></span></button>	
		    ] 
	    }  

	    var self = this;
	    var align = this.props.align || 'center';
	    var effect = this.props.effect || 'none';
	    var calculateBtnClass = function(v, a){
		    return cx({
		    	'active' : v == a ? 'active' : '',
		    	'btn' : true,
		    	'btn-default' : true,
		    	'btn-xs' : true
		    })	
	    }
	    
		var shape = this.props.componentClass === "Image" ? <DropdownButton bsSize="xsmall" title="shape">
			          <MenuItem onSelect={this.effect.bind(this, "none")} eventKey="1" >none</MenuItem>
			          <MenuItem  divider />
			          <MenuItem onSelect={this.effect.bind(this, "circle")} eventKey="2" active="true" eventKey="2">circle</MenuItem>
			          <MenuItem divider />
			          <MenuItem onSelect={this.effect.bind(this, "rounded")}  eventKey="3">rounded</MenuItem>
			          <MenuItem divider />
			          <MenuItem onSelect={this.effect.bind(this, "thumbnail")}  eventKey="4">thumbnail</MenuItem>
			        </DropdownButton> : null;

	    var toolbar = <ButtonGroup >
			        <div className="btn-group toolbar">
					    <button onClick={this.align.bind(this, "left")} type="button" className={calculateBtnClass(align, 'left')}><span className="glyphicon glyphicon-align-left"></span></button>
					    <button onClick={this.align.bind(this, "center")} type="button" className={calculateBtnClass(align, 'center')}><span className="glyphicon glyphicon-align-center"></span></button>
					    <button onClick={this.align.bind(this, "right")} type="button" className={calculateBtnClass(align, 'right')}><span className="glyphicon glyphicon-align-right"></span></button>
					    <button onClick={this.align.bind(this, "justify")} type="button" className={calculateBtnClass(align, 'justify')}><span className="glyphicon glyphicon-align-justify"></span></button>
						{size}
					</div>
			        {shape}
			     </ButtonGroup>
			       
		var removeBtn = <div onClick={this.remove} className="handler right">
            	<i className="glyphicon glyphicon-remove"></i>
            </div>
		


		// style={style}
  //           className={this.props.css} 
  //           onClick={this.blockClick} 
  //           onMouseDown={this.onmousedown2} 
  //           onMouseUp={this.onMouseUp2}

    	return <Draggable avatar={this.renderAvatar}> 
    		<div 
	    		style={style} 	
	    		className={this.props.css} 
        	>
			{toolbar} {removeBtn}
			{this.props.children}
		</div>
		</Draggable>
    }
})

var c = {};

c['Title'] = React.createClass({
	mixins : [
		Reflux.connect(stores.drag, "drag")
	],
	getInitialState: function() {
		return {
			drag : false
		};
	},
	emitChange : function(){
		
		var props = this.props;
		props.text = this.getDOMNode().innerHTML;
		actions.updateComponent(props);
	},
	render : function(){
		var level = this.props.level || 1;
		var text = this.props.text || 'Title';
		var align = this.props.align || 'center';
		var Title = React.DOM['h' + level];
		return this.transferPropsTo(Title({ 
			onBlur : this.emitChange, 
			onInput : this.emitChange, 
			onChange : this.emitChange,
			contentEditable : !this.state.drag && !this.props.preview, 
			id : this.props.id ,
			onDragStart : this.none,
			draggable : false,
			style : {
				'text-align' : align
			}
		}, text));
	}
})

c['Image'] = React.createClass({
	none : function(e){ return false; },
	render : function(){
		var src = this.props.src || 'http://placehold.it/200x200';
		var align = this.props.align || "center";
		var effect = this.props.effect;

		var style = {}

		if (align == "center"){
			style = {
				margin : '0 auto'
			}
		}
		if (align == "left"){
			style = {
				float : 'left',
				clear : 'left'
			}
		}
		if (align == "right"){
			style = {
				float : 'right',
				clear : 'right'
			}
		}
		if (align == "justify"){
			style = {
				width : '100%'
			}
		}
		var css = cx({
			'img-responsive' : true,
			'img-rounded' : effect == "rounded",
			'img-circle' : effect == "circle",
			'img-thumbnail' : effect == "thumbnail"
		})
		return this.transferPropsTo(<img onDragStart={this.none} style={style} className={css} src={src}/>)
	}
})


c['Text'] = React.createClass({
	mixins : [
		Reflux.connect(stores.drag, "drag")
	],
	getInitialState: function() {
		return {
			drag : false
		};
	},
	emitChange : function(){
		var props = this.props;
		props.text = this.getDOMNode().innerHTML;
		actions.updateComponent(props);
	},
	render : function(){
		var text = this.props.text || lorem;
		

		return this.transferPropsTo(<p draggable={false} onDragStart={none} onBlur={this.emitChange} 
			onInput={this.emitChange}  contentEditable={!this.state.drag && !this.props.preview} id={this.props.id} >{text}</p>);
	}
})
var none = function(e){ return false; }

var getCelsWidth = function(rowNode){
	var widths = [];
    _.each(rowNode.childNodes, function(cellNode){
    	widths.push(cellNode.offsetWidth);
    })
    return widths;
}

var rowNode;
var Delemitor = React.createClass({
    onmousedown : function(e){
    	var target = e.target;

    	if (target && target){
    	    rowNode = target.parentNode.parentNode; //save current row
	    } 
    },
    onmouseup : function(e, newLeft){
    	if (newLeft){
	        var data = {
	        	cellIndex : this.props.index,
	        	row_id : this.props.row_id,
	        	newLeft : newLeft,
	        	widths : getCelsWidth(rowNode)
	        }
        	actions.recalculateCells(data);
		}
	},
    doubleClick : function(){
        var data = {
        	cellIndex : this.props.index,
        	row_id : this.props.row_id,
        	col_id : this.props.col_id,
        	widths : getCelsWidth(rowNode)
        }

    	actions.removeCell(data);

    	return false;
    },
 	render : function(){
 		return <Draggable axis="y" 
	 		mode="relative" 
	 		onEnd={this.onmouseup}
			onStart={this.onmousedown}>
 			<div onDoubleClick={this.doubleClick} className="delemitor"></div>
 		</Draggable>
 	}
});


var Page = React.createClass({
	mixins : [
		Reflux.connect(stores.dragHoverElementId, "dragHoverElementId"),
		Reflux.connect(stores.selectedElementId, "selectedElementId"),
		Reflux.connect(stores.rows, "rows")
	],
	getInitialState: function() {
		return {
			dragHoverElementId : null,
			selectedElementId : null,
			rows : []
		};
	},
	render: function() {
		var dragHoverElementId = this.state.dragHoverElementId;
		var selectedElementId = this.state.selectedElementId;
		var preview = this.props.preview;

		var rows = this.state.rows.map(function(row){
			var row_id = row.id;
			var cols = row.content.map(function(col, i){
				var cellClasses = cx({ 'hover' : dragHoverElementId == col.id  });
				var components = col.content.map(function(component){
					var componentClasses = cx({ 
						'hover' : dragHoverElementId == component.id ,
						'component' : true ,
						'selected' : selectedElementId == component.id
					});

					var props = component.props;
					props.id = component.id;
					props.col_id = col.id;
					props.row_id = row_id;
					props.css = componentClasses;
					props.componentClass = component.componentClass;
					props.preview = preview;

					var element = c[component.componentClass](props);
					var blockWithElement = Block(props, element);

					return !this.props.preview ? blockWithElement : element;

				}.bind(this)) 

				var delemitor = !this.props.preview 
									? <Delemitor index={i} row_id={row_id} col_id={col.id} />
									: null;

				return <Col className={cellClasses} id={col.id} xs={col.props.xs}>
					{delemitor}{components}
				</Col>
			}.bind(this))
			return <Row>
				{cols}	
			</Row>
		}.bind(this))
		var addClassName = cx({
			'hover' : dragHoverElementId == 'add-row',
			'new-row' : true
		})

		//preview
		var addRow = !this.props.preview ?
					<Row className={addClassName} >
						<Col id={'add-row'} xs={12}>new row</Col>	
					</Row> : null;
		
		var ruler = !this.props.preview ?					
						<Row className="ruler">
							<Col xs={1}></Col>
							<Col xs={1}></Col>
							<Col xs={1}></Col>
							<Col xs={1}></Col>
							<Col xs={1}></Col>
							<Col xs={1}></Col>
							<Col xs={1}></Col>
							<Col xs={1}></Col>
							<Col xs={1}></Col>
							<Col xs={1}></Col>
							<Col xs={1}></Col>
							<Col xs={1}></Col>
						</Row> : null;

		return <Grid  fluid={true} className={ !this.props.preview ? 'page text-center' : null }>
			{ruler}
			{rows}
			{addRow}
		</Grid>
	}

});

var App = React.createClass({
	getInitialState: function() {
		return {
			preview : false 
		};
	},
	preview : function(){
		this.setState({ preview : true })
		return false;
	},
	backToConstructor : function(){
		this.setState({ preview : false })
		return false;	
	},
	render: function() {
		var btn = !this.state.preview 
						? <a className="btn btn-success" onClick={this.preview}><i className="glyphicon glyphicon-fullscreen"></i> Preview</a>
						: <a className="btn btn-default" onClick={this.backToConstructor}><i className="glyphicon glyphicon-cog"></i> Back to constructor</a>
			
		var componentsPanel = !this.state.preview
						? 	<Col xs={2} style={{ position : 'static'}}>
								<h4>Blocks</h4>
								<ComponentIcon type="Title"/>
								<ComponentIcon type="Text"/>
								<ComponentIcon type="Image"/>
							</Col>
						: null;



		return (<div>
			<Grid  fluid={true}>
				<Row className="well">
					<Col xs={12}>{btn}</Col>
				</Row>								
				<Row>
					{componentsPanel}
					<Col xs={ !this.state.preview ? 10 : 12 }>
						<Page preview={this.state.preview}/>
					</Col>
				</Row>
			</Grid>

		</div>);
	}

});

module.exports = App;