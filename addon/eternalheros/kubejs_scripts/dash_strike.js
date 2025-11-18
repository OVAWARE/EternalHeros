// Class shortcuts
let Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3');

StartupEvents.registry('palladium:abilities', (event) => {
  event.create('eternalheros:dash_strike')
    .addProperty("dash_distance", "double", 5.0, "How far the player dashes forward")
    .addProperty("damage", "double", 6.0, "Damage dealt to entities in the path")
    .addProperty("hitbox_range", "double", 1.5, "Radius of the dash hitbox")
    .icon(palladium.createItemIcon('minecraft:diamond_sword'))
    .tick((player, entry, holder, enabled) => {
      if (!enabled) return;

      try {
        let dashDistance = entry.getPropertyByName('dash_distance');
        let damage = entry.getPropertyByName('damage');
        let hitboxRange = entry.getPropertyByName('hitbox_range');

        if (!player || !player.level) return;

        // Get player's look direction
        let lookVec = player.getLookAngle().normalize();

        // Calculate dash destination
        let dashVec = new Vec3(
          lookVec.x * dashDistance,
          lookVec.y * dashDistance,
          lookVec.z * dashDistance
        );

        // Move player forward by dash distance
        player.setPos(
          player.getX() + dashVec.x,
          player.getY() + dashVec.y,
          player.getZ() + dashVec.z
        );

        // Get entities in a hitbox (around player's new position)
        let aabb = player.getBoundingBox().inflate(hitboxRange);
        let nearbyEntities = player.level.getEntities(player, aabb);

        for (let entity of nearbyEntities) {
          if (entity.isAlive() && !entity.isSpectator() && entity != player) {
            entity.hurt(player.damageSources().playerAttack(player), damage);
          }
        }

      } catch (err) {
        console.error("Dash Strike ability error: " + err);
      }
    });
});
