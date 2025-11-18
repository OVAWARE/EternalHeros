let Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');
let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');

StartupEvents.registry('palladium:abilities', (event) => {
  event.create('eternalheros:groundslam')
    .addProperty("strength", "double", 2.0, "Force applied to the targets")
    .addProperty("range", "double", 7.0, "Max radius around the player")
    .addProperty("damage", "double", 7.0, "Damage it deals")
    .icon(palladium.createItemIcon('minecraft:ender_eye'))
    .tick((player, entry, holder, enabled) => {
      if (!enabled) return;

      try {
        let strength = entry.getPropertyByName('strength');
        let range = entry.getPropertyByName('range');
        let damage = entry.getPropertyByName('damage');

        if (!player || !player.level) return;

        // Get all nearby entities in radius
        let entities = player.level.getEntities(player, player.getBoundingBox().inflate(range));

        for (let target of entities) {
          // Skip invalid entities
          if (!target.isAlive() || target.isSpectator()) continue;
          if (target == player) continue;

          // Direction vector: from player to target
          let direction = target.position().subtract(player.position()).normalize();

          // Scale by strength for knockback
          let motionVec = direction.scale(strength);

          // Apply knockback motion
          target.setDeltaMovement(motionVec);

          // Apply damage (simulate a hit instead of direct .hurt())
          player.attack(target);

          // If you want "true damage" ignoring armor, you’ll need a custom mechanic

          // Force motion update if target is a player
          if (target.isPlayer() && target.connection) {
            target.connection.send(new ClientboundSetEntityMotionPacket(target));
          }
        }
      } catch (err) {
        console.error("Groundslam ability error: " + err);
      }
    });
});
