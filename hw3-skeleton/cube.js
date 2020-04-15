"use strict";

var canvas;
var gl;

var numPositions  = 36;

var positions = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [0, 0, 0];
//same as in the colored cube example


//here are some definitions that may be needed.
var modelMatrix=mat4();
var viewMatrix=mat4();  // view matrix for looking at cube
var projectionMatrix=mat4();
var resultMatrix=mat4();
var identityMatrix=mat4();
var matrixLoc;

var origin=vec3(0,0,0);
var cameraUp=vec3(0,1,0);
var cameraPosition=vec3(0,0,1);
var cameraLookingAtCube=false;
var cameraText;
var useProjection=false;
var usePerspective=false;



window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    colorCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    matrixLoc = gl.getUniformLocation(program, "uMatrix");


	/* todo: define the HTML input elements.
	Hint: you can define a checkbox in HTML like this:

	<input type="checkbox" id="use-perspective">
	  <label for="use-perspective">Use perspective</label>
	</input>

	And a button like this:
	<button id= "look-at-cube">Look at cube</button>

	You can add text in HTML like this : <p id="camera-text">Camera location:</p>
	*/

	//todo: add event listeners for conrtolling the camera and cube, and switching between options.
	//1. controlling the position of the camera and orientation of the cube
	//2. switching between looking at the cube and at the default direction
	//3. switching between camera projections (extra credit)

	//examples:
	//document.getElementById( "look-at-cube" ).onclick = function (e) {};
	//document.getElementById( "use-projection" ).onchange = function (e) {};

	//hint: inside an event hander function, "this" refers to the HTML element of the event. You can use this.textContent="..." to change the text of a button.
  //hint: inside the event handler function of a checkbox, this.checked is the boolean checked state of the checkbox.

    //event listeners for switching between looking at cube/looking at -z
    document.getElementById('look-at-cube').onclick = function() {
      var lookingAtCube = document.getElementById('look-cube');
      if(cameraLookingAtCube)
      { // change to look at -z
        origin = add(cameraPosition, vec3(0,0,-1));
        cameraLookingAtCube = false;
        this.textContent = "Click to look at cube";
        lookingAtCube.textContent = "Looking at cube: false";
      }
      else
      { // change to look at cube
        cameraLookingAtCube = true;
        this.textContent = "Click to look at -z";
        lookingAtCube.textContent = "Looking at cube: true";
      }
    }

    document.getElementById( "use-projection" ).onchange = function () {
      useProjection = !useProjection;
      console.log("uproj = " + useProjection);
    };
    document.getElementById( "use-perspective" ).onchange = function () {
      usePerspective = !usePerspective;
      console.log("upers = " + usePerspective);
    };

	// TODO: keys to control the camera and cube for example. You can also use the mouse or sliders.
  //hint: using sensible change rates and limits help prevent moving the cube out of the camera's view.
  //      Note components of theta are in degrees.
	//hint: without a projection, the visible area in the frame of the camera is a cube from -1 to 1 in
  //      x, y and z coordinates. This means the distance from the camera to any face of the cube
  //      should be less than 1 for it to be visible, for example.

	//example: document.addEventListener("keydown",function(e){ ... });
	//hint: you can use conditions like if(e.key=="a") or if(e.keyCode==37). You can look up key codes, or use console.log(e.keyCode) in this listener to see what's the code of a key you press.
	//hint: after changing the cube or camera's frame, call render() again.

  document.addEventListener("keydown",function(e){
    // cube controls
		if(e.keyCode == 37){  //left
      axis = xAxis;
      theta[axis] -= 2.0;
		}
		if(e.keyCode == 39){  //right
      axis = xAxis;
      theta[axis] += 2.0;
		}
		if(e.keyCode == 38){  //up
      axis = yAxis;
      theta[axis] += 2.0;
		}
		if(e.keyCode == 40){  //down
      axis = yAxis;
      theta[axis] -= 2.0;
		}
    // camera controls
    if(e.keyCode == 83){  // W down
      axis = yAxis;
      if( cameraPosition[axis]+0.1 < 1 )
        cameraPosition[axis] += 0.1;
      else cameraPosition[axis] = 1;
    }
    if(e.keyCode == 68){  // A right
      axis = xAxis;
      if( cameraPosition[axis]-0.1 > -1 )
        cameraPosition[axis] -= 0.1;
      else cameraPosition[axis] = -1;
    }
    if(e.keyCode == 87){  // S up
      axis = yAxis;
      if( cameraPosition[axis]-0.1 > -1 )
        cameraPosition[axis] -= 0.1;
      else cameraPosition[axis] = -1;
    }
    if(e.keyCode == 65){  // D left
      axis = xAxis;
      if( cameraPosition[axis]+0.1 < 1 )
        cameraPosition[axis] += 0.1;
      else cameraPosition[axis] = 1;
    }
    if(e.keyCode == 81){  // Q +z-axis
      axis = zAxis;
      if( cameraPosition[axis]+0.1 < 1 )
        cameraPosition[axis] += 0.1;
      else cameraPosition[axis] = 1;
		}
    if(e.keyCode == 69){  // E -z-axis
      axis = zAxis;
      if( cameraPosition[axis]-0.1 > -1 )
        cameraPosition[axis] -= 0.1;
      else cameraPosition[axis] = -1;
		}
    console.log("axis of change: " + axis);
    cameraText = document.getElementById("camera-text");
    cameraText.textContent="> Camera position: " + -cameraPosition[0] + ", "
                                               + -cameraPosition[1] + ", "
                                               + cameraPosition[2]
    render();
	});


	//todo: show the camera position and direction(whether it's looking at the cube) in text.
	//hint: You can set the text like this:
	//cameraText = document.getElementById("camera-text"); cameraText.textContent="..."

    render();
}

