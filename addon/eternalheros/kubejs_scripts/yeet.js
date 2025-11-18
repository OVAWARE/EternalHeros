// It's good practice to define these at the top if used often
let Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');
let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');

StartupEvents.registry('palladium:abilities', (event) => {
  event.create('eternalheros:yeet')
    .addProperty("strength", "double", 2.0, "Force applied to the target")
    .addProperty("reach", "double", 20.0, "Max distance to target an entity")
    .icon(palladium.createItemIcon('minecraft:ender_eye'))
    .tick((player, entry, holder, enabled) => {
      if (!enabled) return;

      try {
        // Get property VALUES correctly using .get()
        let strength = entry.getPropertyByName('strength')
        let reach = entry.getPropertyByName('reach')
        
        if (!player || !player.level) return;

        // Use player.rayTrace() for much simpler and more accurate targeting
        let hitResult = player.rayTrace(reach, false); // false = don't trace through liquids

        // Check if the ray trace hit an entity
        if (hitResult && hitResult.entity) {
          let target = hitResult.entity;
          
          // Basic safety checks for the target
          if (!target.isAlive() || target.isSpectator()) return;

          // Optional: Add a custom tag check to prevent certain entities from being affected
          if (target.getTags().contains("broken_free")) return;

          // Create the motion vector correctly using the player's look direction for a "yeet"
          let motionVec = player.getLookAngle().scale(strength);
          
          // Set the target's motion
          target.setDeltaMovement(motionVec);
          
          // Server automatically syncs motion changes. Manually sending a packet is often
          // redundant but can be used to force an immediate update if needed.
          if (target.isPlayer() && target.connection) {
             target.connection.send(new ClientboundSetEntityMotionPacket(target));
          }

        }
      } catch (err) {
        // *** THIS IS THE CORRECTED LINE ***
        console.error("Telekinesis ('yeet') ability error: " + err);
      }
    });
});