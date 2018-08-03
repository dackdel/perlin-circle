var segments = [];
var particles = [];
var helpers = []
var showHelpers = false;
var definition = 8;
var MASS = 25;
var MAXSPEED = 1.5;
var distortRadius;
console.log(view.viewSize);
var radius;
var color, color2, path, distortStrength, circle, gradient;
var isMobile;
var gradientDestination;
var time = Math.random() * 360;


var init = function() {
    console.log("time", time)


    if (window.innerWidth < window.innerHeight) {
        isMobile = true;
        view.viewSize = new Size(window.innerWidth, window.innerWidth);

    } else {
        isMobile = false;
        view.viewSize = new Size(window.innerWidth, window.innerHeight);
    }

    if (isMobile) {
        radius = view.viewSize.width / 3.2;
        gradientDestination = view.bounds.leftCenter;
        distortRadius = 50;
    } else {
        radius = view.viewSize.height / 3.2;
        gradientDestination = view.bounds.bottomCenter;
        distortRadius = 100;
    }


    if (isMobile) {
        distortStrength = 0;
    } else {
        distortStrength = 0;
    }
    var randomHue = Math.sin(time) * 360;

    color = new Color({
        hue: randomHue,
        saturation: 1,
        brightness: 1,
        alpha: 0.75
    });

    color2 = new Color({
        hue: randomHue + 20,
        saturation: 1,
        brightness: 1,
        alpha: 0.75

    });

    noise.seed(Math.random());



    gradient = {
        sunset: {
            gradient: {
                stops: [
                    [color, 0],
                    [color, 0.65],
                    ['rgba(255,255,255,0)', 1]
                ],
                radial: true,
            },
            origin: view.bounds.center,
            destination: gradientDestination
        },

    };

    gradient.sunset.gradient.stops[0][0].hue = Math.sin(time) * 360;
    //gradient.sunset.gradient.stops[1][0].hue = Math.sin(time*0.0001 - 40)*360;

    for (var i = 0; i <= definition - 1; i++) {
        var point = new Point(Math.sin(i / (definition / Math.PI / 2)) * radius + view.bounds.center.x, Math.cos(i / (definition / Math.PI / 2)) * radius + view.bounds.center.y);
        segments[i] = point;
        particles[i] = new Particle(point);
        if (showHelpers) {
            var helper = new Path.Circle(point, 3);
            helper.fillColor = "red";
            helpers[i] = helper;
        }
    }
    path = new Path.Rectangle(view.bounds.topLeft, view.bounds.bottomRight);
    circle = new Path(segments);
    path.strokeColor = 'black';
    //path.selected = true;
    // Fill the line stroke with a gradient of two color stops
    path.fillColor = gradient.sunset;
    //path.strokeWidth = 505;
    path.smooth();
    circle.fillColor = 'white';

    circle.closed = true;
    // circle.selected = true;
    circle.smooth();
    // path.strokeColor = 'black';
    mouse = new Point(view.bounds.center.x, view.bounds.center.y);
    for (var i = helpers.length - 1; i >= 0; i--) {
        helpers[i].bringToFront();
    }

    //onframe

}

init();

function onMouseMove(event) {
    mouse = event.point;

}

