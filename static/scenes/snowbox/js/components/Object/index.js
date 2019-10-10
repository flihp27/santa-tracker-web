import CONFIG from '../SceneManager/config.js'
import { EventEmitter } from '../../event-emitter.js'

class Object extends EventEmitter {
  constructor(scene, world) {
    super()

    this.scene = scene
    this.world = world

    this.selectable = false
    this.selected = false
    this.rotationY = 0
  }

  select() {
    if (this.selectable && !this.selected) {
      this.selected = true
      this.body.mass = 0
      this.body.updateMassProperties()

      if (this.mesh) {
        this.mesh.material.color.set(0xff00ff)
      }

      this.createGhost()
    }
  }

  unselect() {
    if (this.selectable && this.selected) {
      this.selected = false
      this.body.mass = this.mass
      this.body.updateMassProperties()

      if (this.mesh) {
        this.mesh.material.color.set(0x888888)
      }

      if (!this.mesh.visible) {
        this.mesh.visible = true
      }

      this.deleteGhost()
    }
  }

  update() {
    if (this.mesh) {
      this.mesh.position.copy(this.body.position)
      this.mesh.quaternion.copy(this.body.quaternion)

      if (this.ghost) {
        this.ghost.updateMatrixWorld(true)
        this.box.copy(this.ghost.geometry.boundingBox).applyMatrix4(this.ghost.matrixWorld)
      } else {
        this.mesh.updateMatrixWorld(true)
        this.box.copy(this.mesh.geometry.boundingBox).applyMatrix4(this.mesh.matrixWorld)
      }
    }
  }

  rotate(axis, angle) {
    this.rotationY = this.rotationY + angle
    if (this.ghost) {
      this.ghost.quaternion.setFromAxisAngle(axis, this.rotationY)
      this.ghost.quaternion.normalize()
    }
  }

  moveTo(xNew, yNew, zNew) {
    let { x, y, z } = this.ghost.position

    if (xNew != null) {
      x = xNew
    }

    if (yNew != null) {
      y = yNew
    }

    if (zNew != null) {
      z = zNew
    }

    console.log('move ghost', x, y, z)

    this.ghost.position.set(x, y, z)

    this.ghost.updateMatrixWorld(true)
    this.box.copy(this.ghost.geometry.boundingBox).applyMatrix4(this.ghost.matrixWorld)
  }

  updateMeshFromBody() {}

  delete() {
    this.scene.remove(this.mesh)
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.mesh = undefined
    this.world.remove(this.body)
  }

  highlight() {
    if (this.mesh) {
      this.mesh.material.color.set(0xc444c4)
    }
  }

  unhighlight() {
    if (this.mesh) {
      this.mesh.material.color.set(0x888888)
    }
  }

  createGhost() {
    const { geometry, position, quaternion } = this.mesh
    const material = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      opacity: 0.3,
      transparent: true
    })

    this.ghost = new THREE.Mesh(geometry, material)
    this.ghost.position.copy(position)
    this.ghost.quaternion.copy(quaternion)
    this.scene.add(this.ghost)
    this.ghost.geometry.computeBoundingBox()
    console.log('create ghost')
  }

  deleteGhost() {
    if (this.ghost) {
      this.scene.remove(this.ghost)
      this.ghost.geometry.dispose()
      this.ghost.material.dispose()
      this.ghost = undefined
    }
  }

  moveToGhost() {
    console.log('move to ghost')
    const { position, quaternion } = this.ghost
    this.body.position.set(position.x, position.y, position.z)
    this.body.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
  }
}

export default Object
