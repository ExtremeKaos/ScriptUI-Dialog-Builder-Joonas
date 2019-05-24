
item.create = {
	localStorage: function( params ) {
		
		var data = local_storage.get('dialog');
		data = (data === null) ? {} : data;
		
		var itemsObjExists = data.hasOwnProperty( 'items' );
		var objectName = 'item-' + params.id;
		var itemObjExists = false;
		if ( itemsObjExists ) {
			itemObjExists = data.items.hasOwnProperty( objectName );
		}
		
		data.activeId = params.id;
		
		// Make object for the current item and fill it...
		if ( !itemObjExists ) {
			
			if ( data.items === undefined ) data.items = {};
			if ( data.items[ objectName ] === undefined ) data.items[ objectName ] = {};
			var itemData = data.items[ objectName ];
			
			// Add item id
			itemData.id = params.id;
			// Add item type
			itemData.type = params.type;
			// Add parent id
			itemData.parentId = params.parentId;
			
			// Copy style from existing element
			// SourceId is used in item duplication. If it's set, duplication is in process.
			if ( params.sourceId ) {
				itemData.style =  $.extend(true, {}, data.items[ 'item-' + params.sourceId ].style);
			}
			// Add default style
			else {
				itemData.style = item.list[ params.type.toLowerCase() ]( params ).defaultStyle;
			}
			
		}
		
		data.items[ 'item-' + params.id ]
		
		var defaultStyle = item.list[ params.type.toLowerCase() ](false).defaultStyle;
		
    // CLEANING LADY
    if ( defaultStyle.varName === undefined && data.items[ 'item-' + params.id ].style.varName !== undefined ) {
      delete data.items[ 'item-' + params.id ].style.varName;
    }
    // Adds varName to the style if it's missing
    if ( defaultStyle.varName !== undefined && data.items[ 'item-' + params.id ].style.varName === undefined ) {
      data.items[ 'item-' + params.id ].style.varName = null;
    }

    // CLEANING LADY
    if ( defaultStyle.helpTip === undefined && data.items[ 'item-' + params.id ].style.helpTip !== undefined ) {
      delete data.items[ 'item-' + params.id ].style.helpTip;
    }
    // Adds helpTip to the style if it's missing
    if ( defaultStyle.helpTip !== undefined && data.items[ 'item-' + params.id ].style.helpTip === undefined ) {
      data.items[ 'item-' + params.id ].style.helpTip = null;
    }

    // CLEANING LADY
    if ( defaultStyle.softWrap === undefined && data.items[ 'item-' + params.id ].style.softWrap !== undefined ) {
      delete data.items[ 'item-' + params.id ].style.softWrap;
    }
    // Adds softWrap to the style if it's missing
    if ( defaultStyle.softWrap !== undefined && data.items[ 'item-' + params.id ].style.softWrap === undefined ) {
      data.items[ 'item-' + params.id ].style.softWrap = true;
    }

    // CLEANING LADY
    if ( defaultStyle.typeName === undefined && data.items[ 'item-' + params.id ].style.typeName !== undefined ) {
      delete data.items[ 'item-' + params.id ].style.softWrap;
    }
    // Adds softWrap to the style if it's missing
    if ( defaultStyle.typeName !== undefined && data.items[ 'item-' + params.id ].style.typeName === undefined ) {
      data.items[ 'item-' + params.id ].style.typeName = null;
    }
		
		local_storage.set('dialog', data );
		
		// Always return style object, which is either default data or data that is saved in local storage
		return data.items[ 'item-' + params.id ].style;
		
	},
	treeView: function( params ) {
		
		var isParent = item.list[ params.type.toLowerCase() ](false).parent ? 'data-parent="true"' : '';
		var newItemHTML = $(
			'<li '+ isParent +' data-item-id="'+ params.id +'" data-item-parent-id="'+ params.parentId +'" data-item-type="'+ params.type +'" class="'+ params.type.toLowerCase() +'">' +
				'<span class="remove-item"><i class="fas fa-times"></i></span>' +
				'<span class="item-text">'+ params.type +'</span>' +
			'</li>'
		);
		
		// Special treatment for the Dialog item
		var isDialog = params.type === "Dialog";
		if ( isDialog ) {
			newItemHTML = $('<ul class="tree-dialog">'+ newItemHTML.prop('outerHTML') +'</ul>');
			newItemHTML.find('> li').addClass('tree-root');
		}
		
		// Special treatment for all parent items
		var currentTypeLowercase = params.type.toLowerCase();
		var currentItemIsParent = item.list[ currentTypeLowercase ](false).parent;
		if ( currentItemIsParent ) {
			$('<ul></ul>').insertAfter( newItemHTML.find('.item-text') );
		}
		
		// No data in ul, so gotta go a step higher to look for the data...
		var targetLi = params.target.is('ul') ? params.target.parent('li') : params.target;
		isParent = targetLi.data('parent');
		
		var onDrag = params.event.match(/^drag/);
		var method;
		
		// Append to parent items
		if ( isParent ) {
			method = onDrag ? (params.previousIsParent ? 'insertAfter' : 'prependTo') : 'appendTo';
		}
		// Insert after a non-parent item
		else {
			method = 'insertAfter';
		}
		
		$( newItemHTML )[ method ]( params.target );
		
	},
	dialogPreview: function( params ) {
		
		var newItemHTML = item.list[ params.type.toLowerCase() ]( params ).previewHtml;
		
		// No data in ul, so gotta go a step higher to look for the data...
		var targetLi    = params.target.is('ul') ? params.target.parent('li') : params.target;
		var isParent    = targetLi.data('parent');
		var targetId    = targetLi.data('item-id');
		var dialog      = $('#dialog');
		var targetElem  = dialog.find('[data-item-id="'+ targetId +'"]');
		
		var onDrag = params.event.match(/^drag/);
		var method, target;
		
		// Append to parent items
		if ( isParent ) {
			method = onDrag ? (params.previousIsParent ? 'insertAfter' : 'prependTo') : 'appendTo';
			target = (params.type === 'Dialog') ? dialog : ( onDrag && params.previousIsParent ? targetElem : targetElem.find('> .padding-box'));
		}
		// Insert after a non-parent item
		else {
			method = 'insertAfter';
			target =  dialog.find('[data-item-id="'+ targetId +'"]');
		}
		
		$( newItemHTML )[ method ]( target );
		
		var active = $('#dialog [data-item-id="'+ params.id +'"]');
		
		if ( params.type === 'DropDownList' ) {
			droplist.init( active, params.id );
		}
		else if ( params.type === 'RadioButton' || params.type === 'Checkbox' ) {
			radiocheck.init( active, params.id, params.type );
		}
		else if ( params.type === 'ListBox' ) {
			listbox.init( active, params.id );
		}
		
	}
	
};

item.get = {};

item.get.order = function() {
	
	var order = [];
	$('#panel-tree-view-wrap .contents [data-item-id]').each(function() {
		var id = $(this).data('item-id');
		order.push( id );
	});
	return order;
	
}

item.get.id = function() {
	
	var order = item.get.order();
	return Math.max.apply(null, order ) + 1
	
}
