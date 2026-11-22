import test from "node:test";
import assert from "node:assert/strict";
import * as T from "three";
import { batchStatic, box } from "../src/models.js";

test("spatial batches preserve world geometry and independently cull distant cells", () => {
  const material = new T.MeshStandardMaterial();
  const group = new T.Group();
  group.position.set(10, 0, 0);
  group.add(box(2, 2, 2, material, 0, 1, 0));
  group.add(box(2, 2, 2, material, 100, 1, 0));
  const result = batchStatic(group, 40);
  assert.equal(result.children.length, 2);
  const centers = result.children.map(mesh => {
    mesh.geometry.computeBoundingBox();
    return mesh.geometry.boundingBox.getCenter(new T.Vector3()).x;
  }).sort((a, b) => a - b);
  assert.deepEqual(centers, [10, 110]);
  const frustum = new T.Frustum().setFromProjectionMatrix(
    new T.Matrix4().makeOrthographic(0, 20, 10, -10, -10, 10),
  );
  result.updateMatrixWorld(true);
  assert.equal(result.children.filter(mesh => frustum.intersectsObject(mesh)).length, 1);
});

test("default batching retains a single material batch for dynamic vehicles", () => {
  const group = new T.Group();
  const material = new T.MeshStandardMaterial();
  group.add(box(1, 1, 1, material), box(1, 1, 1, material, 100));
  assert.equal(batchStatic(group).children.length, 1);
});
