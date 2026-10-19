# MineVault beta: capture-first (0.1)

## Scope and limitations

This is a Java Edition 1.21.1 Fabric **local capture beta**, not a finished live cloud-integrated mod. The existing MineVault web app can save worlds, journal entries and images when connected to its own Supabase project; its demo mode is temporary.

- An advancement toast queues a **Save Moment / Skip** prompt, with J to save and K to skip. Neither action pauses gameplay.
- No screenshot is captured or written to disk unless Save Moment is pressed.
- The advancement's *event* metadata is snapshotted when the toast is queued. The PNG represents the frame at the moment **Save** is pressed, which can be later.
- Saving creates a PNG and matching JSON manifest under \`.minecraft/minevault/captures/\` on the player's computer. Nothing is uploaded by the mod.
- Player-list data comes from the game's visible multiplayer player list and may be incomplete. It is not a list of witnesses.
- Only the currently rendered camera is captured. Cinematic/replay video, Bedrock support, billing, device pairing and automatic upload are out of scope.

## Installing the Fabric client mod

1. Install Minecraft **Java Edition 1.21.1**, a Fabric Loader compatible with 1.21.1, and the Fabric API.
2. From the GitHub Actions **Build MineVault Fabric beta** workflow for this branch, download the build artifact after its build succeeds. The artifact contains the compiled mod JAR; source files are *not* themselves a mod.
3. Place that JAR in your Minecraft \`mods\` folder, then launch the Fabric profile.
4. Earn an advancement. The MineVault prompt appears at the top right. Press **J** to capture, or **K** to skip.
5. From \`.minecraft/minevault/captures/\`, find the same-name \`.json\` and \`.png\`.

## Importing into the web journal

1. Sign in to an instance of MineVault configured with its own Supabase credentials, create/open a world, and click **Add Memory**. The unauthenticated demo lets you test the form but does **not** persist across sessions.
2. Select **Import MineVault Capture (.json)** and choose the exported metadata file. This fills the title, real-world date, XYZ, Minecraft day, achievement type and story text.
3. Attach the matching PNG from the mod's captures folder using the image upload control, then click **Save memory**.
4. Review your timeline and screenshot gallery.

## Safety and privacy

- The mod does not read credentials and never sends data over the network.
- Choosing Skip discards the pending event from memory and writes **no file**.
- Imported journal descriptions contain player names, coordinates and time. Keep your journal private if this could reveal a base or server location.
- Screenshots are user-controlled and taken at Save time, so overlays and the current perspective may be visible.
- The mod does not claim to capture an exact pre-confirmation image or three simultaneous viewpoints.

## Testing checklist

- [ ] Minecraft loads with Fabric API and the MineVault mod
- [ ] An advancement shows the prompt without pausing the game
- [ ] K discards the event and creates no screenshot/manifest
- [ ] J produces a JSON manifest and matching PNG
- [ ] JSON contains the expected snapshot timestamp, location, world, player and online list
- [ ] Web import populates the journal form correctly
- [ ] Web validation refuses malformed or unrelated JSON
- [ ] A saved, imported screenshot appears under the correct world
- [ ] Verify in singleplayer and multiplayer (some servers suppress toasts or list entries)

The beta is not ready for public paid use. Verify the Fabric build and manual gameplay flow before sharing broadly.
