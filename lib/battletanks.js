// BattleTanks library
var BattleTank = function() {
	var bt = this;
	
	this.ITEM_TYPE_ROCK = 0;
	this.ITEM_TYPE_TANK = 1;
	this.ITEM_TYPE_FUEL = 2;
	this.ITEM_TYPE_STRAW = 3;
	
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
		
		// movement commands stack
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
		
		// add a command to the stack
		this.addCommand = function(command) {
			this.commands.push(command);
			this.updateStats();
			return this.commands;
		}
		
		// execute next command from the stack
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
			var h = (((this.gunDirection % 2) == 0)?64:91) * this.laser_range;
			jq.css({height:h, opacity:0.8});
			setTimeout(function() {
				jq.css({height:0, opacity:0});
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
			this.x = x;
			this.y = y;
			
			// get destination position
			var pos = $('#grid_' + x + '_' + y).position();
			$('#' + tankId).css({left:pos.left, top:pos.top});
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

	var Grid = function(size){
		var grid = this;
		if(undefined === size)
			size = 15;
			
		this.MAX_GRID = size;
		this.MIN_GRID = 0;
		this.updateCallback = null;
		
		// initialise map data 
		this.mapData = [];
		for(var y = 0; y < this.MAX_GRID; y++) {
			var row = [];
			for(var x = 0; x < this.MAX_GRID; x++) {
				row.push(new GridSquare(x,y));
			}
			this.mapData.push(row);
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
								itemHTML += '<img src="media/stone.png" />';
							break;
							case bt.ITEM_TYPE_FUEL:
								itemHTML += '<img src="media/fuel.gif" />';
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