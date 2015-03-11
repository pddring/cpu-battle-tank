bt.addLevel({
	controller: bt.CONTROLLER_LITTLE_MAN_COMPUTER, 
	tank: {
		x:0, y:5, 
		name: "You", color:"rgba(0, 255,0,0.8)", 
		code:"Ly8gTW92ZSBmb3J3YXJkcw0KCUxEQSBGb3J3YXJkcyAgICAvLyBsb2FkIDAgaW50byBhY2N1bXVsYXRvcg0KCU9VVCAxICAgICAgICAgICAvLyBNb3ZlIGZvcndhcmRzDQoJT1VUIDENCglITFQgICAgICAgICAgICAgLy8gc3RvcCB0aGUgQ1BVDQoNCkZvcndhcmRzICAgIERBVCAwICAgICAgICAgICAvLyBzdG9yZSB0aGUgdmFsdWUgMA0K"
		}, 
	title: "Level 1", 
	description:"Complete the Little Man Computer tank code to move as far as the checkpoint",
	tasks:[
		[0, 1, bt.ITEM_TYPE_CHECKPOINT, bt.ACTION_COLLECT],
	]
});