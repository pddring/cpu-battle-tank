// Create Base64 Object
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

// BattleTanks library
var BattleTank = function() {
	var bt = this;
	
	// controllers
	this.CONTROLLER_MANUAL = "manual";
	this.CONTROLLER_LITTLE_MAN_COMPUTER = "cpu";
	
	// item constants
	this.ITEM_TYPE_ROCK = 0;
	this.ITEM_TYPE_TANK = 1;
	this.ITEM_TYPE_FUEL = 2;
	this.ITEM_TYPE_STRAW = 3;
	this.ITEM_TYPE_CRATER = 4;
	this.ITEM_TYPE_CHECKPOINT = 5;
	this.ITEM_TYPE_EXPLOSION = 6;
	this.ITEM_TYPE_AMMO = 7;
	this.ITEM_TYPE_WATER = 8;
	this.ITEM_TYPE_MINE = 9;
	
	// action constants
	this.ACTION_STATIC = 0;
	this.ACTION_COLLECT = 1;
	this.ACTION_VISIT = 2;
	this.ACTION_DESTROY = 3;
	
	// Level class - contains details of all obstacles and items in a level
	var Level = function(levelDetails) {
		this.controller = levelDetails.controller;
		this.description = levelDetails.description;
		this.title = levelDetails.title;
		this.completedTasks = [];
		this.remainingTasks = [];
		this.staticItems = [];
		this.items = levelDetails.tasks;
		this.startX = levelDetails.startX;
		this.startY = levelDetails.startY;
		this.tank = levelDetails.tank;
		
		this.describeTask = function(task) {
			if(!task)
				return;
			var x = task[0];
			var y = task[1];
			var object = task[2];
			var action = task[3];
			var html = "";
			switch(action) {
				case bt.ACTION_COLLECT:
					html += (object == bt.ITEM_TYPE_CHECKPOINT?'Go to':'Collect');
					break;
				case bt.ACTION_DESTROY:
					html += 'Destroy';
					break;
				default:
					html += 'Go to';
					break;
			}
			
			switch(object) {
				case bt.ITEM_TYPE_CHECKPOINT:
					html += ' the checkpoint';
				break;
				case bt.ITEM_TYPE_CRATER:
					html += ' the crater';
				break;
				case bt.ITEM_TYPE_FUEL:
					html += ' the fuel dump';
				break;
				case bt.ITEM_TYPE_ROCK:
					html += ' the rock';
				break;
				case bt.ITEM_TYPE_STRAW:
					html += ' the obstacle';
				break;
				case bt.ITEM_TYPE_AMMO:
					html += ' the ammo crate';
				break;
				case bt.ITEM_TYPE_TANK:
					html += ' the tank';
				break;
				case bt.ITEM_TYPE_WATER:
					html += ' the water';
				break;
				case bt.ITEM_TYPE_MINE:
					html += ' the landmine';
				break;
			}
			
			html += ' at (' + x + ',' + y + ')';
			return html;
		}
		
		// update task progress details
		this.updateDetails = function() {

			var html = '';
			var l = bt.grid.currentLevel;
			if(!l)
				html = '<h1>No objectives have been set</h1>';
			else {
				html = '<a id="restartLevel" data-icon="back" data-role="button">Restart level</a>';
				if(l.remainingTasks.length == 0) {
					html += '<a id="nextLevel" data-icon="forward" data-role="button">Next level</a>';
				}
				html += '<h1>' + l.title + '</h1>' + l.description;
			
				
				html += '<h2>' + l.completedTasks.length + ' tasks completed</h2><ul class="list_tick">';
				for(var i = 0; i < l.completedTasks.length; i++) {
					html += '<li>' + this.describeTask(l.completedTasks[i]) + '</li>';
				}
				html += '</ul>';
				
				html += '<h2>' + l.remainingTasks.length + ' tasks remaining</h2><ul class="list_cross">';
				for(var i = 0; i < l.remainingTasks.length; i++) {
					html += '<li>' + this.describeTask(l.remainingTasks[i]) + '</li>';
				}
				html += '</ul>';
			}
			html += '<a id="btn_choose_level" data-icon="grid">Choose level</a>';
			$('#objectives').html(html);
			
			// choose level
			$('#btn_choose_level').button().parent().click(function() {
				var html = '<h2>Choose Level</h2><div class="white">Levels:';
				for(var i = 0; i < bt.levels.length; i++) {
					var icon = bt.levels[i].completedTasks.length > 0 && bt.levels[i].remainingTasks.length == 0? "check" : "delete";
					html += '<a id="btn_choose_level_' + i + '" class="btn_choose_level" data-icon="' + icon + '"><span class="level_description">' + bt.levels[i].title + '</span></a>';
				}
				html +='</div>';
				$('#dlg').html(html);
				
				// chosen a level
				$('.btn_choose_level').button().click(function(e) {
					var id = e.currentTarget.id.split("_")[3];
					bt.grid.loadLevel(bt.levels[id]);
				});
				
				$('#dlg').popup('open');
			});
			
			$('#restartLevel').button().parent().click(function(e, ui) {
				var html = '<div><h2>Reset CPU code as well as level?</h2><div class="white"><p>Click yes to reset the code on each tank CPU back to the default for this level.</p><p>Click no to stick with your current tank CPU code</p><p>Click cancel to avoid restarting the level</p></div><p><a id="btn_reset_yes" data-icon="check" data-inline="true">Yes</a><a id="btn_reset_no" data-icon="delete" data-inline="true">No</a><a id="btn_reset_cancel" data-icon="back" data-inline="true">Cancel</a></p></div>';
				
				
				$('#dlg').html(html);
				
				
				
				// user chooses to reset level and code
				$('#btn_reset_yes').button().parent().click(function() {
					$('#dlg').popup("close");
					bt.restartLevel();
				});
				
				// user chooses to reset level but not code
				$('#btn_reset_no').button().parent().click(function() {
					// save code for all tanks
					var tankBackup = [];
					for(var i = 0; i < bt.tanks.length; i++) {
						tankBackup[i] = bt.tanks[i].cpu.getCodeListing();
					}
					$('#dlg').popup("close");
					bt.restartLevel();
					for(var i = 0; i < bt.tanks.length; i++) {
						bt.tanks[i].cpu.load(tankBackup[i]);
					}
				});
				
				// user chooses to cancel reset
				$('#btn_reset_cancel').button().parent().click(function() {
					$('#dlg').popup("close");
				});
				
				
				$('#dlg').popup("open");
			});
			$('#nextLevel').button().parent().click(function() {
				// get current level
				var currentLevel = bt.levels.indexOf(l);
				if(bt.levels.length > currentLevel + 1)
					bt.grid.loadLevel(bt.levels[currentLevel + 1]);
			});
			this.showNextTask();

		}
		
		// show details of the next task on the status bar
		this.showNextTask = function() {
			// show next task details
			var totalTasks = this.completedTasks.length + this.remainingTasks.length;
			var percent = Math.floor(this.completedTasks.length * 100 / totalTasks);
			if(this.remainingTasks.length > 0) {
				var nextTask = this.remainingTasks[0];
				var msg = percent + "% complete. Next task: " + this.describeTask(nextTask);
				if($('#next_task').length > 0) {
					$('#next_task').html(msg);
				} else {
					bt.grid.updateStatus('<span class="progress_holder"><span class="progress_bar" id="task_progress"></span></span><span id="next_task">' + msg + '</span>');
				}
				$('#task_progress').css({width: percent + "%"});
				
			} else {
				bt.grid.updateStatus("Well done: level complete.");
				$('#objectives').panel('open');
			}
		}
		
		
		// collect  / destroy all items at this position
		this.complete = function(x, y, action) {
			// loop through all the incompete level tasks
			for(var i = 0; i < this.remainingTasks.length; i++) {
				var task = this.remainingTasks[i];
				// check if the item is in the current grid cell
				if(x == task[0] && y == task[1] && (task[3] == action || (task[3] == bt.ACTION_COLLECT) && action == bt.ACTION_VISIT)){
					if(task[3] == bt.ACTION_COLLECT) {
						bt.grid.remove(x, y, task[2])
					}
					
					if(task[2] == bt.ITEM_TYPE_FUEL) {
					// top up fuel
						var tank = bt.getTankByCoordinates(x, y);
						if(tank) {
							tank.fuel += 10;
							if(tank.fuel > tank.maxFuel)
								tank.fuel = tank.maxFuel;
						}
					}

					// add task to completed list
					this.completedTasks.push(task);
										
					// remove task from remaining list
					this.remainingTasks.splice(i, 1);
					
					this.updateDetails();
				}
			}
		}
		
		// mark all tasks as incomplete
		this.reset = function() {
			this.staticTasks = [];
			this.remainingTasks = [];
			this.completedTasks = [];
			
			// sort items into static and uncompleted tasks
			for(var i = 0; i < this.items.length; i++){
				if(this.items[i][3] == bt.ACTION_STATIC) {
					this.staticTasks.push(this.items[i]);
				} else {
					this.remainingTasks.push(this.items[i]);
				}
			}
		}
		
	}
	
	// Tank class
	var Tank = function(tankId, x, y, color, grid) {
		var tank = this;
		this.color = color;
		this.grid = grid;
		this.x = x;
		this.y = y;
		this.direction = 0;
		this.gunDirection = 0;
		this.tankId = tankId;
		this.fuel = 10;
		this.ammo = 10;
		this.maxFuel = 10;
		this.maxAmmo = 10;
		this.laser_range = 3;
		
		// movement commands queue
		this.commands = [];
		
		// commands
		this.CMD_MOVE_FORWARDS = 0;
		this.CMD_MOVE_BACKWARDS = 1;
		this.CMD_TURN_CLOCKWISE = 2;
		this.CMD_TURN_ANTICLOCKWISE = 3;
		this.CMD_AIM_CLOCKWISE = 4;
		this.CMD_AIM_ANTICLOCKWISE = 5;
		this.CMD_FIRE = 6;
		this.CMD_AIM_N = 10;
		this.CMD_AIM_NE = 11;
		this.CMD_AIM_E = 12;
		this.CMD_AIM_SE = 13;
		this.CMD_AIM_S = 14;
		this.CMD_AIM_SW = 15;
		this.CMD_AIM_W = 16;
		this.CMD_AIM_NW = 17;
		this.CMD_TURN_N = 20;
		this.CMD_TURN_E = 22;
		this.CMD_TURN_S = 24;
		this.CMD_TURN_W = 26;
		
		// error messages
		this.ERR_OUT_OF_FUEL = "Out of fuel";
		this.ERR_OUT_OF_AMMO = "Out of ammo";
		this.ERR_OBSTACLE = "Cannot move here";
		
		this.sendOutput = function(outputDevice, accumulator) {
			// convert params to ints if necessary
			if(typeof(outputDevice) == "string")
				outputDevice = parseInt(outputDevice, 10);
			if(typeof(accumulator) == "string")
				accumulator = parseInt(accumulator, 10);
			switch(outputDevice) {
			case 0: // user output
				alert("Output for " + tank.tankId + ": " + accumulator);
				break;
				
			case 1: // movement
				switch(accumulator) {
				case 0: // Move forwards one space
					tank.addCommand(tank.CMD_MOVE_FORWARDS);
					break;
				case 1: // move backwards one space
					tank.addCommand(tank.CMD_MOVE_BACKWARDS);
					break;
				}
				break;
				
			case 2: // Steer tank
				tank.addCommand(tank.CMD_TURN_N + (accumulator % 8));
				break;
				
			case 3: //Aim gun
				tank.addCommand(tank.CMD_AIM_N + (accumulator % 8));
				break;
			
			case 4: // weapons
				switch(accumulator) {
				case 0:
					tank.addCommand(tank.CMD_FIRE);
					break;
				}
				break;
			}
			
		}
		
		// read value from input device
		this.getInput = function(inputDevice, accumulator) {
			// convert params to ints if necessary
			if(typeof(inputDevice) == "string")
				inputDevice = parseInt(inputDevice, 10);
			if(typeof(accumulator) == "string")
				accumulator = parseInt(accumulator, 10);
			var val = 0;
			switch(inputDevice) {
			case 0:	// User input
				val = parseInt(window.prompt("Input for " + tank.tankId + ": "), 10);
				if(isNaN(val))
					val = 0;
				break;
				
			case 1: // Navigation system
				switch(accumulator) {
				case 0: // GetX
					val = tank.x;
					break;
				case 1: // GetY
					val = tank.y;
					break;
				case 2: // GetTankDir
					val = tank.direction;
					break;
				case 3: // GetGunDir
					val = (tank.gunDirection + (tank.direction * 2)) % 8;
					break;
				}
				break;
				
			case 2: // Collision radar
				switch(accumulator) {
				case 0: // MoveForwards
					val = tank.canMoveForwards()? 1: 0;
					break;
				case 1: // MoveBackwards
					val = tank.canMoveBackwards()? 1: 0;
					break;
				}
				
				break;
			
			case 3: // Supplies
				switch(accumulator) {
				case 0: // Ammo
					val = tank.ammo;
					break;
				case 1: // Fuel
					val = tank.fuel;
					break;
				}
				break;
			}			
			return val;
		}
		
		// CPU class
		var CPU = function() {
			this.STATE_FETCH = 0;
			this.STATE_DECODE = 1;
			this.STATE_EXECUTE = 2;
			
			// mailboxes for LMC
			this.ram = [];
			this.registers = {accumulator:0, programCounter:0, instruction:0, zero: 0}

			// 0: next step is fetch, 1: next step is decode, 2: next step is execute
			this.state = this.STATE_FETCH; 
			
			// power up initialisation
			this.init = function() {
				this.ram.length = 0;
				for(var i = 0; i < 100; i++) {
					this.ram.push(0);
				}
			}
			
			// assemble code from string into ram
			this.load = function(code) {
				lines = code.split("\n");
				var line = "";
				var src = "";
				var precedingComments = [];
				var address = 0;
				var result = {
					success: true,
					instructions: [],
					errors: [],
					labels: {},
					memory: []
				};
				
				// loop through each line of code
				for(var i = 0; i < lines.length; i++) {
					src = lines[i].trim();
					line = src.match(/^((\.?[A-Za-z_]+[A-Za-z_0-9]*)\s+)?(SUB|ADD|STA|LDA|BRA|BRZ|BRP|INP|OUT|HLT|DAT)+(\s+([A-Za-z_0-9]+))?(\s*(\/\/|;)(.*))?$/);
					if(line) {
						getDetail = function(index) {
							if(line.length >= index)
								return line[index];
							else
								return null;
						}
												
						if(getDetail(3)) {
							
							// parse details
							var details = {
								address: address,
								line: i + 1,
								src:src,
								label: getDetail(2),
								opcode: getDetail(3),
								param: getDetail(5),
								postComment: getDetail(8),
								preComment: precedingComments.slice(0)
							}
							// allow for labels to start with a full stop
							if(details.label)
								details.label = details.label.replace(".","");
							
							// record a label
							if(details.label) {
								result.labels[address] = details.label;
								result.labels[details.label] = address;
							}
							
							address += 1;
							precedingComments.length = 0;					
							
							result.instructions.push(details);
						} 
					} else {
						// check for a comment or blank line
						if(/^(\s*\/\/(.*))?$/.test(src)) {
							precedingComments.push(src);
							continue;
						}
						
						//  record an error
						result.errors.push({
							line: i + 1,
							msg: "Unknown opcode: " + src,
							source: src
						});
						result.success = false;
					}
					tank.cpu.lastLoadedCode = result;
				}
				
				// assemble instructions into ram
				var cmd = "";
				if(result.success) {
					for(var i = 0; i < result.instructions.length; i++) {
						
						// check if a label has been used for the address
						if(result.instructions[i].param && /[A-Za-z_]+[A-Za-z_0-9]*/.test(result.instructions[i].param)) {
							result.instructions[i].addressLabel = result.instructions[i].param;
							var label = result.labels[result.instructions[i].param];
							if(label !== undefined) {
								result.instructions[i].param = result.labels[result.instructions[i].param];
							} else {
								result.success = false;
								result.errors.push({
									line: result.instructions[i].line,
									msg: "Undefined label: " + result.instructions[i].addressLabel,
									source: src
								});
							}
							
						}
						
						cmd = result.instructions[i].opcode;
						if(result.instructions[i].param !== undefined) {
							cmd += " " + result.instructions[i].param;
						}
						result.instructions[i].value = tank.cpu.assemble(cmd);
						
						// required param missing 
						if(isNaN(result.instructions[i].value)) {
							//  record an error
							result.errors.push({
								line: result.instructions[i].line,
								msg: "Expected memory address or label after: " + result.instructions[i].src,
								source: result.instructions[i].src
							});
							result.success = false;
						}
						tank.cpu.ram[i] = result.instructions[i].value;
					}
					
					// clear the rest of ram
					for(var i = result.instructions.length; i < tank.cpu.ram.length; i++) {
						tank.cpu.ram[i] = 0;
					}
				}
				return result;
			}
			
			// generate bytecode from mnemonics
			this.assemble = function(text) {
				text = text.toUpperCase();
				data = text.match(/\S+/g);
				var opcode = 0;
				address = parseInt(data[1], 10);
				switch(data[0]) {
				case 'ADD':
					opcode = 100 + address;
					break;
				case 'SUB':
					opcode = 200 + address;
					break;
				case 'STA':
					opcode = 300 + address;
					break;
				case 'LDA':
					opcode = 500 + address;
					break;
				case 'BRA':
					opcode = 600 + address;
					break;
				case 'BRZ':
					opcode = 700 + address;
					break;
				case 'BRP':
					opcode = 800 + address;
					break;
				case 'INP':
					opcode = 901;
					if(address)
						opcode += (10*(address % 10));					
					break;
				case 'OUT':
					opcode = 902;
					if(address)
						opcode += (10*(address % 10));
					break;
				case 'HLT':
				case 'COB':
					opcode = 0;
					break;
				case 'DAT':
					opcode = address?address:0;
						
				}
				return opcode;
			}
			
			// generate mnemonic from a single bytecode operation
			this.disassemble = function(atAddress) {
				var opcode = this.ram[atAddress];
				var hideAddress = false;
				var address = opcode % 100;
				var cmd = Math.floor(opcode / 100);
				var instruction = "";
				var allowLabel = true;
				switch(cmd) {
				case 1:
					instruction = "ADD";
					break;
				case 2:
					instruction = "SUB";
					break;
				case 3:
					instruction = "STA";
					break;
				case 5:
					instruction = "LDA";
					break;
				case 6:
					instruction = "BRA";
					break;
				case 7:
					instruction = "BRZ";
					break;
				case 8:
					instruction = "BRP";
					break;
				case 9:
					var device = Math.floor(address / 10) % 10;
					allowLabel = false;
					switch(address % 10) {
					case 1:
						instruction = "INP " + device;
						break;
					case 2:
						instruction = "OUT " + device;
						break;
					default:
						instruction = "DAT " + opcode;
						break;
					}
					hideAddress = true;
					break;
				case 0:
					if(address == 0) {
						instruction = "HLT";
						hideAddress = true;
					} else {
						instruction = "DAT";
						allowLabel = false;
					}
					break;
				default:
					instruction = "DAT " + opcode;
					allowLabel = false;
					hideAddress = true;
				}
				
				// check if this address is being used for data
				if(this.lastLoadedCode && this.lastLoadedCode.instructions[atAddress]) {
					if(this.lastLoadedCode.instructions[atAddress].opcode == "DAT")
						return "DAT " + opcode;
				}
				
				if(hideAddress) 
					return instruction;
				else {					
					if(this.lastLoadedCode && allowLabel) {
						var label = this.lastLoadedCode.labels[address];
						if(label !== undefined)
							return instruction + " " + label;
					}
					return instruction + " " + address;
				}
					
			}
			
			// explain a single bytecode operation
			this.explain = function(opcode) {
				var hideAddress = false;
				var address = opcode % 100;
				var cmd = Math.floor(opcode / 100);
				var instruction = "";
				switch(cmd) {
				case 1:
					instruction = "ADD: Add the value stored at address " + address + " to the value in the accumulator register";
					break;
				case 2:
					instruction = "SUBTRACT: Subtract the value stored at address " + address + " from the value in the accumulator register";
					break;
				case 3:
					instruction = "STORE: Store the contents of the accumulator register into address " + address;
					break;
				case 5:
					instruction = "LOAD: Load the value stored at address " + address + " into the accumulator register";
					break;
				case 6:
					instruction = "UNCONDITIONAL BRANCH Set the program counter register to " + address;
					break;
				case 7:
					instruction = "BRANCH IF ZERO: If the accumulator register contains the value 0, set the program counter register to " + address;
					break;
				case 8:
					instruction = "BRANCH IF POSITIVE: If the accumulator register holds a positive value, set the program counter register to " + address;
					break;
				case 9:
					var device = Math.floor(address / 10) % 10;
					switch(address % 10) {
					case 1:
						instruction = "INPUT: Read an input value from device " + device  + " and store it in the accumulator register";
						break;
					case 2:
						instruction = "OUTPUT: Sends the contents of the accumulator register to output device " + device;
						break;
					default:
						instruction = "DATA: Stores the value " + opcode;
						break;
					}
					break;
				case 0:
					if(address == 0) {
						instruction = "HALT: Stop the program";
					} else {
						instruction = "DATA: Stores the value " + opcode;
					}
					break;
				default:
					instruction = "DATA: Stores the value " + opcode;
				}
				return instruction;
			}
			
			// run a single bytecode operation
			this.execute = function(opcode) {
				var description = "";
				var incrementPC = true;
				var cmd = Math.floor(opcode / 100);
				var address = opcode % 100;
				switch(cmd) {
				
				// add
				case 1:
					this.registers.accumulator += this.ram[address];
					description = "Added " + this.ram[address] + " from memory address " + address + " to the accumulator register"
					break;
				
				// sub
				case 2:
					this.registers.accumulator -= this.ram[address];
					description = "Subtracted " + this.ram[address] + " from memory address " + address + " from the accumulator register"
					break;
					
				// sta
				case 3:
					this.ram[address] = this.registers.accumulator;
					description = "Stored " + this.registers.accumulator + " from the accumulator register into memory address " + address;
					break;

				// lda
				case 5:
					this.registers.accumulator = this.ram[address];
					description = "Loaded " + this.ram[address] + " from memory address " + address + " into the accumulator register"
					break;
					
				// bra
				case 6:
					this.registers.programCounter = address;
					incrementPC = false;
					description = "Set the program counter register to " + address;
					break;
					
				// brz
				case 7:
					if(this.registers.accumulator == 0) {
						this.registers.programCounter = address;
						description: "Accumulator register was 0: Set the program counter register to " + address;
						incrementPC = false;
					} else {
						description = "Accumulator was not 0: incremented program counter register as normal";
					}
					break;
					
				// brp
				case 8:
					if(this.registers.accumulator >= 0) {
						this.registers.programCounter = address;
						description: "Accumulator register was positive: Set the program counter register to " + address;
						incrementPC = false;
					} else {
						description = "Accumulator was negative: incremented program counter register as normal";
					}
					break;
					
				// input / output
				case 9:
					var io = address % 10; // 2 for output, 1 for input
					var device = Math.floor(address / 10) % 10 ; 
					
					// output
					if(io == 2) {
						tank.sendOutput(device, tank.cpu.registers.accumulator);
						description = "Output " + tank.cpu.registers.accumulator + " to device " + device;
					} 
					
					// input
					if(io == 1) {
						tank.cpu.registers.accumulator = tank.getInput(device, tank.cpu.registers.accumulator);
						description = "Stored " + tank.cpu.registers.accumulator + " from input device " + device + " into accumulator register";
					}
					break;
					
				case 0:
					incrementPC = false;
					description = "Halted";
					break;
				}
				
				// increment program counter to move to next command
				if(incrementPC) {
					this.registers.programCounter++;
				}
				return description;
			}
			
			// fetch (and return) next instruction
			this.fetch = function() {
				return this.registers.instruction = this.ram[this.registers.programCounter];
			}
			
			// get complete code listing for currently loading program
			this.getCodeListing = function(addressChanged) {
				var modifyExisting = typeof tank.cpu.lastLoadedCode !== 'undefined';
				
				lastNonZeroLine = 0;
				for(var i = 0; i < this.ram.length; i++) {
					if(this.ram[i] > 0)
						lastNonZeroLine = i;
				}
				
				// need to adapt existing code (keep comments and labels)
				if(modifyExisting) {
					var result = tank.cpu.lastLoadedCode;
					s = ""
					for(var i = 0; i < result.instructions.length; i++) {
						var ins = result.instructions[i];
						if(ins.preComment) {
							for(var j = 0; j < ins.preComment.length; j++) {
								s += ins.preComment[j] + "\n";
							}
						}
							
						if(addressChanged == i) {
							if(ins.label)
								s += ins.label + " ";
							else
								s += "\t";
								
							s += this.disassemble(i);
							
							if(ins.postComment)
								s += " //" +  ins.postComment + "\n"
							else
								s += "\n";
						} else {
							if(!ins.label)							
								s += "\t";
							s += ins.src + "\n";
						}
					}
					
					// add extra memory added in
					while(i < this.ram.length && i <= lastNonZeroLine) {
						s += "\t" + this.disassemble(i) + "\n";
						i++;
					}
					return s;
				}
				
				// just disassemble based on ram contents
				else {
					var code = "// Little Man Computer assembler";
					code += "\n// Code listing for " + tank.tankId;
					code += "\n// See: http://en.wikipedia.org/wiki/Little_man_computer#Instructions\n\n";
					for(var i = 0; i < this.ram.length; i++) {
						code += "\t" + this.disassemble(i) + "\n";
						if(i >= lastNonZeroLine)
							break;
					}
					return code;
				}
				
			}
			
			this.init();
		}
		
		this.cpu = new CPU();
		
		this.pad = function(number, length) {
			var negative = false;
			if(number < 0) {
				number = 0 - number;
				negative = true;
			}
			s = "" + number;
			while(s.length < length)
				s = "0" + s;
			if(negative)
				s = "-" + s;
			return s;
		}
		
		// show CPU interface
		this.showCPU = function() {
			bt.stop();
			var tank = this;
			
			var code = tank.cpu.getCodeListing();
			var html = '<div id="ram"><h2>Little Man Computer CPU<a data-icon="delete" data-inline="true" data-mini="true" id="btn_editor_cancel">Cancel</a></h2>';
			
			
			html += '<div><div data-collapsed="false" id="ram_editor_holder"><h2>Code editor</h2><a data-icon="gear" data-inline="true" data-mini="true" id="btn_editor_assemble">Assemble</a><a data-icon="info" data-inline="true" data-mini="true" id="btn_editor_help" href="#help">Help</a><div id="ram_editor">' + code + '</div><span id="code_status">Little Man Computer</span></div>'
			html +='<div id="ram_contents_holder" data-collapsed="false"><h2>Memory</h2><div id="ram_contents">';
			for(var i = 0; i < tank.cpu.ram.length; i++) {
				html += '<div class="memory_location" id="memory_location_' + i + '"><span id="memory_address_' + i + '" class="memory_address">' + tank.pad(i,2) + '</span><input type="text" name="memory_value_' + i + ' id="memory_value_' + i + '" class="memory_value" value="' + tank.pad(tank.cpu.ram[i], 3) + '" maxlength="3" size="3"></div>';
			}
			html +='</div></div>';
			html += '<div id="control_holder"><div id="input" data-role="collapsible" data-collapsed="true"><h2>Input</h2><table class="device_table"><tr><th>Input device:</th><th>Accumulator</th></tr>';
			html +='<tr><td><select data-mini="true" name="select_input_device" id="select_input_device"><option value="0">0: User Input</option><option value="1">1: Navigation System</option><option value="2">2: Collision Radar</option><option value="3">3: Supplies</option></select></td><td><select data-mini="true" name="select_input_accumulator" id="select_input_accumulator"><option>Any</option></select></td></tr></table><div id="input_explanation">Read value from the user</div>'
			html +='<a id="btn_current_input_value" data-iconpos="right" data-inline="true" data-mini="true" data-icon="refresh">Current value: 0</a>Example:<textarea id="input_code_sample" class="code_sample">INP 0 // asks the user to enter a number</textarea></div>'
			html += '<div id="process" data-collapsed="false" data-role="collapsible"><h2>Process</h2>'
			html += '<h3>Registers</h3><div id="registers">'
			html += '<span id="pc_register" class="tank_pc register">Program Counter:<input type="text" name="pc_register_value" maxlength="3" size="3" class="register_value" id="pc_register_value" value="0"></span>';
			html += '<span id="ins_register" class="tank_code register">Instruction:<input type="text" name="ins_register_value" maxlength="3" size="3" class="register_value" id="ins_register_value" value="0"></span>';
			html += '<span id="ac_register" class="tank_ac register">Accumulator:<input type="text" name="ac_register_value" maxlength="3" size="3" class="register_value" id="ac_register_value" value="0"></span>';
			html += '<h3>Fetch Execute Cycle</h3>';
			html += '<a id="btn_run_restart" data-role="button" data-mini="true" data-inline="true" data-icon="back">Restart</a>';
			html += '<a id="btn_run_step" data-role="button" data-mini="true" data-inline="true" data-icon="forward">Step</a>';
			html += '<img id="fetch_execute_cycle" src="media/fetch_decode_execute.png"/><div id="control_status"></div>';
			html += '</div></div>';
			html += '<div id="output" data-collapsed="true" data-role="collapsible"><h2>Output</h2><table class="device_table"><tr><th>Output Device:</th><th>Accumulator</th></tr><tr><td><select data-mini="true" name="select_output_device" id="select_output_device"><option value="0">0: User output</option><option value="1">1: Movement</option><option value="2">2: Steer tank</option><option value="3">3: Aim gun</option><option value="4">4: Weapons</option></select></td><td><select data-mini="true" name="select_output_accumulator" id="select_output_accumulator"><option>Any</option></select></td></tr></table><div id="output_explanation">Send value to the user</div><a id="btn_current_output_value" data-iconpos="right" data-inline="true" data-mini="true" data-icon="refresh">Test</a>Example:<textarea id="output_code_sample" class="code_sample">OUT 0 // display a number</textarea></div>';
			html +='</div></div></div></div>';
			
			$('#dlg').html(html).popup("open");
			
			
			
			var resizeTankCPUWin = function() {
				$('#dlg').popup("reposition", {positionTo: 'origin'});
			};
			
			$('#ram_editor_holder,#ram_contents_holder,#input,#process,#output').collapsible({
				collapse: resizeTankCPUWin,
				expand: resizeTankCPUWin
			});
		
			// add text to explain a given input device
			var explainInput = function(text, code) {
				$("#input_explanation").html(text);
				$("#input_code_sample").html(code);
			}
			
			// add text to explain a given output device
			var explainOutput = function(text, code) {
				$("#output_explanation").html(text);
				$("#output_code_sample").html(code);
			}
			
			// sets the different options available in the input accumulator select box
			var currentInputAccumulatorOptions = null;
			var setInputAccumulatorOptions = function(options) {
				currentInputAccumulatorOptions = options;
				var html = '';
				for(var i = 0; i < options.length; i++) {
					html += '<option value="' + options[i].value + '">' + options[i].value + ': ' + options[i].text + '</option>';
				}
				$('#select_input_accumulator').html(html).selectmenu('refresh');
				updateInputAccumulator();
			}
			
			// sets the different options available in the output accumulator select box
			var currentOutputAccumulatorOptions = null;
			var setOutputAccumulatorOptions = function(options) {
				currentOutputAccumulatorOptions = options;
				var html = '';
				for(var i = 0; i < options.length; i++) {
					html += '<option value="' + options[i].value + '">' + options[i].value + ': ' + options[i].text + '</option>';
					if(options[i].text=="Any") {
						for(var j = 0; j < 999; j++) {
							html += '<option value="' + j + '">' + j + '</option>';
						}
					}
				}
				$('#select_output_accumulator').html(html).selectmenu('refresh');
				updateOutputAccumulator();
			}
			
			
			// gets the latest input value
			var updateCurrentInputValue = function() {
				var currentInput = $("#select_input_device").val()
				var currentAccumulator = $('#select_input_accumulator').val();
				var val = tank.getInput(currentInput, currentAccumulator);
				$('#btn_current_input_value').html("Current value: " + val);
			};
			
			// tests the currently selected output function
			var sendCurrentOutput = function() {
				var currentOutput = $("#select_output_device").val()
				if(isNaN(currentOutput))
					currentOutput = 0;
				var currentAccumulator = $('#select_output_accumulator').val();
				if(isNaN(currentAccumulator)) 
					currentAccumulator = 0;
				var val = tank.sendOutput(currentOutput, currentAccumulator);
			}
			
			
			
			
			var updateInputAccumulator = function() {
				var val = $('#select_input_accumulator').val();
				if(currentInputAccumulatorOptions) {
					for(var i = 0; i < currentInputAccumulatorOptions.length; i++) {
						if(currentInputAccumulatorOptions[i].value == val) {
							explainInput(currentInputAccumulatorOptions[i].description, currentInputAccumulatorOptions[i].example);
						}
					}
				}
				updateCurrentInputValue();
			}
			
			var updateOutputAccumulator = function() {
				var val = $('#select_output_accumulator').val();
				if(currentOutputAccumulatorOptions) {
					for(var i = 0; i < currentOutputAccumulatorOptions.length; i++) {
						if(currentOutputAccumulatorOptions[i].value == val) {
							explainOutput(currentOutputAccumulatorOptions[i].description, currentOutputAccumulatorOptions[i].example);
						}
					}
				}
			}
			
			// input accumulator change handler
			$('#select_input_accumulator').selectmenu().on("change", function() {
				updateInputAccumulator();
			});
			
			// output accumulator change handler
			$('#select_output_accumulator').selectmenu().on("change", function() {
				updateOutputAccumulator();
			});
			
			// choose an input
			$('#select_input_device').selectmenu().on("change", function() {
				switch(this.value) {
				case "0":	// User input
					//explainInput("Asks the user to enter a number. e.g:", "INP // ask user for a number");
					setInputAccumulatorOptions([{ value: '0', text: 'Any', description: 'Ask the user for a number', example:'INP // ask user for a number' }]);
					break;
					
				case "1": // Tank direction
					setInputAccumulatorOptions([
						{ 
							value: '0', 
							text: 'GetX', 
							description: 'Store current X coordinate in accumulator register', 
							example:'LDA GetX\nINP 1 // Navigation\nHLT // rest of program goes here\nGetX  DAT 0'
						}, 
						{ 
							value: '1', 
							text: 'GetY', 
							description: 'Store current Y coordinate in accumulator register', 
							example:'GetY\nINP 1 // Navigation\nHLT // rest of program goes here\nGetY  DAT 1'
						},
						{ 
							value: '2', 
							text: 'GetTankDir', 
							description: 'Store current tank direction in accumulator register<table class="device_table"><tr><th>Accumulator</th><th>Meaning</th></tr><tr><td>0</td><td>North</td></tr><tr><td>2</td><td>East</td></tr><tr><td>4</td><td>South</td></tr><tr><td>6</td><td>West</td></tr></table>',
							example: 'LDA TankDir\nINP 1 // Navigation\nHLT // rest of program goes here\nTankDir DAT 2'
						},
						{ 
							value: '3', 
							text: 'GetGunDir', 
							description: 'Get gun direction<table class="device_table"><tr><th>Accumulator</th><th>Meaning</th></tr><tr><td>0</td><td>North</td></tr><tr><tr><td>1</td><td>North East</td></tr><tr><td>2</td><td>East</td></tr><tr><td>3</td><td>South East</td></tr><tr><tr><td>4</td><td>South</td></tr><tr><td>5</td><td>South West</td></tr><tr><tr><td>6</td><td>West</td></tr><tr><td>7</td><td>North West</td></tr><tr></table>',
							example: 'LDA GunDir\nINP 1 // Navigation\nHLT // rest of program goes here\nGunDir DAT 3'
						}]);
					break;
					
				case "2": // Collision radar
					setInputAccumulatorOptions([
						{ 
							value: '0', 
							text: 'MoveForwards?', 
							description: 'Checks if the tank can move forwards<table class="device_table"><tr><th>Accumulator</th><th>Meaning</th></tr><tr><td>0</td><td>Obstacle - can&#39;t move forwards</td></tr><tr><tr><td>1</td><td>Movement possible</td></tr></table>', 
							example:'LDA MoveForwards\nINP 2 // Collision radar\nHLT // rest of program goes here\nMoveForwards DAT 0'
						},
						{ 
							value: '1', 
							text: 'MoveBackwards?', 
							description: 'Checks if the tank can move backwards<table class="device_table"><tr><th>Accumulator</th><th>Meaning</th></tr><tr><td>0</td><td>Obstacle - can&#39;t move forwards</td></tr><tr><tr><td>1</td><td>Movement possible</td></tr></table>', 
							example:'LDA Movebackwards\nINP 2 // Collision radar\nHLT // rest of program goes here\nMoveBackwards DAT 1'
						}]);
					break;
				
				case "3": // Supplies
					setInputAccumulatorOptions([
						{ 
							value: '0', 
							text: 'GetAmmo', 
							description: 'Store the amount of amunition in accumulator register', 
							example:'LDA Ammo\nINP 3 // Supplies\nHLT // rest of program goes here\nAmmo DAT 0'
						},
						{ 
							value: '1', 
							text: 'GetFuel', 
							description: 'Store the amount of fuel in accumulator register', 
							example:'LDA Fuel\nINP 3 // Supplies\nHLT // rest of program goes here\nFuel DAT 0'
						}]);
					break;
				}				
			});
			
			
			// choose an output
			$('#select_output_device').selectmenu().on("change", function() {
				switch(this.value) {
				case "0":	// User output
					setOutputAccumulatorOptions([{ value: '0', text: 'Any', description: 'Display a number', example:'INP // ask for a number\nOUT // display the number' }]);
					break;
					
				case "1": // Movement
					setOutputAccumulatorOptions([
						{ 
							value: '0', 
							text: 'Forwards', 
							description: 'Move the tank forwards by one space', 
							example:'LDA Forwards\nOUT 1 // Move\nHLT // rest of program goes here\nForwards DAT 0'
						}, 
						{ 
							value: '1', 
							text: 'Backwards', 
							description: 'Move the tank backwards by one space', 
							example:'LDA Backwards\nOUT 1 // Move\nHLT // rest of program goes here\nBackwards DAT 1'
						}]);
					break;
					
				case "2": // Steer tank
					setOutputAccumulatorOptions([
						{ 
							value: '0', 
							text: 'North', 
							description: 'Turn the tank to face North', 
							example:'LDA North\nOUT 2 // Steer\nHLT // rest of program goes here\nNorth DAT 0'
						},
						{ 
							value: '2', 
							text: 'East', 
							description: 'Turn the tank to face East', 
							example:'LDA East\nOUT 2 // Steer\nHLT // rest of program goes here\nEast DAT 2\n'
						},
						{ 
							value: '4', 
							text: 'South', 
							description: 'Turn the tank to face South', 
							example:'LDA South\nOUT 2 // Steer\nHLT // rest of program goes here\nSouth DAT 4'
						},
						{ 
							value: '6', 
							text: 'West', 
							description: 'Turn the tank to face West', 
							example:'LDA West\nOUT 2 // Steer\nHLT // rest of program goes here\nWest DAT 6'
						}
						]);
					break;
				
				case "3": // Aim gun
					setOutputAccumulatorOptions([
						{ 
							value: '0', 
							text: 'North', 
							description: 'Aim the gun to face North', 
							example:'LDA North\nOUT 3 // Aim\nHLT // rest of program goes here\nNorth DAT 0'
						},
						{ 
							value: '1', 
							text: 'NorthEast', 
							description: 'Aim the gun to face North East', 
							example:'LDA NorthEast\nOUT 3 // Aim\nHLT // rest of program goes here\nNorthEast DAT 1'
						},
						{ 
							value: '2', 
							text: 'East', 
							description: 'Aim the gun to face East', 
							example:'LDA East\nOUT 3 // Aim\nHLT // rest of program goes here\nEast DAT 2\n'
						},
						{ 
							value: '3', 
							text: 'SouthEast', 
							description: 'Aim the gun to face South East', 
							example:'LDA SouthEast\nOUT 3 // Aim\nHLT // rest of program goes here\nSouthEast DAT 3'
						},
						{ 
							value: '4', 
							text: 'South', 
							description: 'Aim the gun to face South', 
							example:'LDA South\nOUT 3 // Aim\nHLT // rest of program goes here\nSouth DAT 4'
						},
						{ 
							value: '5', 
							text: 'SouthWest', 
							description: 'Aim the gun to face South West', 
							example:'LDA SouthWest\nOUT 3 // Aim\nHLT // rest of program goes here\nSouthWest DAT 5'
						},
						{ 
							value: '6', 
							text: 'West', 
							description: 'Aim the gun to face West', 
							example:'LDA West\nOUT 3 // Aim\nHLT // rest of program goes here\nWest DAT 6'
						},
						{ 
							value: '7', 
							text: 'NorthWest', 
							description: 'Aim the gun to face North West', 
							example:'LDA NorthWest\nOUT 3 // Aim\nHLT // rest of program goes here\nNorthWest DAT 7'
						}
						]);
					break;
				case "4": // Weapons
					setOutputAccumulatorOptions([
						{ 
							value: '0', 
							text: 'Shoot', 
							description: 'Fire gun', 
							example:'LDA Fire\nOUT 4 // Weapons\nHLT // rest of program goes here\nFire DAT 0'
						}]);
					break;
				}				
			});
			
			
			
			$('#btn_current_input_value').button().parent().click(updateCurrentInputValue);
			$('#btn_current_output_value').button().parent().click(sendCurrentOutput);
			
			// update contents of registers
			var updateRegisters = function() {
				$('#pc_register_value').val(tank.cpu.registers.programCounter);
				$('#ins_register_value').val(tank.cpu.registers.instruction);
				$('#ac_register_value').val(tank.cpu.registers.accumulator);
			}
			
			// go to the line that corresponds to the code pointed to by the program counter register			
			var gotoPCLine = function() {
				if(result && result.instructions) {
					for(var i = 0; i < result.instructions.length; i++) {
						if(result.instructions[i].address == tank.cpu.registers.programCounter) {
							editor.gotoLine(result.instructions[i].line);
						}
					}
				}
			}
			
			updateRegisters();
			
			// register change handler
			$('.register_value').focusout(function() {
				tank.cpu.registers.programCounter = $('#pc_register_value').val();
				tank.cpu.registers.instruction = $('#ins_register_value').val();
				tank.cpu.registers.accumulator = $('#ac_register_value').val();
			});
			
			$('#btn_run_restart').button().parent().click(function() {
				tank.cpu.registers.programCounter = 0;
				tank.cpu.registers.accumulator = 0;
				tank.cpu.registers.instruction = 0;
				tank.cpu.state = 0;
				updateRegisters();
				gotoPCLine();
				$('#control_status').html('Program counter register set to 0');
			});
			
			$('#btn_run_step').button().parent().click(function(){
				$('#fetch_execute_cycle').css({opacity: 1,'transform': 'rotate(' + ((tank.cpu.state) * -120) + 'deg)'});
				switch(tank.cpu.state) {
					// fetch next instruction
				case tank.cpu.STATE_FETCH:
					gotoPCLine();
					var ins = tank.cpu.fetch();
					$('#control_status').html("Fetched instruction " + ins + " from memory location " + tank.cpu.registers.programCounter);
					tank.cpu.state = tank.cpu.STATE_DECODE;
					break;
					
					// decode current instruction
				case tank.cpu.STATE_DECODE:
					$("#control_status").html("Decoded instruction " + tank.cpu.registers.instruction + ": " + tank.cpu.explain(tank.cpu.registers.instruction));
					tank.cpu.state = tank.cpu.STATE_EXECUTE;
					break;
					
					// execute current instruction
				case tank.cpu.STATE_EXECUTE:
					$("#control_status").html(tank.cpu.execute(tank.cpu.registers.instruction));
					updateMemory();
					tank.cpu.state = tank.cpu.STATE_FETCH;
					break;
				}
				
				updateRegisters();
			});
			
			var editor = ace.edit("ram_editor");
			editor.$blockScrolling = Infinity;
			var session = editor.getSession();
			session.setMode("ace/mode/lmc");
			var result = null;
			
			var selectCurrentLineAddress = function() {
				var line = session.selection.getCursor().row + 1;
				$('.memory_location').removeClass('mem_current_line');
				if(result && result.success) {
					// find memory location for current line
					for(var i = 0; i < result.instructions.length; i++) {
						if(result.instructions[i].line == line) {
							var address = result.instructions[i].address;
							var currentLocation = $('#memory_location_' + i).addClass('mem_current_line');
							var offset = $('#ram_contents').scrollTop() + currentLocation.position().top - 100;
							
							// scroll to show current position
							$('#ram_contents').stop().animate({scrollTop:offset}, 500);
						}
					}
				}
			}
			
			// show latest memory contents
			var updateMemory = function() {			
				var html ='';
				for(var i = 0; i < tank.cpu.ram.length; i++) {
					var lbl = '';
					if(result.labels[i]) {
						lbl = '<div class="memory_label" id="memory_label_' + i + '">' + result.labels[i] + '</div>';
					}
					html += '<div class="memory_location" id="memory_location_' + i + '">' + lbl + '<span id="memory_address_' + i + '" class="memory_address">' + tank.pad(i,2) + '</span><input name="memory_value_' + i + '" id="memory_value_' + i + '" class="memory_value" maxlength="3" value="' + tank.pad(tank.cpu.ram[i], 3) + '" size="3"></div>';
				}
				$('#ram_contents').html(html);
				selectCurrentLineAddress();
				
				// add focus in handler for ram editor
				$('.memory_value').focusin(function() {
					var address = parseInt(this.id.split("_")[2], 10);
					var opcode = parseInt(this.value, 10);
				
					// find current line
					for(var i = 0; i < tank.cpu.lastLoadedCode.instructions.length; i++) {
						if(tank.cpu.lastLoadedCode.instructions[i].address == address) {
							editor.gotoLine(tank.cpu.lastLoadedCode.instructions[i].line);
							break;
						} 
					}
				});
				
				// add focus out handler for ram editor
				$('.memory_value').focusout(function() {
					var address = parseInt(this.id.split("_")[2], 10);
					var opcode = parseInt(this.value, 10);
					tank.cpu.ram[address] = opcode;
					editor.setValue(tank.cpu.getCodeListing(address));
					
					// find current line
					for(var i = 0; i < tank.cpu.lastLoadedCode.instructions.length; i++) {
						if(tank.cpu.lastLoadedCode.instructions[i].address == address) {
							editor.gotoLine(tank.cpu.lastLoadedCode.instructions[i].line);
							break;
						} 
					}
				});
			}
			
			// wait after each edit before checking code to avoid extra overhead
			var checkTimeout = null;
			var checkCode = function() {
				$("#code_status").html('<span class="spinner"> </span>Checking code...').css({'background-color':'rgba(255,255,200,0.7)', 'box-shadow':'0px 0px 10px rgba(255,255,200,0.7)'});
				if(checkTimeout) {
					clearTimeout(checkTimeout);
					checkTimeout = null;
				}
				// assemble code to check for errors
				checkTimeout = setTimeout(function(e) {
					editor.session.clearAnnotations();
					result = tank.cpu.load(editor.getValue());
					if(result.success) {
						success = true;
						$("#code_status").html('<img src="media/tick.png" />No errors: ' + result.instructions.length + " % memory used").css({'background-color':'rgba(200,255,200,0.7)', 'box-shadow':'0px 0px 10px rgba(200,255,200,0.7)'});
						
						updateMemory();
						selectCurrentLineAddress();
					} else {
						var annotations = [];
						for(var i = 0; i < result.errors.length; i++) {
							annotations.push({
								row: result.errors[i].line - 1,
								column: 0,
								text: result.errors[i].msg,
								type: "error"
							});
						}
						editor.session.setAnnotations(annotations);
						$("#code_status").html('<img src="media/cross.png" />' + result.errors.length + " error(s): see line " + result.errors[0].line).css({'background-color':'rgba(255,200,200,0.7)', 'box-shadow':'0px 0px 10px rgba(255,200,200,0.7)'});
					}
				}, 500);
			}
			
			checkCode();
			
			session.on("change", function(e) {
				checkCode();
			});
			
			// show ram contents for currently selected opcode
			session.selection.on("changeCursor", function(e) {
				selectCurrentLineAddress();
			});

			
			// cancel code editor
			$('#btn_editor_cancel').button().click(function(e) {
				$("#dlg").popup("close");
			});
			
			// help button
			$('#btn_editor_help').button();
			
			
			// apply code changes
			$('#btn_editor_assemble').button().click(function(e) {
				editor.session.clearAnnotations();
				var result = tank.cpu.load(editor.getValue());
				if(result.success) {
					$('#dlg').popup("close");
				} else {
					var annotations = [];
					for(var i = 0; i < result.errors.length; i++) {
						annotations.push({
							row: result.errors[i].line - 1,
							column: 0,
							text: result.errors[i].msg,
							type: "error"
						});
					}
					editor.session.setAnnotations(annotations);
				}

			});
			
			
		}
		
		
		// update tank stats
		this.updateStats = function() {
			if(bt.settings.showFuelDetails)
				$('#' + this.tankId + " .tank_fuel").html('Fuel: ' + this.fuel + "&frasl;" + this.maxFuel);
			if(bt.settings.showAmmoDetails)
				$('#' + this.tankId + " .tank_ammo").html('Ammo: ' + this.ammo + "&frasl;" + this.maxAmmo);
			if(bt.settings.showCommandQueue) {
				var html = 'Commands:';
				for(var i = 0; i < this.commands.length; i++) {
					var cmd = this.commands[i];
					html += '<img class="tank_command" src="media/command_' + cmd + '.png" />' ;
				}
				$('#' + this.tankId + " .tank_commands").html(html);
			}
		}
		
		// get html status details
		this.getDetails = function() {
			function getDirectionName(degrees) {
				var d = parseInt(degrees / 45);
				var labels = ["North", "North East", "East", "South East", "South", "South West", "West", "North West"];
				return labels[d];
			}
			
			var friendlyName = this.tankId.replace("tank_", "");
			var html = '<p>Name: <span style="background-color:' + this.color + '">' + friendlyName + '</span></p>\
			<p>Fuel: ' + this.fuel + ' &#47; ' + this.maxFuel + '</p>\
			<p>Ammo: ' + this.ammo + ' &#47; ' + this.maxAmmo + '</p>\
			<p>Direction: ' + this.direction * 90 + '&deg; (' + getDirectionName(this.direction * 90) + ')</p>\
			<p>Gun direction: ' + this.gunDirection * 45 + '&deg; (' + getDirectionName(this.gunDirection * 45) + ')</p>';
			html += '<div id="commandList">Commands:<p>';
			for(var i = 0; i < this.commands.length; i++) {
				var cmd = this.commands[i];
				html += '<img class="tank_command" src="media/command_' + cmd + '.png" />' ;
			}
			html += '</p></div>';
			
			return html;
		}
		
		// add a command to the queue
		this.addCommand = function(command) {
			this.commands.push(command);
			this.updateStats();
			return this.commands;
		}
		
		// execute next command from the queue
		this.executeNextCommand = function() {
			
			var cmd = this.commands.shift();
			switch(cmd) {
				case this.CMD_MOVE_FORWARDS:
					this.moveForwards();
					break;
				case this.CMD_MOVE_BACKWARDS:
					this.moveBackwards();
					break;
				case this.CMD_TURN_N:
				case this.CMD_TURN_E:
				case this.CMD_TURN_S:
				case this.CMD_TURN_W:
					var direction = cmd % 10;
					this.rotate(direction * 45);
					break;
				case this.CMD_AIM_N:
				case this.CMD_AIM_NE:
				case this.CMD_AIM_E:
				case this.CMD_AIM_SE:
				case this.CMD_AIM_S:
				case this.CMD_AIM_SW:
				case this.CMD_AIM_W:
				case this.CMD_AIM_NW:
					var direction = (cmd % 10) - (tank.direction * 2);
					this.aim(direction * 45);
					break;
				case this.CMD_TURN_CLOCKWISE:
					this.turnClockwise();
					break;
				case this.CMD_TURN_ANTICLOCKWISE:
					this.turnAntiClockwise();
					break;
				case this.CMD_AIM_CLOCKWISE:
					this.aimClockwise();
					break;
				case this.CMD_AIM_ANTICLOCKWISE:
					this.aimAntiClockwise();
					break;
				case this.CMD_FIRE:
					this.fire();
					break;
			}
			this.updateStats();
			return this.commands;
		}
		
		// fire laser
		this.fire = function() {
			if(this.ammo > 0) {
				this.ammo--;
			} else {
				throw this.ERR_OUT_OF_AMMO;
			}
			var jq = $('#' + this.tankId + " .tank_laser");
			
			// work out projectile direction
			var dx, dy;
			switch((this.direction * 2 + this.gunDirection) % 8) {
				case 0: // N
					dx = 0; dy = -1;
					break;
				case 1: // NE
					dx = 1; dy = -1;
					break;
				case 2: // E
					dx = 1; dy = 0;
					break;
				case 3: // SE
					dx = 1; dy = 1;
					break;
				case 4: // S
					dx = 0; dy = 1;
					break;
				case 5: //SW
					dx = -1; dy = 1;
					break;
				case 6: //W
					dx = -1; dy = 0;
					break;
				case 7: //NW
					dx = -1; dy = -1;
					break;
			}
			
			// check for obstacles
			var range;
			var x = this.x; var y = this.y;
			for(range = 0; range < this.laser_range; range++) {
				x += dx; y += dy;
				if((x > grid.MAX_GRID) || (x < 0) || (y > grid.MAX_GRID) || (y < 0)) {
					x -= dx; y -= dy;
					break;
				}
					
				var items = bt.grid.mapData[y][x].items;
				var obstacle = false;
				for(var i = 0; i < items.length; i++) {
					switch(items[i]) {
						case bt.ITEM_TYPE_TANK:
						case bt.ITEM_TYPE_ROCK:
						case bt.ITEM_TYPE_STRAW:
						case bt.ITEM_TYPE_FUEL:
						case bt.ITEM_TYPE_MINE:
							obstacle = true;
							break;
					}
				}
				if(obstacle)
					break;
			}
			
			var h = (((this.gunDirection % 2) == 0)?64:91) * range;
			jq.css({height:h, opacity:0.8});
			setTimeout(function() {
				jq.css({height:0, opacity:0});
				bt.grid.explode(x,y);
			}, 700);
		}
		
		
		// turn turret 45' clockwise
		this.aimClockwise = function() {
			this.gunDirection = (this.gunDirection + 1)%8;
			this.aim(this.gunDirection * 45);
		}
		
		// turn turret 45' anti clockwise
		this.aimAntiClockwise = function() {
			this.gunDirection = (this.gunDirection - 1)%8;
			while(this.gunDirection < 0)
				this.gunDirection += 8;
			this.aim(this.gunDirection * 45);
		}
		
		// checks to see if the grid coordinate x, y is a valid space to move to
		this.canMoveTo = function(x, y) {
			if(x > grid.MAX_GRID || x < grid.MIN_GRID || y > grid.MAX_GRID || y < grid.MIN_GRID)
				return false;
			
			// check that there are no obstacles
			var items = bt.grid.mapData[y][x].items;
			for(var i = 0; i < items.length; i++) {
				switch(items[i]) {
					case bt.ITEM_TYPE_ROCK:
					case bt.ITEM_TYPE_STRAW:
					case bt.ITEM_TYPE_WATER:
						return false;
					break;
				}
			}
			return true;
		}
		
		// checks to see if the tank can move one space forwards
		this.canMoveForwards = function() {
			var x = this.x;
			var y = this.y;
			switch(this.direction) {
			case 0:
				y--;
				break;
			case 1:
				x++;
				break;
			case 2:
				y++;
				break;
			case 3:
				x--;
				break;
			}
			return this.canMoveTo(x, y);
		}
		
		// checks to see if the tank can move one space back
		this.canMoveBackwards = function() {
			var x = this.x;
			var y = this.y;
			switch(this.direction) {
			case 0:
				y++;
				break;
			case 1:
				x--;
				break;
			case 2:
				y--;
				break;
			case 3:
				x++;
				break;
			}
			return this.canMoveTo(x, y);
		}
		
		// ensure that a tank can't fall off the edge of the world
		this.checkBounds = function() {
			if(this.x > grid.MAX_GRID)
				this.x = grid.MAX_GRID;
			if(this.x < grid.MIN_GRID)
				this.x = grid.MIN_GRID;
			if(this.y > grid.MAX_GRID)
				this.y = grid.MAX_GRID;
			if(this.y < grid.MIN_GRID)
				this.y = grid.MIN_GRID;
				
			// check that there are no obstacles
			var items = bt.grid.mapData[this.y][this.x].items;
			for(var i = 0; i < items.length; i++) {
				switch(items[i]) {
					case bt.ITEM_TYPE_ROCK:
					case bt.ITEM_TYPE_STRAW:
					case bt.ITEM_TYPE_WATER:
						throw this.ERR_OBSTACLE;
					break;
				}
			}
		}
		
		// move one square forward
		this.moveForwards = function() {
			// check there's enough fuel
			if(this.fuel < 1) 
				throw this.ERR_OUT_OF_FUEL;
			
			undoX = this.x;
			undoY = this.y;
			switch(this.direction) {
				case 0:
					this.y--;
					break;
				case 1:
					this.x++;
					break;
				case 2:
					this.y++;
					break;
				case 3:
					this.x--;
					break;
			}
			try {
				this.checkBounds();
			} catch(e) {
				this.x = undoX;
				this.y = undoY;
			}
			this.goto(this.x,this.y);
			this.fuel--;
		}
		
		// move one square backwards
		this.moveBackwards = function() {
			// check there's enough fuel
			if(this.fuel < 1) 
				throw this.ERR_OUT_OF_FUEL;
			undoX = this.x;
			undoY = this.y;
			switch(this.direction) {
				case 0:
					this.y++;
					break;
				case 1:
					this.x--;
					break;
				case 2:
					this.y--;
					break;
				case 3:
					this.x++;
					break;
			}
			try {
				this.checkBounds();
			} catch(e) {
				this.x = undoX;
				this.y = undoY;
			}
			this.goto(this.x,this.y);
			this.fuel--;
		}
		
		this.turnClockwise = function() {
			this.direction = (this.direction + 1) % 4;
			this.rotate(this.direction * 90);
		}
		
		this.turnAntiClockwise = function() {
			this.direction = (this.direction - 1) % 4;
			while(this.direction < 0) {
				this.direction += 4;
			}
			this.rotate(this.direction * 90);
		}
		
		// move tank to given coordinates
		this.goto = function(x, y) {
			// remove tank from mapData
			var i = this.grid.mapData[this.y][this.x].items.indexOf(bt.ITEM_TYPE_TANK);
			if(i != -1)
				this.grid.mapData[this.y][this.x].items.splice(i, 1);
				
			this.x = x;
			this.y = y;
			
			// add tank into new mapData
			this.grid.mapData[this.y][this.x].items.push(bt.ITEM_TYPE_TANK);
			
			// get destination position
			var pos = $('#grid_' + x + '_' + y).position();
			$('#' + tankId).css({left:pos.left, top:pos.top});
			
			// mark all items in new position as being collected
			if(bt.grid.currentLevel) 
				bt.grid.currentLevel.complete(x,y, bt.ACTION_VISIT);
				
			// explode any mines
			for(var i = 0; i < this.grid.mapData[y][x].items.length; i++){
				if(this.grid.mapData[y][x].items[i] == bt.ITEM_TYPE_MINE) {
					this.grid.explode(x, y);
				}
			}
		}
		
		// rotate tank
		this.rotate = function(direction) {
			$('#' + tankId + " .inner_tank").css({transform:'rotate(' + direction + 'deg)'});
			this.direction = Math.floor(direction / 90);
		}
		
		this.aim = function(direction) {
			$('#' + tankId  + ' .tank_top').css({transform:'rotate(' + direction + 'deg)'});
			this.gunDirection = Math.floor(direction / 45);
		}
		
		this.goto(this.x,this.y);
	}

	 var GridSquare = function(x,y) {
		
		this.x = x;
		this.y = y;
		this.items = [];
	}

	// grid class
	var Grid = function(size){
		var grid = this;
		if(undefined === size)
			size = 15;
			
		this.MAX_GRID = size;
		this.MIN_GRID = 0;
		this.updateCallback = null;
		this.currentLevel = null;
		
		// initialise map data 
		this.mapData = [];
		for(var y = 0; y < this.MAX_GRID; y++) {
			var row = [];
			for(var x = 0; x < this.MAX_GRID; x++) {
				row.push(new GridSquare(x,y));
			}
			this.mapData.push(row);
		}
		
		// add an explosion at a grid coordinate
		this.explode = function(x, y) {
			bt.grid.addOnce(x, y, bt.ITEM_TYPE_EXPLOSION);
			bt.grid.currentLevel.complete(x, y, bt.ACTION_DESTROY);
			setTimeout(function() {
				bt.grid.remove(x, y, bt.ITEM_TYPE_EXPLOSION);
				bt.destroyItem(x, y);
				bt.grid.addOnce(x, y, bt.ITEM_TYPE_CRATER);
			}, 700);
		}
		
		// clear all items in grid
		this.clear = function() {
			// remove all tanks
			while(bt.tanks.length > 0) {
				var t = bt.tanks.pop();
				$('#' + t.tankId).remove();
			}
			
			
			for(var x = 0; x < this.MAX_GRID; x++) {
				for(var y = 0; y < this.MAX_GRID; y++) {
					this.mapData[y][x].items.length = 0;
				}
			}
			this.drawGrid();
		}
		
		// load level data into the grid
		this.loadLevel = function(level) {
			bt.stop();
			level.reset();
			this.clear();
			
			// create tank to control
			bt.currentTank = bt.addTank(level.tank.name, level.tank.x, level.tank.y, level.tank.color, level.tank.code);
			
			this.currentLevel = level;
			for(var i = 0; i < level.items.length; i++) {
				var item = level.items[i];
				var x = item[0];
				var y = item[1];
				var type = item[2];
				
				if(type == bt.ITEM_TYPE_TANK) {
					var tankDetails = item[4];				
					bt.addTank(tankDetails.name, x, y, tankDetails.color, tankDetails.code);
				} else {
					this.addOnce(x,y,type);
				}
			}
			level.updateDetails();
			
			// setup tank click handler
			$('.tank').click(function() {
				var tankID = this.id;
				var t = bt.getTankById(tankID);
				t.showCPU();
			})
			
			// set controller
			bt.settings.controller = level.controller;
			bt.setupController();
			$('#objectives').panel('open');
			
		}
		
		// add a grid item if it doesn't already exist
		this.addOnce = function(x, y, itemType) {
			if(this.mapData[y][x].items.indexOf(itemType) == -1) {
				this.mapData[y][x].items.push(itemType);
				this.drawGrid();
			}
		}
		
		// remove item from the grid
		this.remove = function(x, y, itemType) {
			var i = this.mapData[y][x].items.indexOf(itemType);
			if(i != -1) {
				this.mapData[y][x].items.splice(i, 1);
				this.drawGrid();
			}
		}
		
		// setup game
		this.init = function() {
			this.updateStatus("Welcome to BattleTanks");
			this.drawGrid();
			
			// setup tank movement callback timer
			setInterval(this.moveTanks, 1000);
			html = '<div id="welcome"><h3>Welcome to CPU Battle Tanks</h3><p>This puzzle is designed as a teaching aid to help you understand how the Fetch / Execute cycle works inside a Central Processing Unit. </p><p>In the practice level you can use the manual controller to move the tank but the fun starts when you have to write the low level code to control your tank.</p><p>Click on the grid to get started or here for <a href="#help">hints and tips</a></p></div>';			
			$('#dlg').html(html);
			
			
			$('#dlg').popup('open');
		
			// setup CPU clock pulse
			//setInterval(this.clockPulse, 1000);
		};
		
		this.clockPulse = function() {
			for(var i = 0; i < bt.tanks.length; i++) {
				var t = bt.tanks[i];
				var ins = t.cpu.fetch();
				//console.log(t.tankId, t.cpu.explain(ins));
				t.cpu.execute(t.cpu.registers.instruction);
			}
		}
		
		this.moveTanks = function() {
			for(var i = 0; i < bt.tanks.length; i++) {
				var t = bt.tanks[i];
				t.executeNextCommand();
			}
			if(grid.updateCallback)
				grid.updateCallback();
				
			// update grid
			for(var x = 0; x < this.MAX_GRID; x++) {
				for(var y = 0; y < this.MAX_GRID; y++) {
					
				}
			}
		}
		
		// draw the landscape grid
		this.drawGrid =  function() {
			// generate table
			html = '<table class="grid_table" cellspacing="0" cellpadding="0">';
			html += '<td></td>';
			for(var x = 0; x < this.MAX_GRID; x++) {
				html += '<th>' + x + '</th>';
			}
			for(var y = 0; y < this.MAX_GRID; y++) {
				html += '<tr class="grid_row" id="grid_' + y +'">';
				html += '<th>' + y + '</th>';
				for(var x = 0; x < this.MAX_GRID; x++) {
					var itemHTML = '';
					for(var i = 0; i < grid.mapData[y][x].items.length; i++) {
						var item = grid.mapData[y][x].items[i];
						switch(item) {
							case bt.ITEM_TYPE_ROCK:
								itemHTML += '<img class="item" src="media/stone.png" />';
								break;
							case bt.ITEM_TYPE_FUEL:
								itemHTML += '<img class="item" src="media/fuel.gif" />';
								break;
							case bt.ITEM_TYPE_CRATER:
								itemHTML += '<img class="item" src="media/crater.png" />';
								break;
							case bt.ITEM_TYPE_AMMO:
								itemHTML += '<img class="item" src="media/ammo.gif" />';
								break;
							case bt.ITEM_TYPE_CHECKPOINT:
								itemHTML += '<img class="item" src="media/checkpoint.gif" />';
								break;
							case bt.ITEM_TYPE_EXPLOSION:
								itemHTML += '<img class="explosion" src="media/explosion.gif" />';
								break;
							case bt.ITEM_TYPE_STRAW:
								itemHTML += '<img class="item" src="media/straw.png" />';
								break;
							case bt.ITEM_TYPE_WATER:
								itemHTML += '<img class="water item" src="media/water.png" />';
								break;
							case bt.ITEM_TYPE_MINE:
								itemHTML += '<img class="item" src="media/mine.gif" />';
								break;
						}	
					}
					html += '<td class="grid_cell" id="grid_' + x + '_' + y +'">' + itemHTML + '</td>';
				}
				html += '</tr>';
			}
	
			// display table
			html += '</tr>';
			html += '</table>';
			$('#grid').html(html);
			bt.onSettingChange();
			
			// add event handlers
			$('.grid_cell').click(function(e) {
				var data = e.currentTarget.id.split("_");
				var x = data[1];
				var y = data[2];
				
				var html = grid.mapData[y][x].items.length + " item(s) at (" + x + "," + y + "):";
				for(var i = 0; i < grid.mapData[y][x].items.length; i++) {
					switch(grid.mapData[y][x].items[i]) {
					case bt.ITEM_TYPE_ROCK:
							html += '<img class="item_description" src="media/rock.png" />Rock: This acts as an obstacle that you can&#39;t destroy or drive through';
						break;
					case bt.ITEM_TYPE_TANK:
							html += '<img class="item_description" src="media/tank-turret.png" />Tank: This is a tank that you can destroy';
						break;
					case bt.ITEM_TYPE_FUEL:
						html += '<img class="item_description" src="media/fuel.gif" />Fuel dump: Drive your tank here to refuel';
						break;
					case bt.ITEM_TYPE_CRATER:
						html += '<img class="item_description" src="media/crater.png" />Crater: This just means that something has exploded here in the past.';
						break;
					case bt.ITEM_TYPE_STRAW:
						html += '<img class="item_description" src="media/straw.png" />Straw: You can&#39;t drive through straw but you can destroy it and then drive over the crater.';
						break;
					case bt.ITEM_TYPE_EXPLOSION:
						html += '<img class="item_description" src="media/explosion.gif" />Explosion: These should disappear after a second or so, leaving a crater that you can drive over';
						break;
					case bt.ITEM_TYPE_CHECKPOINT:
						html += '<img class="item_description" src="media/checkpoint.gif" />Checkpoint: This marks an area of the grid that you should aim to drive to';
						break;
					case bt.ITEM_TYPE_AMMO:
						html += '<img class="item_description" src="media/ammo.gif" />Ammo dump: Drive your tank here to top up on ammunition';
						break;
					case bt.ITEM_TYPE_WATER:
						html += '<img class="item_description" src="media/water.png" />Water: You can shoot across water but you can&#39;t drive across it';
						break;
					case bt.ITEM_TYPE_MINE:
						html += '<img class="item_description" src="media/mine.gif"/>Land mine: If you drive a tank over this, it will explode';
						break;
					}
				}
				html += ' <a data-icon="check" id="btn_item_desc_ok" data-role="button">OK</a>';
				grid.updateStatus(html);
				$('#btn_item_desc_ok').button().click(function() {
					bt.grid.currentLevel.showNextTask();
				});
			});
			
		};
		
		this.updateStatus = function(text) {
			$("#status_bar").html(text);
		}
	};
	
	// add a new level
	this.addLevel = function(levelDetails) {
		var l = new Level(levelDetails);
		this.levels.push(l);
		return l;
	}
	
	// add a tank to the game
	this.addTank = function(id, x,y, color, code) {
		var html = '<div id="tank_' + id + '" class="tank">\
        	<div class="inner_tank">\
                <img class="tank_base" src="media/tank-base.png" />\
                <div class="tank_top" >\
					<div class="tank_laser"><div class="tank_laser_fire"> </div></div>\
				</div>\
            </div>\
			<div class="tank_quote" id="tank_quote_tank_' + id + '">Click to edit code</div>\
			<div class="tank_spacer"></div>\
			<div class="tank_stats">\
				<div class="tank_color">' + id + '</div>\
				<div class="tank_fuel">Fuel:</div>\
				<div class="tank_ammo">Ammo:</div>\
				<div class="tank_commands">Commands:</div>\
			</div>\
        </div>';
		$('#tanks').append(html);
				
		// create tank
		var tank = new Tank("tank_" + id, x,y, color, this.grid);
		tank.cpu.load(Base64.decode(code));
		
		// change color
		$('#tank_' + id + " .tank_color").css({"background-color": color});


		// add to list of tanks
		bt.tanks.push(tank);
		
		return tank;
	}
	
	// bt objects:
	this.grid = new Grid();
	this.tanks = [];
	this.levels = [];
	this.levelDescriptors = {};
	
	this.describeLevel = function(levelName, description) {
		this.levelDescriptors[levelName] = description;
	}

	this.currentLevel = null;
	this.currentTank = null;
	
	// destroy an at a given position
	this.destroyItem = function(x, y) {
		// destroy tank
		for(var i = 0; i < this.tanks.length; i++) {
			var t = this.tanks[i];
			if(t.x == x && t.y == y) {
				$('#' + t.tankId).remove();
				this.tanks.splice(i, 1);
				break;
			}
		}
		
		// remove item from grid if it can be destroyed
		for(var i = 0; i < this.grid.mapData[y][x].items.length; i++) {
			var itemType = this.grid.mapData[y][x].items[i];
			switch(itemType) {
				case bt.ITEM_TYPE_FUEL:
				case bt.ITEM_TYPE_AMMO:
				case bt.ITEM_TYPE_TANK:
				case bt.ITEM_TYPE_STRAW:
				case bt.ITEM_TYPE_MINE:
					this.grid.mapData[y][x].items.splice(i, 1);
					break;
			}
		}
	}
	
	// see if there's a tank at the specified coordinates. Return null if no tank found
	this.getTankByCoordinates = function(x, y) {
		for(var i = 0; i < this.tanks.length; i++) {
			if((this.tanks[i].x == x) && (this.tanks[i].y == y)) {
				return this.tanks[i];
			}
		}
		return null;
	}
	
	// convenience function to restart current level
	this.restartLevel = function() {
		bt.grid.loadLevel(bt.grid.currentLevel);
	}
	
	// find a tank given its ID
	this.getTankById = function(id) {
		for(var i = 0; i < this.tanks.length; i++) {
			if(this.tanks[i].tankId == id) {
				return this.tanks[i];
			}
		}
	}
	
	// settings
	this.settings = {
		showTankNames: true,
		showFuelDetails: true,
		showAmmoDetails:true,
		showCommandQueue:true,
		showGrid:true,
		controller:this.CONTROLLER_MANUAL,
		runSpeed:10
	}
	
	// add controls
	this.setupController = function() {
		$('.tank_quote').css({'display': (bt.settings.controller == this.CONTROLLER_LITTLE_MAN_COMPUTER? 'block':'none')});
		// setup cpu controller
		if(this.settings.controller == this.CONTROLLER_LITTLE_MAN_COMPUTER) {
			if($('#cpu_controller').length == 0) {
				var step = function(showDetails) {
					for(var i = 0; i < bt.tanks.length; i++) {
						var t = bt.tanks[i];
						var ins = t.cpu.fetch();
						if(showDetails) {
							$('#tank_quote_' +  t.tankId).html('PC:<span class="tank_pc">' + t.cpu.registers.programCounter + '</span>INS:<span class="tank_code">' + ins + '</span>AC:<span class="tank_ac">' + t.cpu.registers.accumulator + '</span><div class="tank_dis">' + t.cpu.disassemble(t.cpu.registers.programCounter) + '</div><div class="tank_explain">' + t.cpu.explain(ins) + '</div>');
						} else {
							$('#tank_quote_' +  t.tankId).html('PC:<span class="tank_pc">' + t.cpu.registers.programCounter + '</span>INS:<span class="tank_code">' + ins + '</span>AC:<span class="tank_ac">' + t.cpu.registers.accumulator + '</span><div class="tank_dis">');
						}
						
						t.cpu.execute(t.cpu.registers.instruction);
					}
				};
				
				$('#controller').html('<div id="cpu_controller"><a data-inline="true" data-icon="check" id="btn_run">Run</a><a data-inline="true" data-icon="forward" id="btn_step">Single step</a><a data-inline="true" data-icon="delete" id="btn_stop">Stop</a><a data-inline="true" data-icon="back" id="btn_reset">Reset</a></div>').unbind();
				
				
				
				// run
				$('#btn_run').button().parent().click(function() {
					bt.stop();
					var ms = 5000 / bt.settings.runSpeed;
					step();
					bt.runInterval = setInterval(function() {
						step(false);
					}, ms);
					
				});
				
				
				
				// stop
				$('#btn_stop').button().parent().click(function() {
					bt.stop();
					
				});
				
				// step
				$('#btn_step').button().parent().click(function() {
					step(true);
					
				});
				
				// reset
				$('#btn_reset').button().parent().click(function() {
					bt.stop();
					$('.tank_quote').html('Waiting...');
					for(var i = 0; i < bt.tanks.length; i++) {
						var t = bt.tanks[i];
						t.cpu.registers.programCounter = 0;
						t.cpu.registers.instruction = 0;
						t.cpu.registers.accumulator = 0;
						t.cpu.registers.programCounter = 0;
						t.cpu.state = this.STATE_FETCH; 
					}
				});
			}
		}
		
		// setup manual controller
		if(this.settings.controller == this.CONTROLLER_MANUAL) {
			if($('#manual_controller').length  == 0) {
				$('.tank_quote').html('Waiting...');
				$('#controller').html('<img id="manual_controller" src="media/controller.png" />').unbind().click(function(e) {
					
					
					function inBox(x, y, left, top, width, height) {
						return((x > left) && (x < left + width) && (y > top) && (y < top + height))? true: false;
					}
					var x  = (e.offsetX || e.clientX - $(e.target).offset().left);
					var y = (e.offsetY || e.clientY - $(e.target).offset().top);
					var t1 = bt.currentTank;
					// move tank
					if(inBox(x, y, 70, 17, 64, 64))  
						t1.addCommand(t1.CMD_MOVE_FORWARDS);
					if(inBox(x, y, 70, 112, 64, 64))  
						t1.addCommand(t1.CMD_MOVE_BACKWARDS);
					if(inBox(x, y, 120, 64, 64, 64))  
						t1.addCommand(t1.CMD_TURN_CLOCKWISE);
					if(inBox(x, y, 20, 64, 64, 64))  
						t1.addCommand(t1.CMD_TURN_ANTICLOCKWISE);
						
					// aim tank
					if(inBox(x, y, 233, 37, 64, 64))  
						t1.addCommand(t1.CMD_AIM_ANTICLOCKWISE);
					if(inBox(x, y, 310, 37, 64, 64))  
						t1.addCommand(t1.CMD_AIM_CLOCKWISE);
					if(inBox(x, y, 274, 86, 64, 64))
						t1.addCommand(t1.CMD_FIRE);
		
	
				});
				
			}
		}
	}
	
	this.onSettingChange = function(e) {
		// show or hide tank details
		$('.tank_color').css({display:(bt.settings.showTankNames?'block':'none')});
		$('.tank_fuel').css({display:(bt.settings.showFuelDetails?'block':'none')});
		$('.tank_ammo').css({display:(bt.settings.showAmmoDetails?'block':'none')});
		$('.tank_commands').css({display:(bt.settings.showCommandQueue?'block':'none')});
		$('.grid_cell').css({"border-width":(bt.settings.showGrid?'1px':'0px'), "border-style":bt.settings.showGrid?"dashed": "grid"});
		$('.tank_quote').css({'display': (bt.settings.controller == this.CONTROLLER_LITTLE_MAN_COMPUTER? 'block':'none')});
		this.setupController();
		
	}
	
	this.stop = function() {
		if(bt.runInterval) {
			clearInterval(bt.runInterval);
			bt.runInterval = 0;
		}
	}
}

var bt = new BattleTank();
