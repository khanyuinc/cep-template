function bake(curve, data)
{
	app.beginUndoGroup('Bake ' + curve);

	var selectedProperties = app.project.activeItem.selectedProperties;

	for (var m in selectedProperties)
	{
		var prop = selectedProperties[m];

		var isPathShape = (prop.propertyValueType == PropertyValueType.SHAPE);

		if (!prop.canSetExpression || isPathShape)
			continue;

		var selectedKeys = ensureTwoKeysAreSelected(prop);

		prop.expression = '';

		switch(curve)
		{
			case 'bounce': bakeBounce(prop, selectedKeys, data); break;
			case 'elastic': bakeElastic(prop, selectedKeys, data); break;
		}
	}

	app.endUndoGroup();
}

function bakeBounce(prop, selectedKeys, data)
{
	// removeMiddleKeyFrames(prop, selectedKeys);

	var firstKey = selectedKeys[0];
	var lastKey = firstKey + 1;

	var startT = prop.keyTime(firstKey);
	var d = prop.keyTime(lastKey) - startT;
	var endT = prop.keyTime(lastKey);

	var b = prop.keyValue(firstKey);
	var c = prop.keyValue(lastKey) - b;
	var endY = prop.keyValue(lastKey);

	var peaks = data;
	var key = firstKey;

	function easeOut()
	{
		for (var i=0; i < peaks.length; i++)
		{
			var peak = peaks[i];

			var time = endT - d * peak.middle;
			var val = endY - c * peak.top;

			insertKeyframeAt(prop, time, val);
			key++;

			if (i == peaks.length - 1)
				continue;

			var time = endT - d * peak.right;
			var val = endY; 

			insertKeyframeAt(prop, time, val);
			key++;
		}


		var i = peaks.length - 1;

		for (var k=firstKey; k < key; k += 2)
		{
			var peak = peaks[i--];

			setEaseAtKey(prop, k, peak.topVelocity.speed, peak.topVelocity.influence);
			setEaseAtKey(prop, k + 1, getConfig('bounce.bake.floor.speed'), getConfig('bounce.bake.floor.influence'));
		}
	}

	easeOut();
}

function bakeElastic(prop, selectedKeys, data)
{
	var firstKey = selectedKeys[0];

	var secondKey = firstKey + 1;

	var startT = prop.keyTime(firstKey);
	var endT = prop.keyTime(secondKey);
	var d = endT - startT;

	var b = prop.keyValue(firstKey);
	var endY = prop.keyValue(secondKey);
	var c = endY - b;

	var key = firstKey;
	var last = 0;

	var points = data;

	for (var i=1; i < points.length; i++)
	{
		var point = points[i];
		var time = startT + point.time * d;

		if (i == 1)
			point.delta = 0;
		else
			point.delta = endY - prop.valueAtTime(time, true);
	}

	for (var i=1; i < points.length; i++)
	{
		var point = points[i];
		var time = startT + point.time * d;

		if (i == 1)
			prop.removeKey(secondKey);

		key = insertKeyframeAt(prop, time, c * point.value + b - point.delta);
		last = i;
	}


	for (var i=1; i < key - firstKey; i++)
	{
		var point = points[i];

		setEaseAtKey(prop, firstKey + i, point.ease.speed, point.ease.influence);
	}
}

function expression(curve, data)
{
	app.beginUndoGroup('Expression ' + curve);

	var selectedProperties = app.project.activeItem.selectedProperties;

	for (var m in selectedProperties)
	{
		var prop = selectedProperties[m];

		if (!prop.canSetExpression)
			continue;
		
		setExpression(prop, data.code);
	}

	app.endUndoGroup();
}

function setExpression(prop, code)
{
	var isPathShape = (prop.propertyValueType == PropertyValueType.SHAPE);

	prop.expression = code
		.replace('isPathShape = undefined', 'isPathShape = ' + isPathShape);
}


function runTests(layers)
{
	app.beginUndoGroup('Run Tests');

	for (var l=0; l < layers.length; l++)
	{
		var layerData = layers[l];
		var layer = getLayer(layerData.name);
		var propName = first(layerData.properties).key;

		var prop = getPropertyByName(layer, propName);

		var test = layers[l].test;

		if (test.action == 'Bake')
		{
			if (test.curve == 'bounce')
				bakeBounce(prop, test.selection, test.data);
			else
				bakeElastic(prop, test.selection, test.data);
		}
		else
		{
			setExpression(prop, test.data);			
		}
	}
	
	app.endUndoGroup();
}