function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0)   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//todo: compute the model matrix here instead of in the shader
	//modelMatrix=...
	//hint: you can use rotateX, rotateY and rotateZ to get matrices and combine them.
  var mx = rotateX(theta[xAxis]);
  var my = rotateY(theta[yAxis]);
  var mz = rotateZ(theta[zAxis]);
  modelMatrix = mult(mult(mx, my), mz);

	//todo:
	//1. compute the view matrix when the camera is pointing at the -z direction.
	//hint: here the view matrix is the inverse of the camera matrix,
  //      which is a translation from the origin to the position of
  //      the camera(by default the camera is already looking towards
  //      the -z direction if you don't rotate it). Then combine the
  //      model and view matrices. There's a function translate( x, y, z ).
  if( !cameraLookingAtCube )
  {
    // calculate the camera matrix
    var x = origin[0]-cameraPosition[0];
    var y = origin[1]-cameraPosition[1];
    var z = origin[2]-cameraPosition[2];
    var camMatrix = translate(x,y,z);
    viewMatrix = inverse(camMatrix);
  }
	//2. add support for looking at the cube
	//hint: there's a function lookAt( eye, at, up ). We want the camera (eye) to look at the center of the cube.
  else
  {
    viewMatrix = lookAt(cameraPosition, origin, cameraUp);
  }
	//3. add orthographic or perspective projection if it's enabled, and multiply the projection matrix with the model-view matrix.
	//hint: there are functions perspective( fovy, aspect, near, far ) and ortho( left, right, bottom, top, near, far ).
  if( useProjection )
  {
    if( usePerspective )  // perspective camera
    {
    //  projectionMatrix = perspective();
      console.log("perspective");
    }
    else          // use orthographic camera
    {
      projectionMatrix = ortho(-1.5,1.5,-1.5,1.5,1.5,-1.5);
      console.log("orthographic");
    }
    modelMatrix = mult(projectionMatrix, modelMatrix);
  }
  resultMatrix = mult(viewMatrix,modelMatrix);
	//set the matrix uniform - flatten() already transposes into column-major order.
	gl.uniformMatrix4fv(matrixLoc, false, flatten(resultMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    requestAnimationFrame(render);
}
