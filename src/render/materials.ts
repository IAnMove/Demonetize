import * as THREE from "three";

export function createArenaMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0b1022"),
    roughness: 0.72,
    metalness: 0.18,
    emissive: new THREE.Color("#071625"),
    emissiveIntensity: 0.9
  });
}

export function createNeonMaterial(
  color: string,
  emissiveIntensity = 1.8
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity,
    roughness: 0.28,
    metalness: 0.1
  });
}
