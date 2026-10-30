import * as T from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";
const assets = [];
export async function loadCharacters(assetBlobs) {
  const loader = new GLTFLoader();
  assets.push(
    ...(await Promise.all(
      ["casual", "suit"].map((name) =>
        assetBlobs.get(`characters/${name}.glb`).arrayBuffer().then(bytes => loader.parseAsync(bytes, "")),
      ),
    )),
  );
}
let index = 0;
export function person() {
  const asset = assets[index++ % assets.length],
    model = clone(asset.scene),
    group = new T.Group();
  model.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  const visual = new T.Group();
  visual.add(model);
  group.add(visual);
  const mixer = new T.AnimationMixer(model),
    actions = {};
  for (const name of ["Idle", "Walk", "Run"]) {
    const clip = asset.animations.find((a) => a.name.endsWith("Man_" + name));
    actions[name.toLowerCase()] = mixer.clipAction(clip);
    actions[name.toLowerCase()].play();
    actions[name.toLowerCase()].weight = name === "Idle" ? 1 : 0;
  }
  mixer.update(0);
  model.updateMatrixWorld(true);
  const bounds = new T.Box3().setFromObject(model, true),
    size = bounds.getSize(new T.Vector3());
  visual.scale.setScalar(1.82 / size.y);
  visual.position.y = -bounds.min.y * visual.scale.y;
  group.userData = { mixer, actions };
  return group;
}
export function animatePerson(model, dt, motion = "idle", speed = 0) {
  model.userData.actions.walk.timeScale = speed / 1.4;
  for (const [name, action] of Object.entries(model.userData.actions))
    action.weight = T.MathUtils.damp(
      action.weight,
      name === motion ? 1 : 0,
      10,
      dt,
    );
  model.userData.mixer.update(dt);
}