function onFrame(event) {

    time += 0.0005;
    console.log(time);
    for (var i = circle.segments.length - 1; i >= 0; i--) {
        circle.segments[i].point = particles[i].p;
        var target = new Point();
        target.x = Math.sin(i / (definition / Math.PI / 2)) * radius + view.bounds.center.x + noise.perlin2(time, i) * distortStrength;
        target.y = Math.cos(i / (definition / Math.PI / 2)) * radius + view.bounds.center.y + noise.perlin2(i, time) * distortStrength;
        //path.segments[i].point.x += noise.perlin2(Math.cos(i/(definition/Math.PI/2)),i/100)*0.5;
        if (showHelpers) {
            helpers[i].position = target;
        }
        //if ((target - particles[i].p).length > 50 ){
        particles[i].arrive(target);
        //}
        var dist = circle.segments[i].point - mouse;
        var dir = dist * 1;
        //console.log(mouse);

        //console.log(dist.length);
        if (dist.length < distortRadius) {
            //console.log("mouseATTRACT");
            particles[i].arrive(mouse);
            // circle.segments[i].point.x -= dist.x*2/dist.length;
            // circle.segments[i].point.y -= dist.y*2/dist.length;
        }

        //particles[i].seek(mouse);
        //console.log(target);
        //particles[i].seek(view.bounds.center);
        particles[i].update();

    }
    console.log(gradient.sunset.gradient.stops[0][0].hue);
    gradient.sunset.gradient.stops[0][0].hue = Math.sin(time) * 360;
    //gradient.sunset.gradient.stops[0][0].brightness += 0.005;
    gradient.sunset.gradient.stops[1][0].hue = Math.sin(time - 40) * 360;
    //gradient.sunset.gradient.stops[1][0].brightness += 0.005;

    path.fillColor = gradient.sunset;



}




function onResize(event) {
    if (true) {
        gradient = {};
        project.clear()
        init();
    }


}


function Particle(point) {
    this.p = point;
    this.v = new Point(0, 0);
    this.a = new Point(0, 0);
    this.mass = MASS;
    this.maxspeed = MAXSPEED;
    this.maxforce = 200;
    this.applyForce = function(force) {
        //console.log(force);
        var f = force / this.mass;
        this.a = this.a + f;
        //console.log(this.a);
    }
    this.friction = function() {
        var c = 0.1;
        var friction = this.v;
        friction = friction * -1;
        friction.normalize();
        friction = friction * c;
        //console.log("f",friction)
        this.applyForce(friction);
    }
    this.turbulence = function(index, s) {
        var s = 25;
        //console.log("noise", noise.perlin2(time,index));
        //console.log("mapped", map(noise.perlin2(time,index),0,1,0,s));
        //this.applyForce(map(noise.perlin2(time,index),-1,1,-s,s), map(noise.perlin2(index,time),-1,1,-s,s));
        //this.applyForce(0,1);
    }
    this.seek = function(target) {
        //var desired = new Point();
        var desired = target.subtract(this.p);
        //console.log("desired",desired);
        var d = desired.length;
        desired.normalize();

        // Calculating the desired velocity
        // to target at max speed
        desired = desired * 0.01;
        // Reynolds’s formula for steering force
        // var steer = new Point();
        var seek = desired - this.v;
        // if(steer.length > 1) {
        //     steer.normalize(1);
        // }
        //console.log(seek);
        // Using our physics model and applying the force
        // to the object’s acceleration
        //seek.normalize().multiply(Math.min(this.length, 1))
        if (seek.length > this.maxforce) {
            seek = seek.normalize() * this.maxforce;
        }
        this.applyForce(seek);

    }
    this.arrive = function(target) {
        var desired = target.subtract(this.p);
        // The distance is the magnitude of
        // the vector pointing from
        // location to target.
        var d = desired.length;
        // console.log(d);

        // If we are closer than 100 pixels...
        if (d < 100) {
            //[full] ...set the magnitude
            // according to how close we are.
            var m = map(d, 0, 100, 0, this.maxspeed);
            //console.log("d",d);
            //console.log("m",m);
            desired = desired.normalize() * m;
            //[end]
        } else {
            // Otherwise, proceed at maximum speed.
            desired = desired.normalize() * this.maxspeed;
        }
        // The usual steering = desired - velocity
        var steer = desired - this.v;
        //steer.normalize(this.maxforce);
        // var pointMax = steer.clone().normalize(this.maxforce);

        // var minPoint = Point.min(steer, pointMax);
        if (steer.length > this.maxforce) {
            steer = steer.normalize() * this.maxforce;
        }
        this.applyForce(steer);
        this.friction();
    }
    this.update = function() {
        //this.friction();
        this.v = this.v + this.a;
        if (this.v.length > this.maxspeed) {
            this.v = this.v.normalize() * this.maxspeed;
        }
        //console.log("v",this.v.length);
        this.p = this.p + this.v;
        this.a.multiply(0);
    };
}

function map(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}