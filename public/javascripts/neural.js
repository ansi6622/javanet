//node constructor, assigns itself properties
var Node = function(object) {
    for (var key in object)
    {
        this[key] = object[key];
    }
};
//constructed nodes determine distance by iterating through all nodes' neighbors obj (as a property of a node)
Node.prototype.measureDistances = function(area_range_obj, rooms_range_obj) {
    var rooms_range = rooms_range_obj.max - rooms_range_obj.min;
    var area_range  = area_range_obj.max  - area_range_obj.min;

    for (var i in this.neighbors)
    {
        /* Just shortcut syntax */
        var neighbor = this.neighbors[i];

        var delta_rooms = neighbor.personheight - this.personheight;
        delta_rooms = (delta_rooms ) / rooms_range;

        var delta_area  = neighbor.personweight  - this.personweight;
        delta_area = (delta_area ) / area_range;
        //sets distance property to each neighbor of each node
        neighbor.distance = Math.sqrt( delta_rooms*delta_rooms + delta_area*delta_area );
    }
};
//constructed nodes sort their neighbors distances relative to them in order
Node.prototype.sortByDistance = function() {
    this.neighbors.sort(function (a, b) {
        return a.distance - b.distance;male_normal
    });
};
//CN's can guess flat, apt, or home with this logic
//allows neighbours MORE HERE PLEASE
Node.prototype.guessType = function(k) {
    var types = {};

    for (var i in this.neighbors.slice(0, k))
    {
        var neighbor = this.neighbors[i];

        if ( ! types[neighbor.type] )
        {
            types[neighbor.type] = 0;
        }

        types[neighbor.type] += 1;
    }

    var guess = {type: false, count: 0};
    for (var type in types)
    {
        if (types[type] > guess.count)
        {
            guess.type = type;
            guess.count = types[type];
        }
    }

    this.guess = guess;

    return types;
};


