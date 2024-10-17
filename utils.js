function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
        0.17677669, -0.28661165, 0.7391989, 0.3,
        0.30618623, 0.36959946, 0.2803301, -0.25,
        -0.35355338, 0.17677669, 0.61237246, 0,
        0, 0, 0, 1
    ]);
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
   
   let modelViewMatrix = createIdentityMatrix();

  
   const angles = {
       x: (30 * Math.PI) / 180,  
       y: (45 * Math.PI) / 180,  
       z: (60 * Math.PI) / 180   
   };

   // Rotation matrices in Z -> Y -> X order
   const rotationMatrices = [
       createRotationMatrix_Z(angles.z),
       createRotationMatrix_Y(angles.y),
       createRotationMatrix_X(angles.x)
   ];

   // Apply all rotations
   rotationMatrices.forEach((rotationMatrix) => {
       modelViewMatrix = multiplyMatrices(modelViewMatrix, rotationMatrix);
   });

   // Scale matrix 
   const scaleFactors = { x: 0.5, y: 0.5, z: 1.0 };
   const scaleMatrix = createScaleMatrix(scaleFactors.x, scaleFactors.y, scaleFactors.z);
   modelViewMatrix = multiplyMatrices(modelViewMatrix, scaleMatrix);

   // Translation matrix 
   const translationOffset = { x: 0.3, y: -0.25, z: 0.0 };
   const translationMatrix = createTranslationMatrix(translationOffset.x, translationOffset.y, translationOffset.z);
   modelViewMatrix = multiplyMatrices(modelViewMatrix, translationMatrix);

   return new Float32Array(modelViewMatrix);
}

/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */

// Helper function to linearly interpolate between two matrices
function linearInterpolateMatrices(matrix1, matrix2, t) {
    const result = [];
    for (let i = 0; i < matrix1.length; i++) {
        result[i] = matrix1[i] * (1 - t) + matrix2[i] * t;
    }
    return result;
}
function getPeriodicMovement(startTime) {
    const duration = 10000; // 10 seconds for a complete cycle (5s forward, 5s backward)
    
    // Get the current time and calculate the elapsed time since the start
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    
    // Calculate progress within the current cycle (0 to 1, where 0.5 is the halfway point)
    const progress = (elapsed % duration) / duration;
    
    // Initialize matrices
    const identityMatrix = createIdentityMatrix(); // Initial matrix (identity matrix)
    const targetMatrix = getModelViewMatrix();  // Target matrix (final transformation)
    
    let currentMatrix = [];
    
    if (progress <= 0.5) {
        // First half of the cycle: Interpolate from identity to target
        const t = progress * 2; // Normalize progress for forward movement (0 to 1)
        currentMatrix = linearInterpolateMatrices(identityMatrix, targetMatrix, t);
    } else {
        // Second half of the cycle: Interpolate from target back to identity
        const t = (progress - 0.5) * 2; // Normalize progress for backward movement (1 to 0)
        currentMatrix = linearInterpolateMatrices(targetMatrix, identityMatrix, t);
    }
    
    // Return the calculated matrix for the current time
    return new Float32Array(currentMatrix);
}

