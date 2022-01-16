// Helper libs. Go to line 105 for the actual implementation.
class Vector {
  constructor(x, y) {
    this._compute(x, y)
  }
  _compute(x, y) {
    this.x = x
    this.y = y
    this.angle = Math.atan2(y, x)
    this.length = Math.sqrt(x * x + y * y)
  }
  setAngle(angle) {
    this.angle = angle
    this.x = Math.cos(this.angle) * this.length
    this.y = Math.sin(this.angle) * this.length
  }
  setLength(length) {
    this.length = length
    this.x = Math.cos(this.angle) * this.length
    this.y = Math.sin(this.angle) * this.length
  }
  add(v) {
    this._compute(this.x + v.x, this.y + v.y)
  }
  multiply(scalar) {
    this._compute(this.x * scalar, this.y * scalar)
  }
}

class Particle {
  constructor({
    radius,
    position,
    velocity = new Vector(0, 0),
    gravity = 0,
    mass = 1,
    friction = 0.99,
    update = true
  }) {
    this.radius = radius
    this.position = position
    this.velocity = velocity
    this.mass = mass
    this.gravity = new Vector(0, gravity)
    this.friction = friction
    this.update = update
  }

  angleTo(p) {
    return Math.atan2(
      p.position.y - this.position.y,
      p.position.x - this.position.x
    )
  }

  distanceTo(p) {
    const dx = p.position.x - this.position.x
    const dy = p.position.y - this.position.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  updatePosition() {
    if (this.update) {
      this.velocity.add(this.gravity)
      this.position.add(this.velocity)
    }
  }

  render(ctx) {
    ctx.beginPath()
    ctx.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      2 * Math.PI,
      false
    )

    ctx.fill()
  }

  screenWrap(width, height) {
    if (this.update) {
      const { x, y } = this.position
      // Left boundary.
      if (x + this.radius < 0) {
        this.position.x = width + this.radius
      }
      // Right boundary.
      if (x - this.radius > width) {
        this.position.x = 0 - this.radius
      }
      // Top boundary.
      if (y + this.radius < 0) {
        this.position.y = height + this.radius
      }
      // Bottom boundary.
      if (y - this.radius > height) {
        this.position.y = 0 - this.radius
      }
    }
  }
}

// Where the actual magic happens.
const particleColors = ['#00ACC0', '#40da11', '#ff5100']
const backgroundRgb = {
  r: 23,
  g: 24,
  b: 29
}

const PARTICLE_COUNT = 500
const particles = []
const canvas = document.getElementById('landing-canvas')
const ctx = canvas.getContext('2d')
const { width: canvasWidth, height: canvasHeight } =
  canvas.getBoundingClientRect()
canvas.width = canvasWidth
canvas.height = canvasHeight

initializeParticles()

render()

/**
 * Create the particles and spring points based on the pixel positions in the canvas.
 */
function initializeParticles() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const velocity = new Vector(0, 0)
    velocity.setAngle(Math.random() * 2 * Math.PI)
    velocity.setLength(1)
    const particle = new Particle({
      radius: 1,
      position: new Vector(
        Math.round(Math.random() * canvasWidth),
        Math.round(Math.random() * canvasHeight)
      ),

      velocity
    })

    particles.push(particle)
  }
}

/**
 * Renders the particles on the screen.
 */
function render() {
  effectLongTrails()
  requestAnimationFrame(render)
}

function effectLongTrails() {
  // Clear the canvas.
  ctx.fillStyle = `rgba(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b}, .01)`
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  // For each particle within the limit.
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = particles[i]
    ctx.fillStyle = particleColors[i % particleColors.length]
    particle.render(ctx)
    particle.screenWrap(canvasWidth, canvasHeight)
    particle.updatePosition()
    particle.velocity.x += Math.random() > 0.5 ? 0.01 : -0.01
    particle.velocity.y += Math.random() > 0.5 ? 0.01 : -0.01
  }
}