//create array of nodes for nodelist, create k property for nodelist
var NodeList = function(k) {
    this.nodes = [];
    this.k = k;
};
//adds nodes to the nodelist
NodeList.prototype.add = function(node) {
    this.nodes.push(node);
};
//allows nodelists to determine if a data point has been identified yet
NodeList.prototype.determineUnknown = function() {

    this.calculateRanges();

    /*
     * Loop through our nodes and look for unknown types.
     */
    for (var i in this.nodes)
    {

        if ( ! this.nodes[i].type)
        {
            /*
             * If the node is an unknown type, clone the nodes list and then measure distances.
             */

            /* Clone nodes */
            this.nodes[i].neighbors = [];
            for (var j in this.nodes)
            {
                if ( ! this.nodes[j].type)
                    continue;
                this.nodes[i].neighbors.push( new Node(this.nodes[j]) );
            }

            /* Measure distances */
            this.nodes[i].measureDistances(this.personweight, this.personheight);

            /* Sort by distance */
            this.nodes[i].sortByDistance();

            /* Guess type */
            this.nodes[i].guessType(this.k);

        }
    }
};
NodeList.prototype.calculateRanges = function() {
    this.personweight = {min: 1000000, max: 0};
    this.personheight = {min: 1000000, max: 0};
    for (var i in this.nodes)
    {
        if (this.nodes[i].personheight < this.personheight.min)
        {
            this.personheight.min = this.nodes[i].personheight;
        }

        if (this.nodes[i].personheight > this.personheight.max)
        {
            this.personheight.max = this.nodes[i].personheight;
        }

        if (this.nodes[i].personweight < this.personweight.min)
        {
            this.personweight.min = this.nodes[i].personweight;
        }

        if (this.nodes[i].personweight > this.personweight.max)
        {
            this.personweight.max = this.nodes[i].personweight;
        }
    }

};
//methods and shit for rendering the nodelist to html5 canvas
NodeList.prototype.draw = function(canvas_id) {
    var rooms_range = this.personheight.max - this.personheight.min;
    var areas_range = this.personweight.max - this.personweight.min;

    var canvas = document.getElementById(canvas_id);
    var ctx = canvas.getContext("2d");
    var width = 400;
    var height = 400;
    ctx.clearRect(0,0,width, height);

    for (var i in this.nodes)
    {
        ctx.save();

        switch (this.nodes[i].type)
        {
            case 'male_underweight':
                ctx.fillStyle = 'rgb(90,70,120)';
                break;
            case 'female_underweight':
                ctx.fillStyle = 'rgb(200,10,120)';
                break;
            case 'male_normal':
                ctx.fillStyle = 'green';
                break;
            case 'female_normal':
                ctx.strokeStyle = 'green';
                break;
            case 'male_overweight':
                ctx.strokeStyle = 'rgb(190,60,60)';
                break;
            case 'female_overweight':
                ctx.strokeStyle = 'rgb(170,0,0)';
                break;
            default:
                ctx.fillStyle = 'blue';
        }

        var padding = 40;
        var x_shift_pct = (width  - padding) / width;
        var y_shift_pct = (height - padding) / height;

        var x = (this.nodes[i].personheight - this.personheight.min) * (width  / rooms_range) * x_shift_pct + (padding / 2);
        var y = (this.nodes[i].personweight  - this.personweight.min) * (height / areas_range) * y_shift_pct + (padding / 2);
        y = Math.abs(y - height);


        ctx.translate(x, y);
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI*2, true);
        ctx.fill();
        ctx.closePath();


        /*
         * Is this an unknown node? If so, draw the radius of influence
         */

        if ( ! this.nodes[i].type )
        {
            switch (this.nodes[i].guess.type)
            {
                case 'male_underweight':
                    ctx.fillStyle = 'rgb(90,70,120)';
                    break;
                case 'female_underweight':
                    ctx.fillStyle = 'rgb(200,10,120)';
                    break;
                case 'male_normal':
                    ctx.fillStyle = 'green';
                    break;
                case 'female_normal':
                    ctx.strokeStyle = 'rgb(30,60,160)';
                    break;
                case 'male_overweight':
                    ctx.strokeStyle = 'orange';
                    break;
                case 'female_overweight':
                    ctx.strokeStyle = 'rgb(170,0,0)';
                    break;
                default:
                    ctx.fillStyle = 'gold';
            }

            var radius = this.nodes[i].neighbors[this.k - 1].distance * width;
            radius *= x_shift_pct;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI*2, true);
            ctx.stroke();
            ctx.closePath();

        }

        ctx.restore();

    }

};



var nodes;

