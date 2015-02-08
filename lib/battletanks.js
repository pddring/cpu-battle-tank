// BattleTanks library
var BattleTank = function() {
	var bt = this;
	
	// item constants
	this.ITEM_TYPE_ROCK = 0;
	this.ITEM_TYPE_TANK = 1;
	this.ITEM_TYPE_FUEL = 2;
	this.ITEM_TYPE_STRAW = 3;
	this.ITEM_TYPE_CRATER = 4;
	this.ITEM_TYPE_CHECKPOINT = 5;
	this.ITEM_TYPE_EXPLOSION = 6;
	
	// action constants
	this.ACTION_STATIC = 0;
	this.ACTION_COLLECT = 1;
	this.ACTION_VISIT = 2;
	this.ACTION_DESTROY = 3;
	
	// Level class - contains details of all obstacles and items in a level
	var Level = function(title, description, items) {
		this.description = description;
		this.title = title;
		this.completedTasks = [];
		this.remainingTasks = [];
		this.staticItems = [];
		this.items = items;
		
		this.updateDetails = function() {
			var html = '';
			var l = bt.grid.currentLevel;
			if(!l)
				html = '<h1>No objectives have been set</h1>';
			else {
				html = '<h1>' + l.title + '</h1>' + l.description;
			
				function processTask(task) {
					var x = task[0];
					var y = task[1];
					var object = task[2];
					var action = task[3];
					var html = "";
					switch(action) {
						case bt.ACTION_COLLECT:
							html += 'Collect';
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
						case bt.ITEM_TYPE_TANK:
							html += ' the tank';
						break;
					}
					
					html += ' at (' + x + ',' + y + ')';
					return html;
				}
				
				html += '<h2>' + l.completedTasks.length + ' tasks completed</h2><ul class="list_tick">';
				for(var i = 0; i < l.completedTasks.length; i++) {
					html += '<li>' + processTask(l.completedTasks[i]) + '</li>';
				}
				html += '</ul>';
				
				html += '<h2>' + l.remainingTasks.length + ' tasks remaining</h2><ul class="list_cross">';
				for(var i = 0; i < l.remainingTasks.length; i++) {
					html += '<li>' + processTask(l.remainingTasks[i]) + '</li>';
				}
				html += '</ul>';
			}
			$('#objectives').html(html);

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

					// add task to completed list
					this.completedTasks.push(task);
					
					// flash objectives panel
					$("#objectives").panel("open");
					setTimeout(function() {
						$("#objectives").panel("close");
					}, 3000);
					
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
			this.completeTasks = [];
			
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
		this.color = color;
		this.grid = grid;
		this.x = x;
		this.y = y;
		this.direction = 0;
		this.gunDirection = 0;
		this.tankId = tankId;
		this.fuel = 10;
		this.ammo = 10;
		this.max_fuel = 10;
		this.max_ammo = 10;
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
		
		// error messages
		this.ERR_OUT_OF_FUEL = "Out of fuel";
		this.ERR_OUT_OF_AMMO = "Out of ammo";
		this.ERR_OBSTACLE = "Cannot move here";
		
		// update tank stats
		this.updateStats = function() {
			if(bt.settings.showFuelDetails)
				$('#' + this.tankId + " .tank_fuel").html('Fuel: ' + this.fuel + "&frasl;" + this.max_fuel);
			if(bt.settings.showAmmoDetails)
				$('#' + this.tankId + " .tank_ammo").html('Ammo: ' + this.ammo + "&frasl;" + this.max_ammo);
			if(bt.settings.showCommandStack) {
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
			<p>Fuel: ' + this.fuel + ' &#47; ' + this.max_fuel + '</p>\
			<p>Ammo: ' + this.ammo + ' &#47; ' + this.max_ammo + '</p>\
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
					dx = -1; dy = 1;
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
						case bt.ITEM_TYPE_FUEL:
						case bt.ITEM_TYPE_OBSTACLE:
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
				bt.grid.addOnce(x, y, bt.ITEM_TYPE_EXPLOSION);
				bt.grid.currentLevel.complete(x, y, bt.ACTION_DESTROY);
				setTimeout(function() {
					bt.grid.remove(x, y, bt.ITEM_TYPE_EXPLOSION);
					bt.destroyItem(x, y);
					bt.grid.addOnce(x, y, bt.ITEM_TYPE_CRATER);
				}, 700);
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
		
		// load level data into the grid
		this.loadLevel = function(level) {
			this.currentLevel = level;
			for(var i = 0; i < level.items.length; i++) {
				var item = level.items[i];
				var x = item[0];
				var y = item[1];
				var type = item[2];
				this.addOnce(x,y,type);
			}
			level.updateDetails();
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
		};
		
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
			for(var y = 0; y < this.MAX_GRID; y++) {
				html += '<tr class="grid_row" id="grid_' + y +'">';
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
			
			// add event handlers
			$('.grid_cell').click(function(e) {
				var data = e.currentTarget.id.split("_");
				var x = data[1];
				var y = data[2];
				
				
				grid.mapData[y][x].items.push(bt.ITEM_TYPE_FUEL);
				grid.drawGrid()
			});
		};
		
		this.updateStatus = function(text) {
			$("#status_bar").text(text);
		}
	};
	
	// add a new level
	this.addLevel = function(title, description, items) {
		var l = new Level(title, description, items);
		this.levels.push(l);
		l.reset();
		return l;
	}
	
	// add a tank to the game
	this.addTank = function(id, x,y, color) {
		var html = '<div id="tank_' + id + '" class="tank">\
        	<div class="inner_tank">\
                <img class="tank_base" src="media/tank-base.png" />\
                <div class="tank_top" >\
					<div class="tank_laser"><div class="tank_laser_fire"> </div></div>\
				</div>\
            </div>\
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

	// index of current level
	this.currentLevel = null;
	
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
				case bt.ITEM_TYPE_TANK:
				case bt.ITEM_TYPE_FUEL:
				case bt.ITEM_TYPE_STRAW:
					this.grid.mapData[y][x].items.splice(i, 1);
					break;
			}
		}
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
		showFuelDetails: false,
		showAmmoDetails:false,
		showCommandStack:false
	}
}