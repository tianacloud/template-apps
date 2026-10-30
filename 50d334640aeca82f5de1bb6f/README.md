# Neon Coast · 霓虹海岸

A browser-native, single-player coastal driving game with cloud saves. An original coastal city with detailed concept, sedan, crossover, pickup and van models, eight drivable vehicle types, palm-lined boulevards, traffic, rigged pedestrians, and synthesized driving audio. Licensed character, vehicle and surface assets ship with the application; see `licenses/ASSETS.md`.

## Play

- W / Up: accelerate; S / Down: brake and reverse.
- A / D: steer; Space: handbrake; E: leave the car while stopped, or take over a nearby vehicle from its door.
- M: contracts; G: garage when near Coast Customs; Tab: city map.
- C: chase / hood / overhead camera; Escape: pause. Touch controls are provided on small screens.
- Complete delivery, checkpoint racing, and pursuit contracts to earn cash. Buy one of eight cars or upgrade the shared engine tuning in the garage.

## Cloud save

The application uses the Tiana Bootstrap's dynamic account authentication and `@tianacloud/serverless` to access its bound SQLite instance. `schema.sql` creates `game_saves`; the `main` row stores the complete single-player state as JSON. Each initialized application has one shared save slot in its own database. It is intended for one player at a time.

Position, vehicle ownership, cash, upgrades, distance, completed contracts, and active contract progress are saved. Mission time pauses when the game is paused or closed. The next visit resumes driving the saved car. Taking over a street vehicle changes the saved current vehicle, while garage ownership changes only on purchase. Other parked cars and traffic are recreated when the city reloads.

Contract changes, rewards, vehicle purchases, and upgrades request a save; driving progress also saves periodically. Use the save button and wait for confirmation before leaving. Failed or uncertain writes are checked with a separate read; the interface reports an unconfirmed save instead of claiming success. Restore the connection and use the save button to save the current in-memory progress.

## Initialize and build

1. Install dependencies with `npm ci`.
2. Create the application's SQLite and Git instances, then set the two IDs in `source.json`. A parameterized template declares these fields in `metadata.json`.
3. Execute `schema.sql` in the bound SQLite instance. There is no seed-data requirement. For manual development, upload the contents of `template-files/` to the application’s `template-assets/` file directory; market installation prepares them automatically.
4. Commit the source and lockfile, push to the application's Tiana Git, and verify the remote commit.
5. Build the verified commit with `npm run build -- FULL_SOURCE_COMMIT`.
6. Create a Tiana Web application with the fixed entry `assets/app.js` and the same SQLite and Git bindings. The build prints `TIANA_PROJECT_PARAMS` for these parameters.
7. Preview using `tiana web serve WEB_ID --dir dist --port 4174`, or publish with `tiana web publish WEB_ID --dir dist --json`. Check the publication receipt and the currently served archive hash.

The entry injects its own CSS and loads its display font from the application file store. The Tiana Bootstrap supplies the document, runtime, and authentication; the game is not a standalone static `index.html` application. The production entry is approximately 1.3 MB before compression; the separately installed models, textures and font add approximately 11 MB. The first load downloads these resources before enabling play. Vehicle meshes are gzip-compressed and decoded with the browser’s native DecompressionStream.

## Customize

- `src/world.js`: city layout, architecture palette, decorations, and contract routes.
- `src/models.js`: procedural vehicle variants, vegetation, and static mesh batching.
- `src/vehicle-assets.js`, `src/characters.js`: detailed vehicle and animated character loading.
- `src/wheels.js`: separate steering and rolling pivots shared by player and traffic vehicles.
- `src/physics.js`: oriented vehicle footprints, swept motion and contact sliding.
- `src/state.js`: vehicles, prices, upgrades, and mission settlement.
- `src/main.js`: game loop, driving, cameras, interface, maps, and persistence.
- `src/style.css`: title screen, HUD, dialogs, and touch controls.
- `src/audio.js`: synthesized engine, gear changes, tire slip and road noise.
- `src/db.js`: parameterized SQL and verification of uncertain writes.

Rendering requires WebGL 2. Desktop keyboard play is the primary experience; use a browser with hardware acceleration. Mobile touch layout is supported, but frame rate depends on the device. Rendering and movement run locally; SQLite handles persistent progression.

Run `npm test` for game economy, collision and wheel-axis checks. Browser acceptance should additionally cover driving, entering/leaving the car, missions, garage purchases, cloud-save reload, disconnected writes, and mobile controls with a real Tiana preview.

## Credits

The Car Concept model is by Eric Chadwick / Darmstadt Graphics Group (CC BY 4.0); sedan, crossover, pickup and van models are by Innerscene (CC0); character assets are by Quaternius (CC0); asphalt and sky lighting assets are from Poly Haven (CC0). Sources, modifications and notices are in `licenses/ASSETS.md`. Original procedural meshes and synthesized audio are included in the source. Three.js and the Tiana SDK use their package licenses. Barlow Condensed is by Jeremy Tribby, distributed under the SIL Open Font License; see `licenses/Barlow-OFL.txt`.