var data = [
    {personheight: 66, personweight: 115, type: 'male_underweight'},
    {personheight: 72, personweight: 145, type: 'male_underweight'},
    {personheight: 63, personweight: 107, type: 'male_underweight'},
    {personheight: 74, personweight: 133, type: 'male_underweight'},
    {personheight: 74, personweight: 168, type: 'male_underweight'},
    {personheight: 68, personweight: 128, type: 'male_underweight'},
    {personheight: 69, personweight: 137, type: 'male_underweight'},

    {personheight: 57,  personweight: 67,  type: 'female_underweight'},
    {personheight: 67,  personweight: 115,  type: 'female_underweight'},
    {personheight: 66,  personweight: 117, type: 'female_underweight'},
    {personheight: 62,  personweight: 99, type: 'female_underweight'},
    {personheight: 60,  personweight: 85, type: 'female_underweight'},
    {personheight: 69,  personweight: 127, type: 'female_underweight'},
    {personheight: 61, personweight: 94, type: 'female_underweight'},
    {personheight: 65,  personweight: 110, type: 'female_underweight'},

    {personheight: 72, personweight: 165,  type: 'male_normal'},
    {personheight: 71, personweight: 172,  type: 'male_normal'},
    {personheight: 70, personweight: 156,  type: 'male_normal'},
    {personheight: 68, personweight: 146,  type: 'male_normal'},
    {personheight: 74, personweight: 174, type: 'male_normal'},
    {personheight: 67, personweight: 135, type: 'male_normal'},
    {personheight: 66, personweight: 142, type: 'male_normal'},
    {personheight: 69, personweight: 144, type: 'male_normal'},

    {personheight: 59, personweight: 95,  type: 'female_normal'},
    {personheight: 63, personweight: 116,  type: 'female_normal'},
    {personheight: 62, personweight: 99,  type: 'female_normal'},
    {personheight: 61, personweight: 107,  type: 'female_normal'},
    {personheight: 62, personweight: 116, type: 'female_normal'},
    {personheight: 67, personweight: 128, type: 'female_normal'},
    {personheight: 72, personweight: 153, type: 'female_normal'},
    {personheight: 68, personweight: 132, type: 'female_normal'},
    {personheight: 64, personweight: 108, type: 'female_normal'},


    {personheight: 71, personweight: 200,  type: 'male_overweight'},
    {personheight: 73, personweight: 207,  type: 'male_overweight'},
    {personheight: 62, personweight: 135,  type: 'male_overweight'},
    {personheight: 71, personweight: 320,  type: 'male_overweight'},
    {personheight: 68, personweight: 184, type: 'male_overweight'},
    {personheight: 69, personweight: 183, type: 'male_overweight'},
    {personheight: 66, personweight: 157, type: 'male_overweight'},
    {personheight: 70, personweight: 187, type: 'male_overweight'},

    {personheight: 61, personweight: 120,  type: 'female_overweight'},
    {personheight: 63, personweight: 130,  type: 'female_overweight'},
    {personheight: 62, personweight: 123,  type: 'female_overweight'},
    {personheight: 66, personweight: 145,  type: 'female_overweight'},
    {personheight: 72, personweight: 179, type: 'female_overweight'},
    {personheight: 59, personweight: 110, type: 'female_overweight'},
    {personheight: 67, personweight: 152, type: 'female_overweight'},
    {personheight: 68, personweight: 159, type: 'female_overweight'},

    {personheight: 100, personweight: 200,  type: 'the_weirdness'},
    {personheight: 95, personweight: 210,  type: 'the_weirdness'},
    {personheight: 95, personweight: 190,  type: 'the_weirdness'},
    {personheight: 105, personweight: 185,  type: 'the_weirdness'},
    {personheight: 105, personweight: 215, type: 'the_weirdness'},
    {personheight: 90, personweight: 200, type: 'the_weirdness'},
    {personheight: 110, personweight: 210, type: 'the_weirdness'},
    {personheight: 110, personweight: 190, type: 'the_weirdness'},
    {personheight: 100, personweight: 99,  type: 'the_weirdness'},
    {personheight: 95, personweight: 98,  type: 'the_weirdness'},
    {personheight: 95, personweight: 107,  type: 'the_weirdness'},
    {personheight: 105, personweight: 100,  type: 'the_weirdness'},
    {personheight: 105, personweight: 213, type: 'the_weirdness'},
    {personheight: 90, personweight: 202, type: 'the_weirdness'},
    {personheight: 110, personweight: 99, type: 'the_weirdness'},
    {personheight: 110, personweight: 98, type: 'the_weirdness'}
];
var run = function() {
    var count = 0;
    nodes = new NodeList(3);
    for (var i in data)
    {
        count = count + 1;
        nodes.add( new Node(data[i]) );
    }
    var random_rooms = function(min, max){
      return Math.round((Math.random() * (max - min) + min) * 100);
   }
    var random_area = function(min, max){
      return Math.round((Math.random() * (max - min) + min) * 1000);
    }
    nodes.add( new Node({personheight: random_rooms(0.56,0.75), personweight: random_area(0.08,0.2), type: false}) );
    nodes.determineUnknown();
    nodes.draw("canvas");
    console.log(count);
};

// run() every 5 seconds
setInterval(run, 1000);
run();
