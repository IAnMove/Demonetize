import * as THREE from "three";
import { GAME_CONFIG } from "../core/config";

const CAMERA_LOOK_OFFSET = new THREE.Vector3(0, 0, -1.2);
const CAMERA_OFFSET = new THREE.Vector3(
  0,
  GAME_CONFIG.cameraHeight,
  GAME_CONFIG.cameraDistance
);
const desiredPosition = new THREE.Vector3();
const lookAtTarget = new THREE.Vector3();

export function createCamera(aspectRatio: number): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(55, aspectRatio, 0.1, 120);
  camera.position.copy(CAMERA_OFFSET);
  return camera;
}

export function updateFollowCamera(
  camera: THREE.PerspectiveCamera,
  targetPosition: THREE.Vector3,
  deltaSeconds: number
): void {
  desiredPosition.copy(targetPosition).add(CAMERA_OFFSET);
  const followAlpha =
    1 - Math.exp(-GAME_CONFIG.cameraFollowLerp * deltaSeconds);

  camera.position.lerp(desiredPosition, followAlpha);
  lookAtTarget.copy(targetPosition).add(CAMERA_LOOK_OFFSET);
  camera.lookAt(lookAtTarget);
}
