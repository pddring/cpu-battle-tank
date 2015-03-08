bt.addLevel({
	controller:bt.CONTROLLER_MANUAL, 
	tank: 
		{
			x:5, y:5, 
			name:"You", color:"rgba(0, 255, 0,0.8)", 
			code:""
		}, 
	title: "Practice level", 
	description: "Move the tank to collect the checkpoints",
		
	tasks:[
		[5,1, bt.ITEM_TYPE_CHECKPOINT, bt.ACTION_COLLECT],
		[1,1, bt.ITEM_TYPE_CHECKPOINT, bt.ACTION_COLLECT],
		[1,2, bt.ITEM_TYPE_FUEL, bt.ACTION_COLLECT],
		[1,5, bt.ITEM_TYPE_CHECKPOINT, bt.ACTION_COLLECT]
		
		]
	});
	
