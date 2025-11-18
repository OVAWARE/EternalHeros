let Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');
let ClientboundSetEntityMotionPacket = Java.loadClass('net.minecraft.network.protocol.game.ClientboundSetEntityMotionPacket');

StartupEvents.registry('palladium:abilities', (event) => {
  event.create('eternalheros:burn')
    .addProperty("range", "double", 2.0, "Ignition radius")  // 🔥 now 2 block radius
    .addProperty("burnTime", "double", 2.0, "Burn time")  // 🔥 now 2 block radius

    .icon(palladium.createItemIcon('minecraft:ender_eye'))
    .tick((player, entry, holder, enabled) => {
      if (!enabled) return;

      try {
        let range = entry.getPropertyByName('range');
        let burnTime = entry.getPropertyByName('range');

        if (!player || !player.level) return;

        // Get all nearby entities in radius
        let entities = player.level.getEntities(player, player.getBoundingBox().inflate(range));

        for (let target of entities) {
          if (!target.isAlive() || target.isSpectator()) continue;
          if (target == player) continue;

          // Ignite for 5 seconds 🔥
          target.setSecondsOnFire(burnTime);

          // Sync motion for players
          if (target.isPlayer() && target.connection) {
            target.connection.send(new ClientboundSetEntityMotionPacket(target));
          }
        }
      } catch (err) {
        console.error("Groundslam ability error: " + err);
      }
    });
});
